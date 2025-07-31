import { describe, it, expect, beforeEach } from 'vitest';
import { setCookie, getCookie } from './cookies';

describe('cookie utils', () => {
  beforeEach(() => {
    // Reset cookies for each test
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should set a cookie correctly', () => {
    setCookie('testCookie', 'testValue', 1);
    expect(document.cookie).toContain('testCookie=testValue');
  });

  it('should get a cookie value by name', () => {
    document.cookie = 'testCookie=testValue';
    expect(getCookie('testCookie')).toBe('testValue');
  });

  it('should return null for a non-existent cookie', () => {
    expect(getCookie('nonExistentCookie')).toBe(null);
  });

  it('should handle multiple cookies correctly', () => {
    setCookie('cookie1', 'value1', 1);
    setCookie('cookie2', 'value2', 1);
    expect(getCookie('cookie1')).toBe('value1');
    expect(getCookie('cookie2')).toBe('value2');
  });
});