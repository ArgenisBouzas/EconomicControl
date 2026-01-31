// app/login/page.tsx
import { Suspense } from 'react';
import LoginForm from '../components/login/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">Cargando formulario de login...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}