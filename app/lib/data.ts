// app/lib/data.ts
import postgres from 'postgres';
import { Alumno, RegistroPresupuesto } from "./definitions";

// Función helper para verificar si podemos conectar a DB
const canConnectToDB = () => {
  // Durante el build de Vercel, no hay DB disponible
  if (process.env.NODE_ENV === 'production' && !process.env.POSTGRES_URL) {
    return false;
  }
  // También verificar si estamos en proceso de build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return false;
  }
  return true;
};

export async function fetchAlumnos() {
  if (!canConnectToDB()) {
    console.warn('Skipping DB connection during build');
    return [];
  }
  
  try {
    const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
    const alumnos = await sql<Alumno[]>`
      SELECT * FROM alumnos ORDER BY id ASC
    `;
    await sql.end();
    return alumnos;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchRegistros() {
  if (!canConnectToDB()) {
    console.warn('Skipping DB connection during build - fetchRegistros');
    return [];
  }
  
  try {
    const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
    const registros = await sql<RegistroPresupuesto[]>`
      SELECT *
      FROM registros_presupuesto
      ORDER BY fecha_creacion DESC
    `;
    await sql.end();
    return registros;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

export async function fetchRegistrosConNombre() {
  if (!canConnectToDB()) {
    console.warn('Skipping DB connection during build - fetchRegistrosConNombre');
    return [];
  }
  
  try {
    const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
    const registros = await sql<(RegistroPresupuesto & { alumno_nombre: string })[]>`
      SELECT
        rp.*,
        a.nombre as alumno_nombre
      FROM registros_presupuesto rp
      LEFT JOIN alumnos a ON rp.alumno_id = a.id
      ORDER BY rp.fecha_creacion DESC
    `;
    await sql.end();
    return registros;
  } catch (err) {
    console.error('Database Error:', err);
    return [];
  }
}

// Las demás funciones también necesitan ser modificadas...

// IMPORTANTE: Aquí usamos el mismo `sql` que ya está definido arriba
// lib/data.ts
// lib/data.ts
export async function fetchRegistroById(id: string) {
  try {
    // Asegurarse de que id es una string no vacía
    if (!id || typeof id !== 'string') {
      console.error('Invalid ID provided:', id);
      return null;
    }
    
    // Usar parámetro tipado explícitamente
    const registros = await sql<(RegistroPresupuesto & { alumno_nombre: string })[]>`
      SELECT 
        rp.*,
        a.nombre as alumno_nombre
      FROM registros_presupuesto rp
      LEFT JOIN alumnos a ON rp.alumno_id = a.id
      WHERE rp.id = ${id}
      LIMIT 1
    `;
    
    return registros.length > 0 ? registros[0] : null;
  } catch (error) {
    console.error('Database Error in fetchRegistroById:', error);
    
    // Para debuggear: mostrar el error completo
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // No lanzar error, retornar null para que la página maneje el 404
    return null;
  }
}

export async function updateRegistro(id: string, data: {
  descripcion: string;
  valor: number;
  tipo: 'ingreso' | 'egreso';
  alumno_id: number;
  usuario_id: number;
  docname?: string;
}) {
  try {
    const [updated] = await sql<(RegistroPresupuesto & { alumno_nombre: string })[]>`
      UPDATE registros_presupuesto 
      SET 
        descripcion = ${data.descripcion},
        valor = ${data.valor},
        tipo = ${data.tipo},
        alumno_id = ${data.alumno_id},
        usuario_id = ${data.usuario_id},
        docname = ${data.docname || null},
        fecha_actualizacion = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    
    return updated || null;
  } catch (error) {
    console.error('Error updating registro:', error);
    throw error;
  }
}

export async function deleteRegistro(id: string) {
  try {
    await sql`DELETE FROM registros_presupuesto WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Error deleting registro:', error);
    throw error;
  }
}