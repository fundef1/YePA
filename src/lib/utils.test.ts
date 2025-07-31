import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('hello', 'world')).toBe('hello world');
  });

  it('should handle conditional classes', () => {
    expect(cn('hello', false && 'world', 'there')).toBe('hello there');
  });

  it('should resolve conflicts with tailwind-merge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});