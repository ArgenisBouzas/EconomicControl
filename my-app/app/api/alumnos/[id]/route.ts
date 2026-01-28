// app/api/alumnos/[id]/route.ts - VERSIÓN CORRECTA
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// PUT - Actualizar alumno
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alumnoId = parseInt(id);
    
    if (isNaN(alumnoId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log('Actualizando alumno:', { id: alumnoId, datos: body });
    
    // Verificar que el alumno exista
    const [existing] = await sql`
      SELECT id FROM alumnos WHERE id = ${alumnoId}
    `;
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }
    
    // Validar datos requeridos
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }
    
    // Validar email si se proporciona
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }
    
    // Actualizar con las columnas REALES
    const [alumno] = await sql`
      UPDATE alumnos 
      SET 
        nombre = ${body.nombre.trim()},
        email = ${body.email?.trim() || null},
        telefono = ${body.telefono?.trim() || null},
        activo = ${body.activo !== false}
      WHERE id = ${alumnoId}
      RETURNING 
        id,
        nombre,
        email,
        telefono,
        fecha_registro,
        activo
    `;
    
    console.log('Alumno actualizado exitosamente:', alumno);
    
    return NextResponse.json(alumno);
    
  } catch (error: any) {
    console.error('Error en PUT /api/alumnos/[id]:', error);
    
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'El email ya está registrado para otro alumno' },
        { status: 409 }
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

// GET - Obtener alumno específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alumnoId = parseInt(id);
    
    if (isNaN(alumnoId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    const [alumno] = await sql`
      SELECT 
        id,
        nombre,
        email,
        telefono,
        fecha_registro,
        activo
      FROM alumnos 
      WHERE id = ${alumnoId}
    `;
    
    if (!alumno) {
      return NextResponse.json(
        { error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(alumno);
    
  } catch (error) {
    console.error('Error en GET /api/alumnos/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar alumno
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alumnoId = parseInt(id);
    
    if (isNaN(alumnoId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar si el alumno tiene registros relacionados
    const [hasRegistros] = await sql`
      SELECT COUNT(*) as count 
      FROM registros_presupuesto 
      WHERE alumno_id = ${alumnoId}
    `;
    
    if (hasRegistros && hasRegistros.count > 0) {
      // En lugar de eliminar, marcar como inactivo
      const [alumno] = await sql`
        UPDATE alumnos 
        SET activo = false 
        WHERE id = ${alumnoId}
        RETURNING *
      `;
      
      return NextResponse.json({
        message: 'Alumno marcado como inactivo (tiene registros asociados)',
        alumno
      });
    }
    
    // Eliminar alumno (si no tiene registros)
    const result = await sql`
      DELETE FROM alumnos WHERE id = ${alumnoId}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Alumno no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Alumno eliminado exitosamente' 
    });
    
  } catch (error) {
    console.error('Error en DELETE /api/alumnos/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}