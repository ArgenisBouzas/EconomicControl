// app/api/registros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Datos recibidos:', body);
    
    // Validar datos requeridos
    if (!body.alumno_id || !body.descripcion || !body.valor || !body.tipo) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Generar ID con formato a+timestamp
    const timestamp = Date.now(); // Milisegundos desde 1970
    const uniqueId = `a${timestamp}`;
    
    console.log('ID generado:', uniqueId);
    
    // Convertir a números
    const usuarioId = Number(body.usuario_id) || 1;
    const alumnoId = Number(body.alumno_id);
    const valor = Number(body.valor);
    
    // Validar que el valor sea positivo
    if (valor <= 0) {
      return NextResponse.json(
        { error: 'El valor debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Insertar en la base de datos con ID personalizado
    const [registro] = await sql`
      INSERT INTO registros_presupuesto 
        (id, usuario_id, alumno_id, descripcion, tipo, valor, docname, metadata, fecha_creacion, fecha_actualizacion)
      VALUES 
        (${uniqueId},
         ${usuarioId}, 
         ${alumnoId}, 
         ${body.descripcion}, 
         ${body.tipo}, 
         ${valor}, 
         ${body.docname || null},
         ${body.metadata || {}},
         NOW(),
         NOW())
      RETURNING 
        id,
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
    `;

    console.log('Registro insertado:', registro);

    // Obtener el nombre del alumno para la respuesta
    const [alumno] = await sql`
      SELECT nombre FROM alumnos WHERE id = ${alumnoId}
    `;

    // Construir respuesta completa
    const registroConAlumno = {
      ...registro,
      alumno_nombre: alumno?.nombre || 'Desconocido'
    };

    return NextResponse.json(registroConAlumno, { status: 201 });

  } catch (error: any) {
    console.error('Error en POST /api/registros:', error);
    
    // Manejar error de ID duplicado
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      // Si hay ID duplicado, generar uno nuevo con timestamp + random
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const uniqueId = `a${timestamp}${random}`;
      
      console.log('ID duplicado, nuevo ID generado:', uniqueId);
      
      return NextResponse.json(
        { 
          error: 'ID duplicado detectado',
          suggestion: `Intenta con ID: ${uniqueId}`,
          retry_with_id: uniqueId
        },
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