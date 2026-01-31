// app/alumnos/page.tsx
export const dynamic = 'force-dynamic';

import AlumnosClient from './AlumnosClient';

export default function AlumnosPage() {
  return <AlumnosClient initialAlumnos={[]} />;
}