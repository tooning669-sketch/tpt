import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name;
    const ext = ('.' + fileName.split('.').pop()?.toLowerCase()) || '';

    let text = '';

    switch (ext) {
      case '.txt':
      case '.csv': {
        text = await file.text();
        break;
      }
      case '.pdf': {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require('pdf-parse');
          const buffer = Buffer.from(await file.arrayBuffer());
          const data = await pdfParse(buffer);
          text = data.text;
        } catch {
          return NextResponse.json(
            { error: 'Failed to parse PDF. Make sure pdf-parse is installed.' },
            { status: 500 }
          );
        }
        break;
      }
      case '.docx': {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const mammoth = require('mammoth');
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await mammoth.extractRawText({ buffer });
          text = result.value;
        } catch {
          return NextResponse.json(
            { error: 'Failed to parse DOCX. Make sure mammoth is installed.' },
            { status: 500 }
          );
        }
        break;
      }
      default:
        return NextResponse.json(
          { error: `Unsupported file type: ${ext}. Use .txt, .csv, .pdf, or .docx` },
          { status: 400 }
        );
    }

    // Truncate to ~50k chars to avoid overwhelming the AI
    const maxLen = 50000;
    if (text.length > maxLen) {
      text = text.substring(0, maxLen) + '\n\n[...content truncated...]';
    }

    return NextResponse.json({
      text: text.trim(),
      fileName,
    });
  } catch (err) {
    console.error('Text extraction error:', err);
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}
