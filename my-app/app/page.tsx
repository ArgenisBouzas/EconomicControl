// app/page.tsx
import { fetchAlumnos, fetchRegistros, fetchRegistrosConNombre } from "./lib/data";
import { RegistroPresupuesto } from "./lib/definitions";

export default async function Home() {
  const alumnos = await fetchAlumnos();
 
  const registrosConNombre = await fetchRegistrosConNombre();
  console.log('Registros fetched on Home page:', registrosConNombre);

const registrosPresupuesto = registrosConNombre as RegistroPresupuesto[];
const totalIngresos = registrosPresupuesto
  .filter(r => r.tipo === 'ingreso')
  .reduce((sum, r) => sum + Number(r.valor), 0);

const totalEgresos = registrosPresupuesto
  .filter(r => r.tipo === 'egreso')
  .reduce((sum, r) => sum + Number(r.valor), 0);

// También puedes calcular el balance
const balanceTotal = totalIngresos - totalEgresos;
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      
      {/* Encabezado Principal */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Sistema de Gestión Escolar
        </h1>
        <p className="text-gray-600 text-lg">
          Administración de Alumnos y Registros Presupuestarios
        </p>
      </header>
      <div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            <div className="px-4">
              <p className="text-2xl font-bold text-gray-800">{alumnos.length}</p>
              <p className="text-gray-600">Total Alumnos</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-bold text-green-600">
                ${totalIngresos.toLocaleString('es-ES')}
              </p>
              <p className="text-gray-600">Total Ingresos</p>
            </div>
            <div className="px-4">
              <p className="text-2xl font-bold text-red-600">
                ${totalEgresos.toLocaleString('es-ES')}
              </p>
              <p className="text-gray-600">Total Egresos</p>
            </div>
            <div className="px-4">
              <p className={`text-2xl font-bold ${balanceTotal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                ${balanceTotal.toLocaleString('es-ES')}
              </p>
              <p className="text-gray-600">Balance Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* Sección de Alumnos */}
        <section className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📚 Lista de Alumnos
            </h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
              {alumnos.length} registros
            </span>
          </div>
          
          <ul className="space-y-3">
            {alumnos.map((alumno) => (
              <li 
                key={alumno.id}
                className="bg-gray-50 hover:bg-blue-50 p-4 rounded-lg border border-gray-100 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {alumno.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{alumno.nombre}</p>
                    <p className="text-sm text-gray-500">ID: {alumno.id} </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Sección de Registros Presupuestarios */}
        <section className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              💰 Registros Presupuestarios
            </h2>
            <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
              {registrosConNombre.length} transacciones
            </span>
          </div>
          
          <ul className="space-y-4">
            {registrosConNombre.map((registro) => {
              const isIngreso = registro.tipo === 'ingreso';
              const fecha = new Date(registro.fecha_creacion).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              
              return (
                <li 
                  key={registro.id}
                  className="border-l-4 border-gray-200 hover:border-opacity-80 p-4 bg-gray-50 rounded-r-lg transition-all duration-200"
                  style={{ borderLeftColor: isIngreso ? '#10B981' : '#EF4444' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isIngreso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isIngreso ? '➕ Ingreso' : '➖ Egreso'}
                        </span>
                        <span className="text-sm text-gray-500">{fecha}</span>
                      </div>
                      
                      <h3 className="font-medium text-gray-800 mb-1">
                        {registro.descripcion}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-3">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Valor:</span>
                          <span className={`font-bold ${isIngreso ? 'text-green-600' : 'text-red-600'}`}>
                            ${registro.valor.toLocaleString('es-ES')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Alumno ID:</span>
                          <span className="font-medium text-blue-600">{registro.alumno_id} | {registro.alumno_nombre}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Usuario ID:</span>
                          <span>{registro.usuario_id}</span>
                        </div>
                        {registro.docname && (
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">Documento:</span>
                            <span className="text-blue-500 underline cursor-pointer">{registro.docname}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-xs text-gray-400 mb-1">
                        ID: {registro.id.slice(0, 8)}...
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /> */}
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Footer con estadísticas */}
      
    </main>
  );
}