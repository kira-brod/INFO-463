import { writeFileSync } from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;

    const filePath = path.join(process.cwd(), 'data', 'output.json');

    writeFileSync(filePath, JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ message: 'File written successfully' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error writing file', error: error.message }), {
      status: 500,
    });
  }
}
