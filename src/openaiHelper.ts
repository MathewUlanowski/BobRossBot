export function extractMessageFromResponse(response: unknown): string | null {
  // Support common shapes: response.choices[0].message.content or response.choices[0].message
  if (!response || typeof response !== 'object') return null;
  const res = response as Record<string, unknown>;
  const choices = res.choices;
  if (!choices || !Array.isArray(choices) || choices.length === 0) return null;
  const choice = choices[0] as Record<string, unknown>;
  const message = choice.message;
  if (
    message &&
    typeof message === 'object' &&
    'content' in message &&
    typeof (message as Record<string, unknown>).content === 'string'
  ) {
    return (message as Record<string, unknown>).content as string;
  }
  // Some clients return message as string directly
  if (typeof message === 'string') return message;
  // OpenAI older shape: choice.text
  if (typeof choice.text === 'string') return choice.text;
  return null;
}
