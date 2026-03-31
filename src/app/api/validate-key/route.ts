import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ valid: false, error: 'Missing provider or apiKey' }, { status: 400 });
    }

    let valid = false;
    let error = '';

    switch (provider) {
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        valid = res.ok;
        if (!valid) error = 'Invalid OpenAI API key';
        break;
      }
      case 'gemini': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        valid = res.ok;
        if (!valid) error = 'Invalid Gemini API key';
        break;
      }
      case 'claude': {
        // Anthropic requires a specific header
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
        // 200 or 400 (valid key, bad request) both mean key works
        valid = res.status === 200 || res.status === 400;
        if (!valid) error = 'Invalid Claude API key';
        break;
      }
      default:
        return NextResponse.json({ valid: false, error: 'Unknown provider' }, { status: 400 });
    }

    return NextResponse.json({ valid, error: valid ? undefined : error });
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: 'Validation request failed' },
      { status: 500 }
    );
  }
}
