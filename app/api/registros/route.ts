// app/api/registros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// GET - Obtener todos los registros con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de filtrado
    const search = searchParams.get('search');
    const tipo = searchParams.get('tipo'); // 'ingreso' o 'egreso'
    const alumnoId = searchParams.get('alumno_id');
    const fechaDesde = searchParams.get('fecha_desde');
    const fechaHasta = searchParams.get('fecha_hasta');
    const minValor = searchParams.get('min_valor');
    const maxValor = searchParams.get('max_valor');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Construir consulta base con JOIN para obtener nombre del alumno
    let query = sql`
      SELECT 
        rp.id,
        rp.descripcion,
        rp.valor,
        rp.tipo,
        rp.alumno_id,
        rp.usuario_id,
        rp.docname,
        rp.fecha_creacion,
        rp.fecha_actualizacion,
        a.nombre as alumno_nombre
      FROM registros_presupuesto rp
      LEFT JOIN alumnos a ON rp.alumno_id = a.id
    `;
    
    // Aplicar filtros si existen
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    
    if (search) {
      whereConditions.push(`rp.descripcion ILIKE $${whereConditions.length + 1}`);
      queryParams.push(`%${search}%`);
    }
    
    if (tipo && ['ingreso', 'egreso'].includes(tipo)) {
      whereConditions.push(`rp.tipo = $${whereConditions.length + 1}`);
      queryParams.push(tipo);
    }
    
    if (alumnoId && !isNaN(Number(alumnoId))) {
      whereConditions.push(`rp.alumno_id = $${whereConditions.length + 1}`);
      queryParams.push(Number(alumnoId));
    }
    
    if (fechaDesde) {
      whereConditions.push(`rp.fecha_creacion >= $${whereConditions.length + 1}`);
      queryParams.push(fechaDesde);
    }
    
    if (fechaHasta) {
      whereConditions.push(`rp.fecha_creacion <= $${whereConditions.length + 1}`);
      queryParams.push(fechaHasta);
    }
    
    if (minValor && !isNaN(Number(minValor))) {
      whereConditions.push(`rp.valor >= $${whereConditions.length + 1}`);
      queryParams.push(Number(minValor));
    }
    
    if (maxValor && !isNaN(Number(maxValor))) {
      whereConditions.push(`rp.valor <= $${whereConditions.length + 1}`);
      queryParams.push(Number(maxValor));
    }
    
    // Aplicar condiciones WHERE si existen - CORREGIDO
    if (whereConditions.length > 0) {
      const whereClause = whereConditions.join(' AND ');
      query = sql`${query} WHERE ${sql.unsafe(whereClause, ...queryParams)}`;
    }
    
    // Contar total de registros (para paginación) - CORREGIDO
    let countQuery;
    if (whereConditions.length > 0) {
      const whereClause = whereConditions.join(' AND ');
      countQuery = sql`SELECT COUNT(*) as total FROM registros_presupuesto rp WHERE ${sql.unsafe(whereClause, ...queryParams)}`;
    } else {
      countQuery = sql`SELECT COUNT(*) as total FROM registros_presupuesto rp`;
    }
    
    // Aplicar ordenamiento y paginación a la consulta principal
    if (whereConditions.length > 0) {
      query = sql`${query} ORDER BY rp.fecha_creacion DESC LIMIT ${limit} OFFSET ${offset}`;
    } else {
      query = sql`${query} ORDER BY rp.fecha_creacion DESC LIMIT ${limit} OFFSET ${offset}`;
    }
    
    const [registros, countResult] = await Promise.all([
      query,
      countQuery
    ]);
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      registros,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error en GET /api/registros:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo registro de presupuesto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creando nuevo registro con datos:', body);
    
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
        { 
          error: 'Error de validación', 
          details: errors 
        },
        { status: 400 }
      );
    }
    
    // Verificar que el alumno exista
    const [alumnoExists] = await sql`
      SELECT id FROM alumnos WHERE id = ${Number(body.alumno_id)}
    `;
    
    if (!alumnoExists) {
      return NextResponse.json(
        { error: 'El alumno especificado no existe' },
        { status: 404 }
      );
    }
    
    // Generar el ID como "a" + timestamp
    const timestamp = Date.now();
    const generatedId = `a${timestamp}`;
    
    // Fechas actuales
    const fechaActual = new Date();
    
    // Insertar nuevo registro con ID generado
    const registros = await sql`
      INSERT INTO registros_presupuesto 
        (id, descripcion, valor, tipo, alumno_id, usuario_id, docname, fecha_creacion, fecha_actualizacion)
      VALUES 
        (${generatedId},
         ${body.descripcion.trim()},
         ${Number(body.valor)},
         ${body.tipo},
         ${Number(body.alumno_id)},
         ${Number(body.usuario_id)},
         ${body.docname?.trim() || null},
         ${fechaActual},
         ${fechaActual})
      RETURNING 
        id,
        descripcion,
        valor,
        tipo,
        alumno_id,
        usuario_id,
        docname,
        fecha_creacion,
        fecha_actualizacion
    `;
    
    if (registros.length === 0) {
      return NextResponse.json(
        { error: 'Error al crear el registro' },
        { status: 500 }
      );
    }
    
    // Obtener el nombre del alumno
    const [alumnoInfo] = await sql`
      SELECT nombre FROM alumnos WHERE id = ${Number(body.alumno_id)}
    `;
    
    const registroConAlumno = {
      ...registros[0],
      alumno_nombre: alumnoInfo?.nombre || null
    };
    
    console.log('Registro creado exitosamente:', registroConAlumno);
    
    return NextResponse.json(registroConAlumno, { status: 201 });
    
  } catch (error: any) {
    console.error('Error en POST /api/registros:', error);
    
    // Manejar errores específicos de PostgreSQL
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Error de referencia: El alumno o usuario no existe' },
        { status: 400 }
      );
    }
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Registro duplicado' },
        { status: 409 }
      );
    }
    
    if (error.code === '22P02') {
      return NextResponse.json(
        { error: 'Tipo de dato incorrecto en uno de los campos' },
        { status: 400 }
      );
    }
    
    // Manejar el error específico de violación de NOT NULL
    if (error.code === '23502') {
      return NextResponse.json(
        { 
          error: 'Error en la base de datos: Intento de insertar valor nulo en columna no nula',
          details: error.detail || error.message || 'Error desconocido',
          column: error.column_name
        },
        { status: 400 }
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