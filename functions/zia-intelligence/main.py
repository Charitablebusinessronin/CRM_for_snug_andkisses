import logging
from flask import Request, jsonify
import zcatalyst_sdk


def handler(request: Request):
    app = zcatalyst_sdk.initialize()
    logger = logging.getLogger(__name__)
    try:
        body = request.get_json(silent=True) or {}
        message = body.get('message') or ''
        user_id = body.get('userId') or 'anonymous'

        # Minimal echo-style response to validate plumbing
        reply = f"ZIA (stub) received: {message[:200]}"

        return jsonify({
            'success': True,
            'response': reply,
            'userId': user_id
        }), 200
    except Exception:
        logger.exception('zia-intelligence error')
        return jsonify({'success': False, 'error': {'message': 'Internal server error'}}), 500
