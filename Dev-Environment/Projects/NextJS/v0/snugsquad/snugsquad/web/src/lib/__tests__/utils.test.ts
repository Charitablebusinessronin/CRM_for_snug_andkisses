import { capitalize, truncateText } from '@/lib/utils';

describe('utils', () => {
  test('capitalize', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('truncateText', () => {
    expect(truncateText('abcdef', 4)).toBe('abcd...');
    expect(truncateText('abc', 4)).toBe('abc');
  });
});



