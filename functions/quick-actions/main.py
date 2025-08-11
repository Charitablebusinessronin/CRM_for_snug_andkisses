import logging
from flask import Request, jsonify
import zcatalyst_sdk

def handler(request: Request):
    app = zcatalyst_sdk.initialize()
    logger = logging.getLogger(__name__)
    try:
        return jsonify({
            'status': 'success',
            'message': 'quick-actions is working',
            'path': request.path,
            'method': request.method
        }), 200
    except Exception:
        logger.exception('quick-actions error')
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500
