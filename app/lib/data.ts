import postgres from 'postgres';
import { Alumno, RegistroPresupuesto } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchAlumnos() {
  try {
    const alumnos = await sql<Alumno[]>`
      SELECT * FROM alumnos ORDER BY id ASC
    `;
    return alumnos;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all alumnos.');
  }
}

export async function fetchRegistros() {
  try {
    const registros = await sql<RegistroPresupuesto[]>`
      SELECT *
      FROM registros_presupuesto
      ORDER BY fecha_creacion DESC
    `;
    return registros;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all registros.');
  }
}

export async function fetchRegistrosConNombre() {
  try {
    const registros = await sql<(RegistroPresupuesto & { alumno_nombre: string })[]>`
      SELECT
        rp.*,
        a.nombre as alumno_nombre
      FROM registros_presupuesto rp
      LEFT JOIN alumnos a ON rp.alumno_id = a.id
      ORDER BY rp.fecha_creacion DESC
    `;
    return registros;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all registros with student names.');
  }
}

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