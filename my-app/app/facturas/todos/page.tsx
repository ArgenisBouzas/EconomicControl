// app/page.tsx
import { fetchRegistrosConNombre } from "../../lib/data";
import Link from "next/link";
import { DeleteButton } from "../../components/DeleteButton";

export default async function Home() {
  const registrosConNombre = await fetchRegistrosConNombre();
  console.log('Registros fetched on Home page:', registrosConNombre);

  const registrosPresupuesto = registrosConNombre;
  const totalIngresos = registrosPresupuesto
    .filter(r => r.tipo === 'ingreso')
    .reduce((sum, r) => sum + Number(r.valor), 0);

  const totalEgresos = registrosPresupuesto
    .filter(r => r.tipo === 'egreso')
    .reduce((sum, r) => sum + Number(r.valor), 0);

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
    
      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 gap-8 max-w-7xl mx-auto">
        
        {/* Sección de Registros Presupuestarios */}
        <section className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                💰 Registros Presupuestarios
              </h2>
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                {registrosConNombre.length} transacciones
              </span>
            </div>
            <Link 
              href="/registros/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              + Nuevo Registro
            </Link>
          </div>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-medium">Total Ingresos</span>
                <span className="text-green-600 text-lg font-bold">${totalIngresos.toLocaleString('es-ES')}</span>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center justify-between">
                <span className="text-red-600 font-medium">Total Egresos</span>
                <span className="text-red-600 text-lg font-bold">${totalEgresos.toLocaleString('es-ES')}</span>
              </div>
            </div>
            <div className={`p-4 rounded-xl border ${balanceTotal >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className="flex items-center justify-between">
                <span className={balanceTotal >= 0 ? "text-blue-600 font-medium" : "text-orange-600 font-medium"}>Balance Total</span>
                <span className={balanceTotal >= 0 ? "text-blue-600 text-lg font-bold" : "text-orange-600 text-lg font-bold"}>
                  ${balanceTotal.toLocaleString('es-ES')}
                </span>
              </div>
            </div>
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
                  className="border-l-4 border-gray-200 hover:border-opacity-80 p-4 bg-gray-50 rounded-r-lg transition-all duration-200 group hover:bg-gray-100"
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
                          <span className="font-medium">Alumno:</span>
                          <span className="font-medium text-blue-600">{registro.alumno_nombre} (ID: {registro.alumno_id})</span>
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
                    
                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <div className="text-xs text-gray-400 mb-1">
                        ID: {registro.id.slice(0, 8)}...
                      </div>
                      
                      {/* Botones de Acción */}
                      <div className="flex items-center space-x-2">
                        {/* Botón Editar */}
                        <Link
                          href={`/registros/edit/${registro.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </Link>
                        
                        {/* Botón Eliminar - Componente separado */}
                        <DeleteButton registroId={registro.id} registroDescripcion={registro.descripcion} />
                      </div>
                      
                      {/* Botón para ver detalles */}
                      <Link
                        href={`/registros/${registro.id}`}
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Footer con estadísticas */}
      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>Sistema de Gestión Escolar • Total de registros: {registrosConNombre.length} • Balance: ${balanceTotal.toLocaleString('es-ES')}</p>
      </footer>
    </main>
  );
}