export type Alumno = {
    id: number;
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_registro: string; // ISO string
    activo: boolean;
};



export type RegistroPresupuesto = {
    id: string;
    usuario_id: number;
    alumno_id: number;
    descripcion: string;
    tipo: 'ingreso' | 'egreso';
    valor: number;
    fecha_creacion: string; // Siempre ISO string
    fecha_actualizacion: string; // Siempre ISO string
    ruta: string | null;
    docname: string | null;
    metadata: object; // En lugar de Record<string, any>
  

};

// Nuevo type con el nombre del alumno incluido
export type RegistroPresupuestoConAlumno = RegistroPresupuesto & {
    alumno_nombre: string;
};