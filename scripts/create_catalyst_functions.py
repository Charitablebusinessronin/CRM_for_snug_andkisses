import os
import json
from pathlib import Path

# Base project paths
PROJECT_ROOT = Path(__file__).resolve().parents[1]
FUNCTIONS_DIR = PROJECT_ROOT / 'catalyst' / 'functions'

# Functions to scaffold
FUNCTION_DEFS = {
    'workflow-state-manager': {
        'description': 'Workflow state management for all user types',
        'actions': ['initializeState', 'transitionState', 'validateTransition', 'getStateDetails']
    },
    'contract-management': {
        'description': 'Contract management and processing system',
        'actions': ['initiate', 'generate', 'processSignature', 'getStatus']
    },
    'document-processor': {
        'description': 'Document processing and template management',
        'actions': ['setupTemplate', 'getTemplates', 'mergeData', 'analyzeDocument']
    },
    'onboarding-automation': {
        'description': 'Client onboarding automation system',
        'actions': ['welcomeSequence', 'doulaIntroduction', 'getStatus']
    },
    'zia-intelligence': {
        'description': 'Zia AI intelligence integration',
        'actions': ['documentAnalysis', 'workflowIntelligence', 'contentGeneration', 'predictiveAnalytics']
    },
    'notification-handler': {
        'description': 'System notification management',
        'actions': ['sendNotification', 'getNotifications', 'markAsRead']
    },
    'analytics-engine': {
        'description': 'Analytics and reporting engine',
        'actions': ['getDashboardMetrics', 'generateReport', 'getActivityTimeline']
    },
}

# Skip functions that already exist
EXISTING = set([p.name for p in FUNCTIONS_DIR.glob('*') if p.is_dir()])

# Express-based Advanced I/O template (aligned with existing quick-actions style)
INDEX_JS_TEMPLATE = """/*
  __NAME__: Catalyst Advanced I/O HTTP entrypoint
  Exposes a single POST endpoint expecting: { action: string, params: object }
  Routes to action handlers.
  Replace stubs with real Zoho integrations as needed.
*/

const express = require('express')
const app = express()
app.use(express.json({ limit: '1mb' }))

function ok(data) { return { success: true, data } }
function err(message, details) { return { success: false, error: message, details } }
function hipaaAudit(action, details = {}) {
  try { console.log(JSON.stringify({ ts: new Date().toISOString(), action, details })) }
  catch (_) { console.log(JSON.stringify({ ts: new Date().toISOString(), action, details: 'unserializable' })) }
}

// Action handlers
const handlers = {
__HANDLERS__
}

app.post('/', async (req, res) => {
  try {
    const { action, params } = req.body || {}
    if (!action || typeof action !== 'string') return res.status(400).json(err('Missing action'))
    const handler = handlers[action]
    if (!handler) return res.status(400).json(err('Unknown action', { action }))
    const result = await handler(params || {})
    return res.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    hipaaAudit('FUNCTION_ERROR', { error: message })
    return res.status(500).json(err('Internal error'))
  }
})

app.get('/health', (_req, res) => res.json({ ok: true }))
module.exports = app

if (require.main === module) {
  const PORT = process.env.PORT || 8081
  app.listen(PORT, () => console.log('__NAME__ listening on :' + PORT))
}
"""

HANDLER_STUB = """
  async {action}(params) {{
    hipaaAudit('{audit}', params || {{}})
    return ok({{ message: '{action} implementation pending', params }})
  }}
"""

def PACKAGE_JSON_TEMPLATE(name: str, description: str) -> dict:
    return {
        "name": name,
        "version": "1.0.0",
        "description": description,
        "main": "index.js",
        "license": "UNLICENSED",
        "dependencies": {
            "express": "^4.19.2"
        }
    }


def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)


def scaffold_function(name: str, description: str, actions: list[str]):
    func_dir = FUNCTIONS_DIR / name
    if func_dir.exists():
        print(f"[SKIP] {name} already exists")
        return False

    ensure_dir(func_dir)

    # Build handlers block
    handler_blocks = []
    for a in actions:
        handler_blocks.append(HANDLER_STUB.format(action=a, audit=f"{name.upper()}_{a.upper()}"))
    handlers_str = ",\n".join(handler_blocks)

    # Write index.js (use safe placeholder replacement)
    index_js = INDEX_JS_TEMPLATE.replace('__NAME__', name).replace('__HANDLERS__', handlers_str)
    (func_dir / 'index.js').write_text(index_js, encoding='utf-8')

    # Write package.json
    pkg = PACKAGE_JSON_TEMPLATE(name, description)
    (func_dir / 'package.json').write_text(json.dumps(pkg, indent=2), encoding='utf-8')

    print(f"[OK] Created {name}")
    return True


def main():
    ensure_dir(FUNCTIONS_DIR)

    created = 0
    for name, meta in FUNCTION_DEFS.items():
        if name in EXISTING:
            print(f"[SKIP] {name} (already present)")
            continue
        if scaffold_function(name, meta['description'], meta['actions']):
            created += 1

    print(f"\nDone. Created: {created}, Skipped: {len(EXISTING)}")


if __name__ == '__main__':
    main()
