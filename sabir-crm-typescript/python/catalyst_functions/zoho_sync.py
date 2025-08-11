#!/usr/bin/env python3
"""
Zoho Catalyst Function - Data Synchronization
Python-based automation for Zoho CRM, Books, and Analytics integration
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

import requests
from zcatalyst import catalyst
from dotenv import load_dotenv
import pandas as pd

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ZohoSyncService:
    """
    Python-based Zoho synchronization service for Catalyst Functions
    Handles CRM, Books, and Analytics data synchronization
    """

    def __init__(self):
        self.config = {
            'crm_client_id': os.getenv('ZOHO_CRM_CLIENT_ID'),
            'crm_client_secret': os.getenv('ZOHO_CRM_CLIENT_SECRET'),
            'crm_refresh_token': os.getenv('ZOHO_CRM_REFRESH_TOKEN'),
            'books_org_id': os.getenv('ZOHO_BOOKS_ORG_ID'),
            'analytics_org_id': os.getenv('ZOHO_ANALYTICS_ORG_ID'),
            'environment': os.getenv('ZOHO_ENVIRONMENT', 'sandbox'),
            'domain': os.getenv('ZOHO_DOMAIN', 'com')
        }
        
        self.base_urls = {
            'crm': f"https://www.zohoapis.{self.config['domain']}/crm/v6",
            'books': f"https://www.zohoapis.{self.config['domain']}/books/v3",
            'analytics': f"https://analyticsapi.zoho.{self.config['domain']}/restapi/v2",
            'oauth': f"https://accounts.zoho.{self.config['domain']}/oauth/v2/token"
        }
        
        self.access_tokens = {}
        
        # Initialize Catalyst app
        try:
            self.catalyst_app = catalyst.initialize()
            logger.info("Catalyst app initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Catalyst app: {e}")
            self.catalyst_app = None

    def get_access_token(self, service: str = 'crm') -> Optional[str]:
        """Get or refresh access token for Zoho service"""
        try:
            data = {
                'refresh_token': self.config['crm_refresh_token'],
                'client_id': self.config['crm_client_id'],
                'client_secret': self.config['crm_client_secret'],
                'grant_type': 'refresh_token'
            }
            
            response = requests.post(
                self.base_urls['oauth'],
                data=data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=30
            )
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get('access_token')
                
                if access_token:
                    self.access_tokens[service] = access_token
                    logger.info(f"Access token refreshed for {service}")
                    return access_token
                    
            logger.error(f"Failed to refresh token for {service}: {response.text}")
            return None
            
        except Exception as e:
            logger.error(f"Error refreshing token for {service}: {e}")
            return None

    def make_api_request(self, service: str, endpoint: str, method: str = 'GET', 
                        data: Optional[Dict] = None, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make authenticated API request to Zoho service"""
        access_token = self.get_access_token(service)
        if not access_token:
            return None
            
        url = f"{self.base_urls[service]}/{endpoint.lstrip('/')}"
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data, params=params, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=data, params=params, timeout=30)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers, params=params, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"API request failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error making API request to {service}/{endpoint}: {e}")
            return None

    def sync_crm_contacts(self, page: int = 1, per_page: int = 200) -> Dict[str, Any]:
        """Sync CRM contacts data"""
        logger.info(f"Syncing CRM contacts - page {page}, per_page {per_page}")
        
        params = {
            'page': page,
            'per_page': per_page,
            'sort_by': 'Modified_Time',
            'sort_order': 'desc'
        }
        
        response = self.make_api_request('crm', 'Contacts', params=params)
        
        if response and 'data' in response:
            contacts = response['data']
            info = response.get('info', {})
            
            # Process contacts for analytics
            processed_contacts = self.process_contacts_for_analytics(contacts)
            
            # Store in Catalyst datastore if available
            if self.catalyst_app and processed_contacts:
                self.store_in_catalyst_datastore('crm_contacts', processed_contacts)
            
            result = {
                'success': True,
                'contacts_synced': len(contacts),
                'has_more': info.get('more_records', False),
                'page': page,
                'processed_count': len(processed_contacts),
                'last_modified': contacts[0].get('Modified_Time') if contacts else None
            }
            
            logger.info(f"CRM contacts sync completed: {result}")
            return result
        else:
            return {
                'success': False,
                'error': 'Failed to fetch CRM contacts',
                'contacts_synced': 0
            }

    def sync_crm_leads(self, page: int = 1, per_page: int = 200) -> Dict[str, Any]:
        """Sync CRM leads data"""
        logger.info(f"Syncing CRM leads - page {page}, per_page {per_page}")
        
        params = {
            'page': page,
            'per_page': per_page,
            'sort_by': 'Modified_Time',
            'sort_order': 'desc'
        }
        
        response = self.make_api_request('crm', 'Leads', params=params)
        
        if response and 'data' in response:
            leads = response['data']
            info = response.get('info', {})
            
            # Process leads for analytics
            processed_leads = self.process_leads_for_analytics(leads)
            
            # Store in Catalyst datastore if available
            if self.catalyst_app and processed_leads:
                self.store_in_catalyst_datastore('crm_leads', processed_leads)
            
            result = {
                'success': True,
                'leads_synced': len(leads),
                'has_more': info.get('more_records', False),
                'page': page,
                'processed_count': len(processed_leads),
                'conversion_opportunities': sum(1 for lead in leads if lead.get('Lead_Status') == 'Qualified')
            }
            
            logger.info(f"CRM leads sync completed: {result}")
            return result
        else:
            return {
                'success': False,
                'error': 'Failed to fetch CRM leads',
                'leads_synced': 0
            }

    def sync_books_data(self) -> Dict[str, Any]:
        """Sync Zoho Books financial data"""
        if not self.config['books_org_id']:
            return {
                'success': False,
                'error': 'Books organization ID not configured'
            }
            
        logger.info("Syncing Zoho Books data")
        
        # Get invoices
        params = {'organization_id': self.config['books_org_id']}
        invoices_response = self.make_api_request('books', 'invoices', params=params)
        
        # Get customers
        customers_response = self.make_api_request('books', 'contacts', params=params)
        
        result = {
            'success': True,
            'invoices_synced': 0,
            'customers_synced': 0,
            'total_revenue': 0.0
        }
        
        if invoices_response and 'invoices' in invoices_response:
            invoices = invoices_response['invoices']
            result['invoices_synced'] = len(invoices)
            result['total_revenue'] = sum(float(inv.get('total', 0)) for inv in invoices)
            
            # Store in Catalyst datastore
            if self.catalyst_app:
                self.store_in_catalyst_datastore('books_invoices', invoices)
        
        if customers_response and 'contacts' in customers_response:
            customers = customers_response['contacts']
            result['customers_synced'] = len(customers)
            
            # Store in Catalyst datastore
            if self.catalyst_app:
                self.store_in_catalyst_datastore('books_customers', customers)
        
        logger.info(f"Books sync completed: {result}")
        return result

    def process_contacts_for_analytics(self, contacts: List[Dict]) -> List[Dict]:
        """Process contacts data for analytics and reporting"""
        processed = []
        
        for contact in contacts:
            processed_contact = {
                'id': contact.get('id'),
                'full_name': f"{contact.get('First_Name', '')} {contact.get('Last_Name', '')}".strip(),
                'email': contact.get('Email'),
                'phone': contact.get('Phone') or contact.get('Mobile'),
                'account_name': contact.get('Account_Name'),
                'lead_source': contact.get('Lead_Source'),
                'created_time': contact.get('Created_Time'),
                'modified_time': contact.get('Modified_Time'),
                'owner_name': contact.get('Owner', {}).get('name') if contact.get('Owner') else None,
                # Analytics fields
                'contact_type': self.categorize_contact(contact),
                'engagement_score': self.calculate_engagement_score(contact),
                'last_activity': self.get_last_activity_date(contact)
            }
            processed.append(processed_contact)
        
        return processed

    def process_leads_for_analytics(self, leads: List[Dict]) -> List[Dict]:
        """Process leads data for analytics and reporting"""
        processed = []
        
        for lead in leads:
            processed_lead = {
                'id': lead.get('id'),
                'full_name': f"{lead.get('First_Name', '')} {lead.get('Last_Name', '')}".strip(),
                'company': lead.get('Company'),
                'email': lead.get('Email'),
                'phone': lead.get('Phone') or lead.get('Mobile'),
                'lead_source': lead.get('Lead_Source'),
                'lead_status': lead.get('Lead_Status'),
                'industry': lead.get('Industry'),
                'annual_revenue': lead.get('Annual_Revenue'),
                'no_of_employees': lead.get('No_of_Employees'),
                'created_time': lead.get('Created_Time'),
                'modified_time': lead.get('Modified_Time'),
                'owner_name': lead.get('Owner', {}).get('name') if lead.get('Owner') else None,
                # Analytics fields
                'lead_score': self.calculate_lead_score(lead),
                'conversion_probability': self.calculate_conversion_probability(lead),
                'days_in_pipeline': self.calculate_days_in_pipeline(lead)
            }
            processed.append(processed_lead)
        
        return processed

    def categorize_contact(self, contact: Dict) -> str:
        """Categorize contact based on available data"""
        if contact.get('Account_Name'):
            return 'Business'
        elif contact.get('Lead_Source') == 'Website':
            return 'Web Lead'
        elif contact.get('Lead_Source') == 'Referral':
            return 'Referral'
        else:
            return 'Individual'

    def calculate_engagement_score(self, contact: Dict) -> int:
        """Calculate engagement score for contact (0-100)"""
        score = 50  # Base score
        
        if contact.get('Email'):
            score += 20
        if contact.get('Phone') or contact.get('Mobile'):
            score += 15
        if contact.get('Account_Name'):
            score += 10
        if contact.get('Lead_Source'):
            score += 5
            
        return min(100, score)

    def calculate_lead_score(self, lead: Dict) -> int:
        """Calculate lead score based on various factors (0-100)"""
        score = 30  # Base score
        
        # Company size scoring
        employees = lead.get('No_of_Employees', 0)
        if employees:
            if employees > 100:
                score += 20
            elif employees > 50:
                score += 15
            elif employees > 10:
                score += 10
        
        # Revenue scoring
        revenue = lead.get('Annual_Revenue', 0)
        if revenue:
            if revenue > 1000000:
                score += 25
            elif revenue > 500000:
                score += 20
            elif revenue > 100000:
                score += 15
        
        # Industry scoring
        if lead.get('Industry') in ['Healthcare', 'Technology', 'Finance']:
            score += 10
        
        # Lead source scoring
        source = lead.get('Lead_Source', '')
        if source == 'Referral':
            score += 15
        elif source == 'Website':
            score += 10
        elif source == 'Social Media':
            score += 8
        
        return min(100, score)

    def calculate_conversion_probability(self, lead: Dict) -> float:
        """Calculate probability of lead conversion (0.0-1.0)"""
        status = lead.get('Lead_Status', '')
        
        status_probabilities = {
            'Not Contacted': 0.1,
            'Contacted': 0.3,
            'Qualified': 0.7,
            'Unqualified': 0.05,
            'Converted': 1.0
        }
        
        return status_probabilities.get(status, 0.1)

    def calculate_days_in_pipeline(self, lead: Dict) -> int:
        """Calculate number of days lead has been in pipeline"""
        created_time = lead.get('Created_Time')
        if not created_time:
            return 0
        
        try:
            from datetime import datetime
            created_dt = datetime.fromisoformat(created_time.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            return (now - created_dt).days
        except:
            return 0

    def get_last_activity_date(self, record: Dict) -> Optional[str]:
        """Get last activity date for a record"""
        return record.get('Modified_Time') or record.get('Created_Time')

    def store_in_catalyst_datastore(self, table_name: str, data: List[Dict]) -> bool:
        """Store processed data in Catalyst datastore"""
        if not self.catalyst_app or not data:
            return False
        
        try:
            datastore = self.catalyst_app.datastore()
            table = datastore.table(table_name)
            
            # Insert data in batches of 100
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i+batch_size]
                table.insert_rows(batch)
                logger.info(f"Inserted batch of {len(batch)} records into {table_name}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store data in Catalyst datastore: {e}")
            return False

    def generate_sync_report(self, sync_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive sync report"""
        report = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'environment': self.config['environment'],
            'summary': {
                'total_operations': len(sync_results),
                'successful_operations': sum(1 for result in sync_results.values() if result.get('success')),
                'failed_operations': sum(1 for result in sync_results.values() if not result.get('success'))
            },
            'details': sync_results,
            'recommendations': self.generate_recommendations(sync_results)
        }
        
        return report

    def generate_recommendations(self, sync_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on sync results"""
        recommendations = []
        
        # Check for failed syncs
        failed_syncs = [name for name, result in sync_results.items() if not result.get('success')]
        if failed_syncs:
            recommendations.append(f"Review failed synchronizations: {', '.join(failed_syncs)}")
        
        # Check for low lead conversion
        leads_result = sync_results.get('leads_sync')
        if leads_result and leads_result.get('success'):
            conversion_ops = leads_result.get('conversion_opportunities', 0)
            total_leads = leads_result.get('leads_synced', 0)
            if total_leads > 0 and (conversion_ops / total_leads) < 0.2:
                recommendations.append("Low lead qualification rate detected - review lead scoring criteria")
        
        # Check for Books integration
        books_result = sync_results.get('books_sync')
        if not books_result or not books_result.get('success'):
            recommendations.append("Configure Zoho Books integration for financial reporting")
        
        if not recommendations:
            recommendations.append("All systems operating normally")
        
        return recommendations


# Catalyst Function Entry Points
def sync_all_data(request, response):
    """
    Catalyst Function: Complete data synchronization
    Triggered via Catalyst scheduler or API call
    """
    try:
        sync_service = ZohoSyncService()
        
        # Perform all synchronizations
        sync_results = {}
        
        # Sync CRM data
        sync_results['contacts_sync'] = sync_service.sync_crm_contacts()
        sync_results['leads_sync'] = sync_service.sync_crm_leads()
        
        # Sync Books data if configured
        sync_results['books_sync'] = sync_service.sync_books_data()
        
        # Generate comprehensive report
        report = sync_service.generate_sync_report(sync_results)
        
        response.set_status_code(200)
        response.set_content_type('application/json')
        return response.send(json.dumps(report, indent=2))
        
    except Exception as e:
        logger.error(f"Sync all data function failed: {e}")
        error_response = {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        response.set_status_code(500)
        response.set_content_type('application/json')
        return response.send(json.dumps(error_response))


def sync_crm_only(request, response):
    """
    Catalyst Function: CRM-only synchronization
    For frequent CRM data updates
    """
    try:
        sync_service = ZohoSyncService()
        
        # Get pagination parameters from request
        request_data = json.loads(request.get_content()) if request.get_content() else {}
        page = request_data.get('page', 1)
        per_page = request_data.get('per_page', 200)
        
        # Sync CRM data only
        contacts_result = sync_service.sync_crm_contacts(page, per_page)
        leads_result = sync_service.sync_crm_leads(page, per_page)
        
        result = {
            'success': True,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'contacts': contacts_result,
            'leads': leads_result,
            'total_records': contacts_result.get('contacts_synced', 0) + leads_result.get('leads_synced', 0)
        }
        
        response.set_status_code(200)
        response.set_content_type('application/json')
        return response.send(json.dumps(result, indent=2))
        
    except Exception as e:
        logger.error(f"CRM sync function failed: {e}")
        error_response = {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        response.set_status_code(500)
        response.set_content_type('application/json')
        return response.send(json.dumps(error_response))


if __name__ == "__main__":
    # For local testing
    sync_service = ZohoSyncService()
    
    print("Testing Zoho synchronization service...")
    
    # Test CRM sync
    contacts_result = sync_service.sync_crm_contacts(page=1, per_page=10)
    print(f"Contacts sync result: {contacts_result}")
    
    leads_result = sync_service.sync_crm_leads(page=1, per_page=10)
    print(f"Leads sync result: {leads_result}")
    
    # Test Books sync if configured
    books_result = sync_service.sync_books_data()
    print(f"Books sync result: {books_result}")
    
    print("Testing completed successfully!")