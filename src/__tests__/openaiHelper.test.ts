import { extractMessageFromResponse } from '../openaiHelper';

describe('extractMessageFromResponse', () => {
  it('extracts content from message.content', () => {
    const res = { choices: [{ message: { content: 'hello' } }] };
    expect(extractMessageFromResponse(res)).toBe('hello');
  });

  it('extracts when message is string', () => {
    const res = { choices: [{ message: 'hi there' }] };
    expect(extractMessageFromResponse(res)).toBe('hi there');
  });

  it('extracts legacy text field', () => {
    const res = { choices: [{ text: 'legacy' }] };
    expect(extractMessageFromResponse(res)).toBe('legacy');
  });

  it('returns null for empty or invalid', () => {
    expect(extractMessageFromResponse(null)).toBeNull();
    expect(extractMessageFromResponse({})).toBeNull();
    expect(extractMessageFromResponse({ choices: [] })).toBeNull();
  });
});
