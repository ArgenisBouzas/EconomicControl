// app/api/registros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.alumno_id || !body.descripcion || !body.tipo || !body.valor) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }
    
    // Insertar en la base de datos
    const [newRegistro] = await sql`
      INSERT INTO registros_presupuesto (
        usuario_id,
        alumno_id,
        descripcion,
        tipo,
        valor,
        fecha_creacion,
        fecha_actualizacion,
        ruta,
        docname,
        metadata
      ) VALUES (
        ${body.usuario_id},
        ${body.alumno_id},
        ${body.descripcion},
        ${body.tipo},
        ${body.valor},
        ${body.fecha_creacion},
        ${body.fecha_actualizacion},
        ${body.ruta},
        ${body.docname},
        ${JSON.stringify(body.metadata)}
      )
      RETURNING *
    `;
    
    return NextResponse.json(newRegistro, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}