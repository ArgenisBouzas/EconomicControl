'use client';

import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  registroId: string;
  registroDescripcion: string;
}

export function DeleteButton({ registroId, registroDescripcion }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el registro "${registroDescripcion}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/registros/${registroId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Registro eliminado correctamente');
        router.refresh(); // Refresca la página para mostrar los cambios
      } else {
        throw new Error('Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el registro');
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Eliminar
    </button>
  );
}