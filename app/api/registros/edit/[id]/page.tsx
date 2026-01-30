// app/registros/edit/[id]/page.tsx
import RegistroEditClient from './RegistroEditClient';
import { fetchRegistroById, fetchAlumnos } from '@/app/lib/data';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRegistroPage({ params }: PageProps) {
  const { id } = await params;
  
  // Obtener datos del registro y alumnos
  const [registro, alumnos] = await Promise.all([
    fetchRegistroById(id),
    fetchAlumnos()
  ]);
  
  // Si el registro no existe, mostrar 404
  if (!registro) {
    notFound();
  }
  
  // Obtener ID del usuario actual (esto debería venir de tu sistema de autenticación)
  // Por ahora, usamos un valor por defecto o lo pasamos como prop
  const currentUserId = 1; // Reemplaza con tu lógica de autenticación
  
  return (
   
        <RegistroEditClient
          registroId={id}
          initialRegistro={registro}
          alumnos={alumnos}
          currentUserId={currentUserId}
        />
     
  );
}