// app/page.tsx - VERSIÓN CORREGIDA
import { fetchAlumnos, fetchRegistrosConNombre } from "./lib/data";
import { RegistroPresupuesto } from "./lib/definitions";
import GraficaIngresos from "./components/GraficaIngresos";
import GraficaAlumnos from "./components/GraficaAlumnos";
import GraficaMesAlumno from "./components/GraficaMesAlumno";

export default async function Home() {
  // Primero cargar los datos asíncronos
  const alumnos = await fetchAlumnos();
  const registrosConNombre = await fetchRegistrosConNombre();
  
  const registrosPresupuesto = registrosConNombre;
  
  // Función para calcular ingresos por mes y alumno (AHORA SÍ PUEDE ACCEDER A registrosPresupuesto)
  const calcularIngresosPorMesYAlumno = () => {
    const ahora = new Date();
    const ultimos12Meses: string[] = [];
    
    // Obtener nombres de los últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(ahora.getMonth() - i);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      ultimos12Meses.push(`${mes} ${año}`);
    }

    // Crear estructura para almacenar datos
    const datosPorMesYAlumno: Record<string, Record<string, number>> = {};
    
    // Inicializar estructura para todos los meses
    ultimos12Meses.forEach(mes => {
      datosPorMesYAlumno[mes] = {};
    });

    // Filtrar solo ingresos
    const ingresos = registrosPresupuesto.filter(r => r.tipo === 'ingreso');
    
    // Agrupar por mes y alumno
    ingresos.forEach(registro => {
      const fecha = new Date(registro.fecha_creacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      const mesKey = `${mes} ${año}`;
      const alumno = registro.alumno_nombre || 'Sin asignar';
      
      // Solo procesar si está en los últimos 12 meses
      if (ultimos12Meses.includes(mesKey)) {
        if (!datosPorMesYAlumno[mesKey][alumno]) {
          datosPorMesYAlumno[mesKey][alumno] = 0;
        }
        datosPorMesYAlumno[mesKey][alumno] += Number(registro.valor);
      }
    });

    // Obtener todos los alumnos únicos que tienen ingresos
    const alumnosUnicos = new Set<string>();
    Object.values(datosPorMesYAlumno).forEach(mesData => {
      Object.keys(mesData).forEach(alumno => {
        alumnosUnicos.add(alumno);
      });
    });

    const alumnosArray = Array.from(alumnosUnicos);

    // Formatear datos para la gráfica
    return {
      meses: ultimos12Meses,
      alumnos: alumnosArray,
      datos: datosPorMesYAlumno
    };
  };

  // Calcular todas las métricas DESPUÉS de tener registrosPresupuesto
  const totalIngresos = registrosPresupuesto
    .filter(r => r.tipo === 'ingreso')
    .reduce((sum, r) => sum + Number(r.valor), 0);

  const totalEgresos = registrosPresupuesto
    .filter(r => r.tipo === 'egreso')
    .reduce((sum, r) => sum + Number(r.valor), 0);

  const balanceTotal = totalIngresos - totalEgresos;

  // Función para calcular ingresos por mes de los últimos 12 meses
  const calcularIngresosPorMes = () => {
    const ahora = new Date();
    const ultimos12Meses: Array<{
      mes: string;
      año: number;
      mesNum: number;
      ingresos: number;
      egresos: number;
    }> = [];
    
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(ahora.getMonth() - i);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      ultimos12Meses.push({
        mes: `${mes} ${año}`,
        año: año,
        mesNum: fecha.getMonth() + 1,
        ingresos: 0,
        egresos: 0,
      });
    }

    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 12);

    const registrosRecientes = registrosPresupuesto.filter(registro => {
      const fechaRegistro = new Date(registro.fecha_creacion);
      return fechaRegistro >= fechaLimite;
    });

    registrosRecientes.forEach(registro => {
      const fecha = new Date(registro.fecha_creacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      const mesKey = `${mes} ${año}`;
      
      const mesIndex = ultimos12Meses.findIndex(m => m.mes === mesKey);
      
      if (mesIndex !== -1) {
        if (registro.tipo === 'ingreso') {
          ultimos12Meses[mesIndex].ingresos += Number(registro.valor);
        } else if (registro.tipo === 'egreso') {
          ultimos12Meses[mesIndex].egresos += Number(registro.valor);
        }
      }
    });

    return ultimos12Meses;
  };

  // Función para calcular TODOS los ingresos históricos (desde siempre)
  const calcularHistoricoCompleto = () => {
    // Agrupar todos los registros por año-mes
    const registrosPorMes: Record<string, {
      mes: string;
      año: number;
      mesNum: number;
      ingresos: number;
      egresos: number;
    }> = {};

    registrosPresupuesto.forEach(registro => {
      const fecha = new Date(registro.fecha_creacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      const mesKey = `${mes} ${año}`;
      
      if (!registrosPorMes[mesKey]) {
        registrosPorMes[mesKey] = {
          mes: mesKey,
          año: año,
          mesNum: fecha.getMonth() + 1,
          ingresos: 0,
          egresos: 0,
        };
      }
      
      if (registro.tipo === 'ingreso') {
        registrosPorMes[mesKey].ingresos += Number(registro.valor);
      } else if (registro.tipo === 'egreso') {
        registrosPorMes[mesKey].egresos += Number(registro.valor);
      }
    });

    // Convertir a array y ordenar por año y mes
    return Object.values(registrosPorMes).sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return a.mesNum - b.mesNum;
    });
  };

  // Función para calcular ingresos por alumno
  const calcularIngresosPorAlumno = () => {
    const ingresosPorAlumno: Record<string, number> = {};

    registrosPresupuesto.forEach(registro => {
      if (registro.tipo === 'ingreso' && registro.alumno_nombre) {
        const nombreAlumno = registro.alumno_nombre;
        
        if (!ingresosPorAlumno[nombreAlumno]) {
          ingresosPorAlumno[nombreAlumno] = 0;
        }
        
        ingresosPorAlumno[nombreAlumno] += Number(registro.valor);
      }
    });

    // Convertir a array de objetos
    return Object.entries(ingresosPorAlumno).map(([alumno, ingresos]) => ({
      alumno,
      ingresos
    }));
  };

  // Calcular todos los datos
  const datosGrafica = calcularIngresosPorMes();
  const datosHistoricoCompleto = calcularHistoricoCompleto();
  const datosPorAlumno = calcularIngresosPorAlumno();
  const datosPorMesYAlumno = calcularIngresosPorMesYAlumno(); // Ahora se puede calcular

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

      {/* Estadísticas Principales */}
      <div className="mt-12 mb-10">
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

      {/* PRIMERA GRÁFICA: Últimos 12 meses */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Análisis Financiero - Últimos 12 Meses
          </h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
            Vista Corto Plazo
          </span>
        </div>
        
        <GraficaIngresos datos={datosGrafica} />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Ingresos Totales (12 meses)</h3>
            <p className="text-2xl font-bold text-green-600">
              ${datosGrafica.reduce((sum, mes) => sum + mes.ingresos, 0).toLocaleString('es-ES')}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Egresos Totales (12 meses)</h3>
            <p className="text-2xl font-bold text-red-600">
              ${datosGrafica.reduce((sum, mes) => sum + mes.egresos, 0).toLocaleString('es-ES')}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Balance (12 meses)</h3>
            <p className={`text-2xl font-bold ${
              datosGrafica.reduce((sum, mes) => sum + (mes.ingresos - mes.egresos), 0) >= 0 
                ? 'text-blue-600' 
                : 'text-orange-600'
            }`}>
              ${datosGrafica.reduce((sum, mes) => sum + (mes.ingresos - mes.egresos), 0).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </section>

      {/* SEGUNDA GRÁFICA: Histórico completo */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📈 Histórico Completo de Ingresos y Egresos
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            Vista Largo Plazo
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando datos desde el inicio del registro. Total de meses: {datosHistoricoCompleto.length}</p>
        </div>
        
        <GraficaIngresos datos={datosHistoricoCompleto} />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Ingresos Históricos</h3>
            <p className="text-2xl font-bold text-green-600">
              ${datosHistoricoCompleto.reduce((sum, mes) => sum + mes.ingresos, 0).toLocaleString('es-ES')}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Egresos Históricos</h3>
            <p className="text-2xl font-bold text-red-600">
              ${datosHistoricoCompleto.reduce((sum, mes) => sum + mes.egresos, 0).toLocaleString('es-ES')}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Balance Histórico</h3>
            <p className={`text-2xl font-bold ${
              datosHistoricoCompleto.reduce((sum, mes) => sum + (mes.ingresos - mes.egresos), 0) >= 0 
                ? 'text-blue-600' 
                : 'text-orange-600'
            }`}>
              ${datosHistoricoCompleto.reduce((sum, mes) => sum + (mes.ingresos - mes.egresos), 0).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </section>

      {/* TERCERA GRÁFICA: Ingresos por alumno */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            👥 Ingresos por Alumno
          </h2>
          <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
            Análisis por Estudiante
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando ingresos totales por cada alumno. Total de alumnos con ingresos: {datosPorAlumno.length}</p>
        </div>
        
        <GraficaAlumnos datos={datosPorAlumno} />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Alumno con Mayor Ingreso</h3>
            {datosPorAlumno.length > 0 ? (
              <>
                <p className="text-lg font-bold text-gray-900">
                  {datosPorAlumno[0].alumno}
                </p>
                <p className="text-xl font-bold text-green-600">
                  ${datosPorAlumno[0].ingresos.toLocaleString('es-ES')}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No hay datos</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Promedio por Alumno</h3>
            <p className="text-2xl font-bold text-blue-600">
              ${datosPorAlumno.length > 0 
                ? (datosPorAlumno.reduce((sum, a) => sum + a.ingresos, 0) / datosPorAlumno.length).toLocaleString('es-ES', {maximumFractionDigits: 0})
                : '0'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Total de Alumnos Activos</h3>
            <p className="text-2xl font-bold text-purple-600">
              {datosPorAlumno.length}
            </p>
            <p className="text-sm text-gray-600">
              de {alumnos.length} alumnos totales
            </p>
          </div>
        </div>

 {/* CUARTA GRÁFICA: Ingresos por mes y alumno */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📅 Ingresos por Mes y Alumno (Últimos 12 meses)
          </h2>
          <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
            Vista Detallada
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando ingresos desglosados por alumno para cada mes.</p>
          <p>Los colores representan el porcentaje de participación de cada alumno en el total del mes.</p>
        </div>
        
        <GraficaMesAlumno 
          meses={datosPorMesYAlumno.meses}
          alumnos={datosPorMesYAlumno.alumnos}
          datos={datosPorMesYAlumno.datos}
          titulo=""
        />
      </section>
        
        {/* Tabla detallada de alumnos */}
        {datosPorAlumno.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h3 className="font-semibold text-gray-700 mb-3">Detalle por Alumno</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Ingresos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosPorAlumno.map((alumno, index) => {
                  const porcentaje = (alumno.ingresos / datosPorAlumno.reduce((sum, a) => sum + a.ingresos, 0)) * 100;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {alumno.alumno}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        ${alumno.ingresos.toLocaleString('es-ES')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {porcentaje.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Grid de dos columnas original */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* Sección de Alumnos */}
        <section className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          {/* ... tu código existente de alumnos ... */}
        </section>

        {/* Sección de Registros Presupuestarios */}
        <section className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
          {/* ... tu código existente de registros ... */}
        </section>
      </div>
    </main>
  );
}