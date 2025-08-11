import logging
from datetime import datetime
from flask import Request, jsonify
import zcatalyst_sdk

def handler(request: Request):
    app = zcatalyst_sdk.initialize()
    logger = logging.getLogger(__name__)
    try:
        ds = app.datastore()
        cache = app.cache().segment()

        if request.path == '/analytics/dashboard':
            cached = cache.get('dashboard_analytics')
            if cached:
                return jsonify({'status': 'success', 'data': cached, 'source': 'cache'}), 200

            contacts = ds.table('CRM_Contacts').get_all_rows()
            leads = ds.table('CRM_Leads').get_all_rows()

            active_contacts = [c for c in contacts if c.get('status') == 'active']
            converted_leads = [l for l in leads if l.get('status') == 'converted']

            data = {
                'contacts': {'total': len(contacts), 'active': len(active_contacts)},
                'leads': {
                    'total': len(leads),
                    'converted': len(converted_leads),
                    'conversion_rate': (len(converted_leads) / len(leads) * 100) if leads else 0,
                },
                'generated_at': datetime.utcnow().isoformat(),
            }
            cache.put('dashboard_analytics', data, 1800)
            return jsonify({'status': 'success', 'data': data, 'source': 'fresh'}), 200

        return jsonify({'status': 'error', 'message': 'Not Found'}), 404
    except Exception:
        logger.exception('analytics-engine error')
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
