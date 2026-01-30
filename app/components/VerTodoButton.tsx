// components/VerTodosButton.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function VerTodosButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/facturas/todos')}
      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
    >
      Ver todos los registros →
    </button>
  );
}