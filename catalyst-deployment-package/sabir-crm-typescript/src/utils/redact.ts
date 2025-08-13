// Common PHI/sensitive fields to redact in logs
export const SENSITIVE_FIELDS = new Set<string>([
  'password', 'pass', 'pwd', 'token', 'access_token', 'refresh_token', 'authorization',
  'ssn', 'social_security_number', 'dob', 'date_of_birth', 'mrn', 'medical_record_number',
  'email', 'phone', 'address', 'street', 'city', 'state', 'zip', 'zipcode',
  'credit_card', 'card_number', 'cvv', 'cvc', 'expiry', 'exp_month', 'exp_year',
]);

export type RedactOptions = {
  // Custom fields to redact beyond defaults
  extraFields?: string[];
  // Replacement string for redacted values
  replacement?: string;
  // Maximum depth to traverse for redaction
  maxDepth?: number;
};

function isPlainObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function redactObject<T = any>(input: T, opts: RedactOptions = {}): T {
  const replacement = opts.replacement ?? '[REDACTED]';
  const maxDepth = opts.maxDepth ?? 6;
  const extra = new Set<string>((opts.extraFields || []).map((s) => s.toLowerCase()));
  const fields = new Set<string>([...SENSITIVE_FIELDS, ...extra]);

  const seen = new WeakSet<object>();

  function _redact(value: any, depth: number): any {
    if (value === null || value === undefined) return value;
    if (depth > maxDepth) return '[TRUNCATED]';

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((v) => _redact(v, depth + 1));
    }

    if (isPlainObject(value)) {
      if (seen.has(value)) return '[CYCLE]';
      seen.add(value);

      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        const keyLower = k.toLowerCase();
        if (fields.has(keyLower)) {
          out[k] = replacement;
        } else {
          out[k] = _redact(v, depth + 1);
        }
      }
      return out;
    }

    // For buffers and others
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return '[BUFFER]';

    try {
      // Last resort: attempt to JSON-ify unknowns
      return JSON.parse(JSON.stringify(value));
    } catch {
      return '[UNSERIALIZABLE]';
    }
  }

  try {
    return _redact(input as any, 0) as T;
  } catch {
    return input;
  }
}
