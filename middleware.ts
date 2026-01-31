// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
///api/registros
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🛡️ Middleware ejecutándose para:', pathname)
  
  // Verificar si la ruta es /facturas, /alumnos o sus subrutas
  if (pathname.startsWith('/facturas') || pathname.startsWith('/alumnos')|| pathname.startsWith('/api/registros')) {
    console.log('🔒 Ruta protegida detectada:', pathname)
    
    // Obtener todas las cookies
    const allCookies = request.cookies.getAll()
    console.log('🍪 Cookies disponibles:', allCookies)
    
    // Obtener token de autenticación
    const token = request.cookies.get('auth-token')?.value
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
    
    console.log('🔑 Token encontrado:', { token, sessionToken })
    
    // Si no hay token, redirigir a login
    if (!token && !sessionToken) {
      console.log('🚫 Sin token, redirigiendo a login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    console.log('✅ Acceso permitido')
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/facturas/:path*', '/alumnos/:path*', '/api/registros/:path*'],
}