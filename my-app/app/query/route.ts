import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function listAllAlumnos() {
  const data = await sql`
    SELECT * FROM alumnos
    ORDER BY nombre ASC;
  `;
  return data;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
  	return Response.json(await listAllAlumnos());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}