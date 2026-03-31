import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, params, templateMode, colorMode, contextText } = await req.json();

    if (!provider || !apiKey || !params) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { subject, gradeLevel, questionType, numberOfQuestions } = params;

    const colorInstruction = colorMode === 'bw'
      ? 'All content should be designed for black and white printing. Do not suggest colors or colored elements.'
      : 'Content can include color suggestions and vibrant themed elements.';

    const contextBlock = contextText
      ? `\n\nKNOWLEDGE BASE (use this as the primary source for generating questions — base your questions on this material):\n${contextText}\n`
      : '';

    let systemPrompt: string;

    if (templateMode && templateMode.tags && templateMode.tags.length > 0) {
      const tagList = templateMode.tags.map((t: string) => `"${t}"`).join(', ');
      systemPrompt = `You are an expert educational content creator specializing in worksheet generation.
Generate content for a ${subject || 'math'} worksheet.
Grade level: ${gradeLevel || '3rd grade'}.
Question type: ${questionType || 'multiple choice'}.
${colorInstruction}
${contextBlock}

The worksheet has existing text placeholders with these tags: ${tagList}.

IMPORTANT: You MUST respond with a valid JSON array and NOTHING else. No markdown, no code blocks, no explanation.
Format: [{"tag": "tag_name", "new_content": "replacement text"}]

For tags starting with "title_text", generate a compelling worksheet title.
For tags starting with "question_", generate age-appropriate questions.
For tags starting with "answer_", generate answer lines or blank spaces.
Generate content for ALL provided tags. Each question should be unique and appropriate for the specified grade level.`;
    } else {
      systemPrompt = `You are an expert educational content creator specializing in worksheet generation.
Generate exactly ${numberOfQuestions || 6} questions for a ${subject || 'math'} worksheet.
Grade level: ${gradeLevel || '3rd grade'}.
Question type: ${questionType || 'multiple choice'}.
${colorInstruction}
${contextBlock}

IMPORTANT: You MUST respond with a valid JSON object and NOTHING else. No markdown, no code blocks, no explanation.
Format: {"title": "Worksheet Title Here", "questions": [{"id": 1, "question": "...", "answer": "..."}]}

Generate a compelling, descriptive title and unique questions appropriate for the specified grade level and subject.`;
    }

    let result;

    switch (provider) {
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: 'Generate the worksheet content now.' },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 });
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        try {
          result = JSON.parse(content);
        } catch {
          result = {};
        }
        break;
      }

      case 'gemini': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt + '\n\nGenerate the worksheet content now.' }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
              },
            }),
          }
        );

        if (!res.ok) {
          const err = await res.text();
          return NextResponse.json({ error: `Gemini error: ${err}` }, { status: 500 });
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        try {
          result = JSON.parse(text);
        } catch {
          result = {};
        }
        break;
      }

      case 'claude': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: 'Generate the worksheet content now.' }],
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          return NextResponse.json({ error: `Claude error: ${err}` }, { status: 500 });
        }

        const data = await res.json();
        const content = data.content?.[0]?.text || '{}';
        try {
          result = JSON.parse(content);
        } catch {
          result = {};
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    // Normalize response
    if (templateMode && templateMode.tags && templateMode.tags.length > 0) {
      const replacements = Array.isArray(result) ? result : (result.replacements || result.content || []);
      return NextResponse.json({ mode: 'template', replacements });
    } else {
      const title = result.title || 'Worksheet';
      const questions = result.questions || (Array.isArray(result) ? result : []);
      return NextResponse.json({ mode: 'scratch', title, questions });
    }
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
