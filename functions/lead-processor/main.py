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
        table = ds.table('CRM_Leads')

        if request.path == '/leads/process' and request.method == 'POST':
            pending = table.get_all_rows({
                'where': [{ 'column_name': 'status', 'comparator': 'is', 'value': 'pending' }]
            })
            count = 0
            for lead in pending:
                upd = {
                    'ROWID': lead['ROWID'],
                    'status': 'processed',
                    'processed_date': datetime.utcnow().isoformat(),
                    'processed_by': 'catalyst_automation',
                }
                table.update_row(upd)
                count += 1
            cache.put('last_processed_count', count, 3600)
            return jsonify({'status': 'success', 'message': f'Processed {count} leads', 'count': count}), 200

        if request.path == '/leads' and request.method == 'GET':
            rows = table.get_all_rows()
            return jsonify({'status': 'success', 'data': rows, 'count': len(rows)}), 200

        return jsonify({'status': 'error', 'message': 'Not Found'}), 404
    except Exception:
        logger.exception('lead-processor error')
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
