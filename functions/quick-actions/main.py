import logging
from flask import Request, jsonify
import zcatalyst_sdk

def handler(request: Request):
    app = zcatalyst_sdk.initialize()
    logger = logging.getLogger(__name__)
    try:
        # Health check for GET
        if request.method == 'GET':
            return jsonify({
                'success': True,
                'data': {
                    'message': 'quick-actions OK',
                    'path': request.path,
                    'method': request.method
                }
            }), 200

        # Basic router for POST actions used by Next.js API
        if request.method == 'POST':
            body = request.get_json(silent=True) or {}
            action = (body.get('action') or '').strip()
            params = body.get('params') or {}

            # Minimal stubs that satisfy the unified quick actions contract
            if action == 'getRecentNotes':
                return jsonify({'success': True, 'data': []}), 200
            if action == 'getPendingTasks':
                return jsonify({'success': True, 'data': []}), 200
            if action == 'getUpcomingAppointments':
                return jsonify({'success': True, 'data': []}), 200
            if action == 'getQuickStats':
                return jsonify({'success': True, 'data': {'notes': 0, 'tasks': 0, 'appointments': 0}}), 200
            if action == 'getRecentActivities':
                return jsonify({'success': True, 'data': []}), 200

            # Shift-notes bridge actions (used by /api/v1/shift-notes fallback)
            if action == 'getShiftNotes':
                return jsonify({'success': True, 'data': []}), 200
            if action == 'createShiftNote':
                return jsonify({'success': True, 'data': {**params, 'ROWID': 'sn_stub'}}), 200

            if action == 'createQuickNote':
                return jsonify({'success': True, 'data': {**params, 'id': 'note_'}}), 200
            if action == 'createQuickTask':
                return jsonify({'success': True, 'data': {**params, 'id': 'task_'}}), 200
            if action == 'createQuickAppointment':
                return jsonify({'success': True, 'data': {**params, 'id': 'appt_'}}), 200
            if action == 'quickCreateContact':
                return jsonify({'success': True, 'data': {**params, 'id': 'contact_'}}), 200
            if action == 'quickCreateLead':
                return jsonify({'success': True, 'data': {**params, 'id': 'lead_'}}), 200
            if action == 'recordPayment':
                return jsonify({'success': True, 'data': {**params, 'id': 'payment_'}}), 200
            if action == 'generateReport':
                return jsonify({'success': True, 'data': {**params, 'id': 'report_'}}), 200
            if action == 'trackExpense':
                return jsonify({'success': True, 'data': {**params, 'id': 'expense_'}}), 200
            if action == 'triggerWorkflow':
                return jsonify({'success': True, 'data': {**params, 'status': 'triggered'}}), 200
            if action == 'updateAvailability':
                return jsonify({'success': True, 'data': {**params, 'status': 'updated'}}), 200

            # Unified UI actions (primary/quick actions)
            if action == 'scheduleAppointment':
                return jsonify({'success': True, 'data': {**params, 'id': 'appt_'}}), 200
            if action == 'messageTeam':
                return jsonify({'success': True, 'data': {**params, 'status': 'sent'}}), 200
            if action == 'startVideoCall':
                return jsonify({'success': True, 'data': {**params, 'room': 'video_stub'}}), 200
            if action == 'viewCareProgress':
                return jsonify({'success': True, 'data': { 'progress': [] }}), 200

            if action == 'completeTask':
                return jsonify({'success': True, 'data': {**params, 'status': 'completed'}}), 200
            if action == 'updateNote':
                return jsonify({'success': True, 'data': {**params, 'status': 'updated'}}), 200
            if action == 'rescheduleAppointment':
                return jsonify({'success': True, 'data': {**params, 'status': 'rescheduled'}}), 200
            if action == 'updateStatus':
                return jsonify({'success': True, 'data': {**params, 'status': 'updated'}}), 200

            return jsonify({'success': False, 'error': {'message': f'Unknown action: {action}'}}), 400

        return jsonify({'success': False, 'error': {'message': 'Method not allowed'}}), 405
    except Exception:
        logger.exception('quick-actions error')
        return jsonify({'success': False, 'error': {'message': 'Internal server error'}}), 500
