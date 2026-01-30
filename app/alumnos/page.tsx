// app/alumnos/page.tsx
import AlumnosClient from './AlumnosClient';
import { fetchAlumnos } from '@/app/lib/data';

export default async function AlumnosPage() {
  // Obtener alumnos desde el servidor
  const alumnos = await fetchAlumnos();
  
  return <AlumnosClient initialAlumnos={alumnos} />;
}