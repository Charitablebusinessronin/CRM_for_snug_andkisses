/**
 * Notion Knowledge Adapter (Read-Only Stub)
 *
 * Purpose:
 * - Provide a simple, safe interface to fetch templates/specs by key
 * - Today returns local/static placeholders to avoid runtime dependency on MCP
 * - Can be wired to Notion MCP via a server-side job or build step later
 *
 * Usage examples:
 *   const tpl = await getEmailTemplate('welcome_001');
 *   const sop = await getSOP('lead_follow_up_phase_2');
 */

export type KnowledgeType = 'email_template' | 'sop' | 'playbook';

export interface KnowledgeItem {
  key: string;
  type: KnowledgeType;
  title: string;
  content: string;
  version: string;
  source: 'local_stub' | 'notion_mcp' | 'cache';
  updatedAt: string;
}

const NOW = () => new Date().toISOString();

// Minimal local library to unblock flows
const LOCAL_LIBRARY: Record<string, KnowledgeItem> = {
  'email_template:welcome_001': {
    key: 'email_template:welcome_001',
    type: 'email_template',
    title: 'Healthcare Welcome Series - Email 1',
    content: '<h1>Welcome, {{first_name}}</h1><p>Thank you for your interest in {{service_type}}.</p>',
    version: '0.1.0',
    source: 'local_stub',
    updatedAt: NOW(),
  },
  'sop:lead_follow_up_phase_2': {
    key: 'sop:lead_follow_up_phase_2',
    type: 'sop',
    title: 'Phase 2 - Lead Follow-up SOP',
    content: '- T+0h: Send welcome email\n- T+24h: Send reminder\n- T+72h: Offer interview booking link',
    version: '0.1.0',
    source: 'local_stub',
    updatedAt: NOW(),
  },
};

export async function getKnowledge(key: string): Promise<KnowledgeItem | null> {
  // TODO: Replace with Notion MCP fetch and caching layer
  return LOCAL_LIBRARY[key] ?? null;
}

export async function getEmailTemplate(id: string): Promise<KnowledgeItem | null> {
  return getKnowledge(`email_template:${id}`);
}

export async function getSOP(id: string): Promise<KnowledgeItem | null> {
  return getKnowledge(`sop:${id}`);
}
