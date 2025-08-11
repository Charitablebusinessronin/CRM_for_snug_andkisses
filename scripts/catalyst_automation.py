#!/usr/bin/env python3
"""
Catalyst Function Automation Script (Python)
- Creates Python Advanced I/O functions with proper structure
- Writes per-function catalyst-config.json
- Runs DataStore setup via existing Node script (deploy-database.js)
- Deploys functions using Catalyst CLI

Usage (PowerShell):
  # Ensure your virtualenv is active and Catalyst CLI is logged in
  # .\\catalyst_env\\Scripts\\Activate.ps1
  # catalyst auth:login  (if not already logged in)
  # python scripts/catalyst_automation.py
"""
import json
import logging
import os
import shutil
import subprocess
from pathlib import Path
from typing import List

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO),
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

REQUIRED_ENV_VARS = [
    "ZOHO_CLIENT_ID",
    "ZOHO_CLIENT_SECRET",
    "ZOHO_REFRESH_TOKEN",
    "CATALYST_PROJECT_ID",
]

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FUNCTIONS_DIR = PROJECT_ROOT / "functions"
NODE_DATASTORE_SCRIPT = PROJECT_ROOT / "deploy-database.js"

# Function list to create/deploy (python)
FUNCTIONS_TO_DEPLOY = [
    "contact-manager",
    "lead-processor",
    "analytics-engine",
    "quick-actions",
]


def run(cmd: List[str], cwd: Path | None = None, check: bool = True) -> subprocess.CompletedProcess:
    logger.debug("Running: %s", " ".join(cmd))
    return subprocess.run(cmd, cwd=str(cwd) if cwd else None, capture_output=True, text=True, check=check)


def verify_environment() -> None:
    missing = [k for k in REQUIRED_ENV_VARS if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing environment variables: {missing}")

    # Optional: ensure Catalyst CLI exists
    try:
        res = run(["catalyst", "--version"], check=False)
        if res.returncode != 0:
            logger.warning("Catalyst CLI not found in PATH. Please install/login before deploying.")
        else:
            logger.info("Catalyst CLI: %s", res.stdout.strip())
    except FileNotFoundError:
        logger.warning("Catalyst CLI not found in PATH. Please install/login before deploying.")

    logger.info("✅ Environment verification complete")


def cleanup_old_dirs() -> None:
    # Remove earlier placeholder dirs if present
    to_remove = [
        "contact_manager",
        "lead_processor",
        "analytics_engine",
        "health_check",
    ]
    removed = []
    for name in to_remove:
        p = FUNCTIONS_DIR / name
        if p.exists():
            shutil.rmtree(p)
            removed.append(name)
    if removed:
        logger.info("🧹 Removed old directories: %s", ", ".join(removed))


def ensure_dirs() -> None:
    FUNCTIONS_DIR.mkdir(parents=True, exist_ok=True)


def function_config(name: str) -> dict:
    # Advanced I/O Python function config
    return {
        "name": name,
        "type": "advancedio",  # Catalyst expects 'advancedio'
        "runtime": "python3",
        "handler": "main.handler",
        "source": "main.py",
        "memory": 512,
        "timeout": 60,
        "environment_variables": {
            "LOG_LEVEL": LOG_LEVEL.lower(),
        },
    }


def write_function_files(func_dir: Path, name: str, code: str) -> None:
    (func_dir / "main.py").write_text(code, encoding="utf-8")
    (func_dir / "catalyst-config.json").write_text(
        json.dumps(function_config(name), indent=2), encoding="utf-8"
    )


def gen_code_contact_manager() -> str:
    return (
        """
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
"""
    ).lstrip()


def gen_code_lead_processor() -> str:
    return (
        """
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
"""
    ).lstrip()


def gen_code_analytics_engine() -> str:
    return (
        """
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
"""
    ).lstrip()


def gen_code_generic(name: str) -> str:
    return (
        f"""
import logging
from flask import Request, jsonify
import zcatalyst_sdk

def handler(request: Request):
    app = zcatalyst_sdk.initialize()
    logger = logging.getLogger(__name__)
    try:
        return jsonify({{
            'status': 'success',
            'message': '{name} is working',
            'path': request.path,
            'method': request.method
        }}), 200
    except Exception:
        logger.exception('{name} error')
        return jsonify({{'status': 'error', 'message': 'Internal server error'}}), 500
"""
    ).lstrip()


def generate_function_code(name: str) -> str:
    if name == "contact-manager":
        return gen_code_contact_manager()
    if name == "lead-processor":
        return gen_code_lead_processor()
    if name == "analytics-engine":
        return gen_code_analytics_engine()
    return gen_code_generic(name)


def create_function_structure(name: str) -> Path:
    func_dir = FUNCTIONS_DIR / name
    func_dir.mkdir(parents=True, exist_ok=True)
    code = generate_function_code(name)
    write_function_files(func_dir, name, code)
    logger.info("✅ Created function: %s", name)
    return func_dir


def setup_datastore_tables_via_node() -> None:
    if not NODE_DATASTORE_SCRIPT.exists():
        logger.warning("DataStore setup script not found: %s", NODE_DATASTORE_SCRIPT)
        return
    try:
        res = run(["node", str(NODE_DATASTORE_SCRIPT)], cwd=PROJECT_ROOT, check=True)
        logger.info("✅ DataStore setup complete")
        if res.stdout:
            logger.debug(res.stdout)
        if res.stderr:
            logger.debug(res.stderr)
    except subprocess.CalledProcessError as e:
        logger.error("❌ DataStore setup failed: %s", e.stderr)


def deploy_function(name: str, func_dir: Path) -> None:
    # Try non-interactive first; if it fails, fallback to interactive in the dir
    try:
        res = run(["catalyst", "functions:deploy", "--name", name], cwd=PROJECT_ROOT, check=True)
        logger.info("✅ Deployed %s (non-interactive)", name)
        if res.stdout:
            logger.debug(res.stdout)
        return
    except subprocess.CalledProcessError:
        logger.warning("Non-interactive deploy failed for %s, trying in function directory", name)

    try:
        res = run(["catalyst", "functions:deploy"], cwd=func_dir, check=True)
        logger.info("✅ Deployed %s", name)
        if res.stdout:
            logger.debug(res.stdout)
    except subprocess.CalledProcessError as e:
        logger.error("❌ Deployment failed for %s: %s", name, e.stderr)
        raise


def test_deployment() -> None:
    for cmd in (["catalyst", "functions:list"], ["catalyst", "project:details"]):
        try:
            res = run(cmd, cwd=PROJECT_ROOT, check=True)
            logger.info("✅ %s: ok", " ".join(cmd))
            if res.stdout:
                logger.debug(res.stdout)
        except subprocess.CalledProcessError as e:
            logger.error("❌ %s: %s", " ".join(cmd), e.stderr)


def main() -> None:
    logger.info("🚀 Starting Catalyst Function Automation (Python)")
    verify_environment()
    ensure_dirs()
    cleanup_old_dirs()

    # Create/refresh function structures
    created_dirs: dict[str, Path] = {}
    for name in FUNCTIONS_TO_DEPLOY:
        created_dirs[name] = create_function_structure(name)

    # DataStore setup via existing Node script (idempotent)
    setup_datastore_tables_via_node()

    # Deploy functions
    for name, p in created_dirs.items():
        try:
            deploy_function(name, p)
        except Exception:
            # Continue deploying others even if one fails
            continue

    logger.info("✅ Automation complete")
    test_deployment()


if __name__ == "__main__":
    main()
