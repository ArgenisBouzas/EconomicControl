// app/api/registros/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// PUT - Actualizar registro de presupuesto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log('Actualizando registro:', { id, datos: body });
    
    // Validar datos requeridos
    const errors = [];
    
    if (!body.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!body.valor || isNaN(Number(body.valor)) || Number(body.valor) <= 0) {
      errors.push('El valor debe ser un número positivo');
    }
    
    if (!body.tipo || !['ingreso', 'egreso'].includes(body.tipo)) {
      errors.push('El tipo debe ser "ingreso" o "egreso"');
    }
    
    if (!body.alumno_id || isNaN(Number(body.alumno_id))) {
      errors.push('El ID del alumno es requerido');
    }
    
    if (!body.usuario_id || isNaN(Number(body.usuario_id))) {
      errors.push('El ID del usuario es requerido');
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Error de validación', details: errors },
        { status: 400 }
      );
    }
    
    // Verificar que el registro exista
    const [existing] = await sql`
      SELECT id FROM registros_presupuesto WHERE id = ${id}
    `;
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el alumno exista
    const [alumnoExists] = await sql`
      SELECT id FROM alumnos WHERE id = ${body.alumno_id}
    `;
    
    if (!alumnoExists) {
      return NextResponse.json(
        { error: 'El alumno especificado no existe' },
        { status: 404 }
      );
    }
    
    // Actualizar el registro
    const registros = await sql<(any & { alumno_nombre: string })[]>`
      UPDATE registros_presupuesto 
      SET 
        descripcion = ${body.descripcion.trim()},
        valor = ${Number(body.valor)},
        tipo = ${body.tipo},
        alumno_id = ${Number(body.alumno_id)},
        usuario_id = ${Number(body.usuario_id)},
        docname = ${body.docname?.trim() || null},
        fecha_actualizacion = NOW()
      WHERE id = ${id}
      RETURNING 
        *,
        (
          SELECT nombre 
          FROM alumnos 
          WHERE id = ${Number(body.alumno_id)}
        ) as alumno_nombre
    `;
    
    if (registros.length === 0) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    console.log('Registro actualizado exitosamente:', registros[0]);
    
    return NextResponse.json(registros[0]);
    
  } catch (error: any) {
    console.error('Error en PUT /api/registros/[id]:', error);
    
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Error de referencia: El alumno o usuario no existe' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// GET - Obtener registro específico con nombre del alumno
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const registros = await sql<(any & { alumno_nombre: string })[]>`
      SELECT 
        rp.*,
        a.nombre as alumno_nombre
      FROM registros_presupuesto rp
      LEFT JOIN alumnos a ON rp.alumno_id = a.id
      WHERE rp.id = ${id}
      LIMIT 1
    `;
    
    if (registros.length === 0) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(registros[0]);
    
  } catch (error) {
    console.error('Error en GET /api/registros/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar registro de presupuesto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar si el registro existe
    const [existing] = await sql`
      SELECT id FROM registros_presupuesto WHERE id = ${id}
    `;
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el registro
    const result = await sql`
      DELETE FROM registros_presupuesto WHERE id = ${id}
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registro eliminado exitosamente',
      deletedId: id
    });
    
  } catch (error: any) {
    console.error('Error en DELETE /api/registros/[id]:', error);
    
    // Manejar error de clave foránea si existe
    if (error.code === '23503') {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar el registro porque está referenciado en otras tablas',
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}