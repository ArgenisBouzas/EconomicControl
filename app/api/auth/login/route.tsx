  //api/auth/login/route.tsx
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Verificar credenciales específicas
    if (email === 'argenisjb@gmail.com' && password === 'a22808144') {
      // Devolver respuesta JSON exitosa
      const response = NextResponse.json({ 
        success: true, 
        redirectTo: '/facturas' 
      });
      
      // Establecer cookie
      response.cookies.set({
        name: 'auth-token',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 horas
        path: '/',
      });

      return response;
    } else {
      // Credenciales incorrectas
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    );
  }
}