// app/alumnos/page.tsx
export const dynamic = 'force-dynamic';

import { fetchAlumnos } from '../lib/data';
import AlumnosClient from './AlumnosClient';

export default async function AlumnosPage() {
  const alumnos = await fetchAlumnos(); // Esto ahora retornará [] durante build
  return <AlumnosClient initialAlumnos={alumnos} />;
}