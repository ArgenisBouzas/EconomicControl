// components/GraficaMesAlumno.tsx
import React from 'react';


interface GraficaMesAlumnoProps {
  meses: string[];
  alumnos: string[];
  datos: Record<string, Record<string, number>>;
  titulo?: string;
}

const GraficaMesAlumno: React.FC<GraficaMesAlumnoProps> = ({ 
  meses, 
  alumnos, 
  datos, 
  titulo = "Ingresos por Mes y Alumno" 
}) => {
  if (!meses.length || !alumnos.length) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles de ingresos por mes y alumno</p>
      </div>
    );
  }

  // Calcular totales por mes
  const totalesPorMes = meses.map(mes => {
    const total = Object.values(datos[mes] || {}).reduce((sum, valor) => sum + valor, 0);
    return total;
  });

  const maxTotal = Math.max(...totalesPorMes);

  return (
    <div className="p-4">
      {titulo && (
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          {titulo}
        </h3>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white">
                Alumno / Mes
              </th>
              {meses.map((mes, index) => (
                <th 
                  key={index} 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                >
                  {mes}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Alumno
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {alumnos.map((alumno, alumnoIndex) => {
              const totalAlumno = meses.reduce((sum, mes) => {
                return sum + (datos[mes]?.[alumno] || 0);
              }, 0);

              return (
                <tr key={alumnoIndex} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    <div className="flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold mr-2">
                        {alumnoIndex + 1}
                      </div>
                      <span className="truncate max-w-[150px]">{alumno}</span>
                    </div>
                  </td>
                  
                  {meses.map((mes, mesIndex) => {
                    const valor = datos[mes]?.[alumno] || 0;
                    const porcentajeMes = totalesPorMes[mesIndex] > 0 
                      ? (valor / totalesPorMes[mesIndex]) * 100 
                      : 0;

                    return (
                      <td key={mesIndex} className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-green-600">
                            ${valor > 0 ? valor.toLocaleString('es-ES') : '-'}
                          </div>
                          {valor > 0 && (
                            <>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-700"
                                  style={{ width: `${porcentajeMes}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                {porcentajeMes.toFixed(0)}% del mes
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-blue-600">
                      ${totalAlumno.toLocaleString('es-ES')}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {/* Fila de totales por mes */}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-gray-50">
                Total por Mes
              </td>
              {totalesPorMes.map((total, index) => {
                const porcentajeTotal = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                return (
                  <td key={index} className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900">
                        ${total.toLocaleString('es-ES')}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                          style={{ width: `${porcentajeTotal}%` }}
                        />
                      </div>
                    </div>
                  </td>
                );
              })}
              <td className="px-4 py-3">
                <div className="text-sm font-bold text-gray-900">
                  ${totalesPorMes.reduce((sum, total) => sum + total, 0).toLocaleString('es-ES')}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800 font-medium">Total Alumnos Activos</p>
          <p className="text-xl font-bold text-blue-600">{alumnos.length}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-800 font-medium">Total Período (12 meses)</p>
          <p className="text-xl font-bold text-green-600">
            ${totalesPorMes.reduce((sum, total) => sum + total, 0).toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraficaMesAlumno;