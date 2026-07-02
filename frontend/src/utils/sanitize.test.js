import { describe, it, expect } from 'vitest';
import { escapeHtml } from './sanitize';

describe('escapeHtml', () => {
  it('escapes script tags', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes ampersands and quotes', () => {
    expect(escapeHtml('Tom & "Jerry"')).toBe('Tom &amp; &quot;Jerry&quot;');
  });

  it('returns empty string for non-string input', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(123)).toBe('');
  });
});
