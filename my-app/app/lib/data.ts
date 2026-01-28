import postgres from 'postgres';
import { Alumno, RegistroPresupuesto } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchAlumnos() {
  try {
    const alumnos = await sql<Alumno[]>`
      SELECT
        id,
        nombre
      FROM alumnos
      ORDER BY nombre ASC
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
      SELECT
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
        rp.id,
        rp.usuario_id,
        rp.alumno_id,
        rp.descripcion,
        rp.tipo,
        rp.valor,
        rp.fecha_creacion,
        rp.fecha_actualizacion,
        rp.ruta,
        rp.docname,
        rp.metadata,
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


