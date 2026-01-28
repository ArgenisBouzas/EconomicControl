// app/api/alumnos/route.ts - CORREGIDO COMPLETAMENTE
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// GET - Obtener todos los alumnos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const activo = searchParams.get('activo');
    
    let query = sql`
      SELECT 
        id,
        nombre,
        email,
        telefono,
        fecha_registro,
        activo
      FROM alumnos
    `;
    
    // Aplicar filtros si existen
    const whereConditions = [];
    const queryParams = [];
    
    if (search) {
      whereConditions.push(`nombre ILIKE $1`);
      queryParams.push(`%${search}%`);
    }
    
    if (activo !== null) {
      whereConditions.push(`activo = $${whereConditions.length + 1}`);
      queryParams.push(activo === 'true');
    }
    
    if (whereConditions.length > 0) {
      query = sql`${query} WHERE ${sql(whereConditions.join(' AND '), ...queryParams)}`;
    }
    
    query = sql`${query} ORDER BY activo DESC, nombre ASC`;
    
    const alumnos = await query;
    
    return NextResponse.json(alumnos);
  } catch (error) {
    console.error('Error en GET /api/alumnos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo alumno - ¡CORREGIDO!
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
    
    // Insertar nuevo alumno - ¡COLUMNA CORRECTA: "activo", NO "activo_hoslean"!
    const [alumno] = await sql`
      INSERT INTO alumnos 
        (nombre, email, telefono, activo)  -- ← AQUÍ: "activo"
      VALUES 
        (${body.nombre.trim()},
         ${body.email?.trim() || null},
         ${body.telefono?.trim() || null},
         ${body.activo !== false})  -- ← AQUÍ: "activo"
      RETURNING 
        id,
        nombre,
        email,
        telefono,
        fecha_registro,
        activo  -- ← AQUÍ: "activo"
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