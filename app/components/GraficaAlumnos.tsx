import React from 'react';

interface AlumnoIngreso {
  alumno: string;
  ingresos: number;
}

interface GraficaAlumnosProps {
  datos: AlumnoIngreso[];
  titulo?: string;
}

const GraficaAlumnos: React.FC<GraficaAlumnosProps> = ({ datos, titulo = "Top 10 Alumnos por Ingresos" }) => {
  if (!datos || datos.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles de ingresos por alumno</p>
      </div>
    );
  }

  const datosOrdenados = [...datos].sort((a, b) => b.ingresos - a.ingresos).slice(0, 10);
  const maxIngreso = Math.max(...datosOrdenados.map(d => d.ingresos));
  const totalIngresos = datos.reduce((sum, d) => sum + d.ingresos, 0);

  return (
    <div className="p-4">
      {titulo && (
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          {titulo}
        </h3>
      )}
      
      <div className="space-y-8">
        {datosOrdenados.map((item, index) => {
          const porcentaje = maxIngreso > 0 ? (item.ingresos / maxIngreso) * 100 : 0;
          const porcentajeTotal = totalIngresos > 0 ? (item.ingresos / totalIngresos) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {item.alumno}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    ${item.ingresos.toLocaleString('es-ES')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {porcentajeTotal.toFixed(1)}% del total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full flex items-center justify-end transition-all duration-700"
                      style={{ width: `${porcentaje}%` }}
                    >
                      {porcentaje > 40 && (
                        <span className="text-xs font-bold text-white mr-2">
                          {porcentaje.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-xs font-medium text-gray-600">
                    {porcentaje.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800 font-medium">Total Alumnos Activos</p>
            <p className="text-xl font-bold text-blue-600">{datos.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-800 font-medium">Ingresos Totales</p>
            <p className="text-xl font-bold text-green-600">
              ${totalIngresos.toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficaAlumnos;