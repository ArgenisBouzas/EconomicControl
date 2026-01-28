"use client"; // Añade esta directiva al inicio del archivo

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname(); // Obtiene la ruta actual
  
  const navItems = [
    { name: "🏠 Inicio", path: "/" },
    { name: "🧾 Facturas", path: "/facturas" },
    { name: "👥 Alumnos", path: "/alumnos" },
    { name: "📊 Reportes", path: "/reportes" },
    { name: "⚙️ Configuración", path: "/configuracion" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Título */}
      <div className="p-6 bg-gray-800">
        <h2 className="text-xl font-bold">Sistema de Facturación</h2>
        <p className="text-gray-400 text-sm mt-1">Panel de administración</p>
      </div>

      {/* Navegación */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            // Determina si la ruta actual está activa
            const isActive = pathname === item.path || 
                            (item.path !== "/" && pathname?.startsWith(item.path));
            
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="float-right">📍</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pie */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/logout"
          className="block text-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          🚪 Cerrar Sesión
        </Link>
      </div>
    </aside>
  );
}