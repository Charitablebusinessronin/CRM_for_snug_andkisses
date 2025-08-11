import logging
from datetime import datetime
from flask import Request, jsonify
import zcatalyst_sdk

def handler(request: Request):
    app = zcatalyst_sdk.initialize()
    logger = logging.getLogger(__name__)
    try:
        ds = app.datastore()
        table = ds.table('CRM_Contacts')

        if request.path == '/contacts' and request.method == 'GET':
            rows = table.get_all_rows()
            return jsonify({
                'status': 'success',
                'data': rows,
                'count': len(rows),
                'source': 'catalyst_native'
            }), 200

        if request.path == '/contacts' and request.method == 'POST':
            payload = request.get_json(silent=True) or {}
            payload['created_date'] = datetime.utcnow().isoformat()
            payload.setdefault('status', 'active')
            created = table.insert_row(payload)
            return jsonify({'status': 'success', 'data': created}), 201

        if request.path.startswith('/contacts/') and request.method == 'PUT':
            contact_id = request.path.split('/')[-1]
            update = request.get_json(silent=True) or {}
            update['ROWID'] = contact_id
            update['updated_date'] = datetime.utcnow().isoformat()
            updated = table.update_row(update)
            return jsonify({'status': 'success', 'data': updated}), 200

        return jsonify({'status': 'error', 'message': 'Not Found'}), 404
    except Exception as e:
        logger.exception('contact-manager error')
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
