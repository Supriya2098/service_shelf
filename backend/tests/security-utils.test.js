const { stripHtml, validateEmail } = require('../src/middleware/security');

describe('Security utilities', () => {
  it('stripHtml removes script tags', () => {
    expect(stripHtml('<script>alert("xss")</script>Hello')).toBe('alert("xss")Hello');
  });

  it('stripHtml removes javascript: protocol', () => {
    expect(stripHtml('javascript:alert(1)')).toBe('alert(1)');
  });

  it('validateEmail accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('validateEmail rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});
