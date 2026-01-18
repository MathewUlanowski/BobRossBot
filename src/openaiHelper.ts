export function extractMessageFromResponse(response: any): string | null {
  // Support common shapes: response.choices[0].message.content or response.choices[0].message
  if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0) return null;
  const choice = response.choices[0];
  if (choice?.message?.content) return choice.message.content;
  // Some clients return message as string directly
  if (typeof choice?.message === 'string') return choice.message;
  // OpenAI older shape: choice.text
  if (choice?.text) return choice.text;
  return null;
}
