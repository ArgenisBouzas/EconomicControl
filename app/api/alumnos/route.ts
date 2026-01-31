import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
export const dynamic = 'force-dynamic';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// GET - Obtener todos los alumnos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const activo = searchParams.get('activo');
    
    // Construir la query dinámicamente
    let query = `
      SELECT 
        id,
        nombre,
        email,
        telefono,
        fecha_registro,
        activo
      FROM alumnos
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      conditions.push(`nombre ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (activo !== null) {
      conditions.push(`activo = $${paramIndex}`);
      params.push(activo === 'true');
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY activo DESC, nombre ASC`;
    
    // Ejecutar la consulta usando sql.query en lugar de sql()
    let alumnos;
    if (params.length > 0) {
      // Usar sql.unsafe para evitar problemas de tipado (o sql.query si está disponible)
      alumnos = await sql.unsafe(query, params);
    } else {
      alumnos = await sql.unsafe(query);
    }
    
    return NextResponse.json(alumnos);
  } catch (error) {
    console.error('Error en GET /api/alumnos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo alumno
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creando nuevo alumno con datos:', body);
    
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
    
    // Insertar nuevo alumno
    const [alumno] = await sql`
      INSERT INTO alumnos 
        (nombre, email, telefono, activo)
      VALUES 
        (${body.nombre.trim()},
         ${body.email?.trim() || null},
         ${body.telefono?.trim() || null},
         ${body.activo !== false})
      RETURNING 
        id,
        nombre,
        email,
        telefono,
        fecha_registro,
        activo
    `;
    
    console.log('Alumno creado exitosamente:', alumno);
    
    return NextResponse.json(alumno, { status: 201 });
    
  } catch (error: any) {
    console.error('Error en POST /api/alumnos:', error);
    
    if (error.code === '23505' || error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'El email ya está registrado para otro alumno' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido',
        code: error.code
      },
      { status: 500 }
    );
  }
}