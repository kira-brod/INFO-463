import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ message: 'Invalid data format' }), {
        status: 400,
      });
    }

    const filePath = path.join(process.cwd(), 'data', 'output.json');
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

    return new Response(JSON.stringify({ message: 'Keystroke data saved successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error writing JSON:', error);
    return new Response(JSON.stringify({ message: 'Failed to save data' }), {
      status: 500,
    });
  }
}

