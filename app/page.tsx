// app/page.tsx - VERSIÓN MODIFICADA CON EGRESOS POR ALUMNO
import { fetchAlumnos, fetchRegistrosConNombre } from "./lib/data";
import { RegistroPresupuesto } from "./lib/definitions";
import GraficaIngresos from "./components/GraficaIngresos";
import GraficaAlumnos from "./components/GraficaAlumnos";
import GraficaMesAlumno from "./components/GraficaMesAlumno";
import VerTodoButton from "./components/VerTodoButton";

export default async function Home() {
  // Primero cargar los datos asíncronos
  const alumnos = await fetchAlumnos();
  const registrosConNombre = await fetchRegistrosConNombre();
  
  const registrosPresupuesto = registrosConNombre;
  
  // Función para calcular ingresos por mes y alumno (ÚLTIMOS 12 MESES)
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

  // Función NUEVA: calcular ingresos por mes y alumno (HISTÓRICO COMPLETO)
  const calcularIngresosPorMesYAlumnoCompleto = () => {
    // Crear estructura para almacenar datos
    const datosPorMesYAlumno: Record<string, Record<string, number>> = {};

    // Filtrar solo ingresos
    const ingresos = registrosPresupuesto.filter(r => r.tipo === 'ingreso');
    
    // Primero, obtener todos los meses únicos
    const mesesUnicos = new Set<string>();
    
    ingresos.forEach(registro => {
      const fecha = new Date(registro.fecha_creacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      const mesKey = `${mes} ${año}`;
      mesesUnicos.add(mesKey);
    });

    // Convertir a array y ordenar cronológicamente
    const mesesArray = Array.from(mesesUnicos).sort((a, b) => {
      const [mesA, añoA] = a.split(' ');
      const [mesB, añoB] = b.split(' ');
      
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const mesIndexA = meses.indexOf(mesA.toLowerCase());
      const mesIndexB = meses.indexOf(mesB.toLowerCase());
      
      const fechaA = new Date(Number(añoA), mesIndexA);
      const fechaB = new Date(Number(añoB), mesIndexB);
      
      return fechaA.getTime() - fechaB.getTime();
    });

    // Inicializar estructura para todos los meses
    mesesArray.forEach(mes => {
      datosPorMesYAlumno[mes] = {};
    });

    // Agrupar por mes y alumno
    ingresos.forEach(registro => {
      const fecha = new Date(registro.fecha_creacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const año = fecha.getFullYear();
      const mesKey = `${mes} ${año}`;
      const alumno = registro.alumno_nombre || 'Sin asignar';
      
      if (!datosPorMesYAlumno[mesKey]) {
        datosPorMesYAlumno[mesKey] = {};
      }
      
      if (!datosPorMesYAlumno[mesKey][alumno]) {
        datosPorMesYAlumno[mesKey][alumno] = 0;
      }
      datosPorMesYAlumno[mesKey][alumno] += Number(registro.valor);
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
      meses: mesesArray,
      alumnos: alumnosArray,
      datos: datosPorMesYAlumno
    };
  };

  // Función NUEVA: calcular egresos por alumno
  const calcularEgresosPorAlumno = () => {
    const egresosPorAlumno: Record<string, number> = {};

    registrosPresupuesto.forEach(registro => {
      if (registro.tipo === 'egreso' && registro.alumno_nombre) {
        const nombreAlumno = registro.alumno_nombre;
        
        if (!egresosPorAlumno[nombreAlumno]) {
          egresosPorAlumno[nombreAlumno] = 0;
        }
        
        egresosPorAlumno[nombreAlumno] += Number(registro.valor);
      }
    });

    // Convertir a array de objetos y ordenar por egresos (mayor a menor)
    return Object.entries(egresosPorAlumno)
      .map(([alumno, egresos]) => ({
        alumno,
        egresos
      }))
      .sort((a, b) => b.egresos - a.egresos);
  };

  // Función NUEVA: calcular ingresos y egresos por alumno (datos combinados)
  const calcularIngresosYEgresosPorAlumno = () => {
    const datosPorAlumno: Record<string, { ingresos: number, egresos: number }> = {};

    registrosPresupuesto.forEach(registro => {
      if (registro.alumno_nombre) {
        const nombreAlumno = registro.alumno_nombre;
        
        if (!datosPorAlumno[nombreAlumno]) {
          datosPorAlumno[nombreAlumno] = { ingresos: 0, egresos: 0 };
        }
        
        if (registro.tipo === 'ingreso') {
          datosPorAlumno[nombreAlumno].ingresos += Number(registro.valor);
        } else if (registro.tipo === 'egreso') {
          datosPorAlumno[nombreAlumno].egresos += Number(registro.valor);
        }
      }
    });

    // Convertir a array de objetos y agregar balance
    return Object.entries(datosPorAlumno)
      .map(([alumno, datos]) => ({
        alumno,
        ingresos: datos.ingresos,
        egresos: datos.egresos,
        balance: datos.ingresos - datos.egresos
      }))
      .sort((a, b) => b.ingresos - a.ingresos); // Ordenar por ingresos (mayor a menor)
  };

  // Función NUEVA: calcular egresos por mes y alumno (ÚLTIMOS 12 MESES)
  const calcularEgresosPorMesYAlumno = () => {
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

    // Filtrar solo egresos
    const egresos = registrosPresupuesto.filter(r => r.tipo === 'egreso');
    
    // Agrupar por mes y alumno
    egresos.forEach(registro => {
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

    // Obtener todos los alumnos únicos que tienen egresos
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

    // Convertir a array de objetos y ordenar por ingresos (mayor a menor)
    return Object.entries(ingresosPorAlumno)
      .map(([alumno, ingresos]) => ({
        alumno,
        ingresos
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  };

  // Calcular todos los datos
  const datosGrafica = calcularIngresosPorMes();
  const datosHistoricoCompleto = calcularHistoricoCompleto();
  const datosPorAlumno = calcularIngresosPorAlumno();
  const datosPorMesYAlumno = calcularIngresosPorMesYAlumno(); // Últimos 12 meses
  const datosPorMesYAlumnoCompleto = calcularIngresosPorMesYAlumnoCompleto(); // Histórico completo
  const datosEgresosPorAlumno = calcularEgresosPorAlumno(); // NUEVO: Egresos por alumno
  const datosCombinadosPorAlumno = calcularIngresosYEgresosPorAlumno(); // NUEVO: Ingresos y egresos combinados
  const datosEgresosPorMesYAlumno = calcularEgresosPorMesYAlumno(); // NUEVO: Egresos por mes y alumno

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

       <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Registros Recientes</h2>
              <p className="text-sm text-gray-500 mt-1">Últimos 5 registros</p>
            </div>
            {/* listado de facturas recientes */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <div className="text-center mt-4">
                  <VerTodoButton></VerTodoButton>
                </div>
              {registrosPresupuesto.slice(0, 10).map((registro) => (
                
                <div 
                  key={registro.id} 
                  className="mb-4 p-4 border rounded-lg hover:bg-gray-50 transition duration-200"
                >
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800 truncate">
                      {registro.alumno_nombre || 'Alumno no encontrado'}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      registro.tipo === 'ingreso' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {registro.tipo === 'ingreso' ? 'INGRESO' : 'EGRESO'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {registro.descripcion}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${
                      registro.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${registro.valor.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(registro.fecha_creacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {registrosPresupuesto.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay registros disponibles
                </div>
              )}
              
              {registrosPresupuesto.length > 0 && (
                <div className="text-center mt-4">
                  <VerTodoButton></VerTodoButton>
                </div>
              )}
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
      </section>

      {/* CUARTA GRÁFICA: Ingresos por mes y alumno (Últimos 12 meses) */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📅 Ingresos por Mes y Alumno (Últimos 12 meses)
          </h2>
          <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
            Vista Detallada - Corto Plazo
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando ingresos desglosados por alumno para cada mes. Período: Últimos 12 meses</p>
          <p>Total meses: {datosPorMesYAlumno.meses.length} | Total alumnos: {datosPorMesYAlumno.alumnos.length}</p>
        </div>
        
        <GraficaMesAlumno 
          meses={datosPorMesYAlumno.meses}
          alumnos={datosPorMesYAlumno.alumnos}
          datos={datosPorMesYAlumno.datos}
          titulo=""
        />
      </section>

      {/* QUINTA GRÁFICA: Egresos por alumno (NUEVA) */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            💸 Egresos por Alumno
          </h2>
          <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
            Gastos por Estudiante
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando egresos totales por cada alumno. Total de alumnos con egresos: {datosEgresosPorAlumno.length}</p>
        </div>
        
        {/* Usamos el mismo componente GraficaAlumnos pero con datos de egresos */}
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Total de Egresos por Alumnos</h3>
            <p className="text-2xl font-bold text-red-600">
              ${datosEgresosPorAlumno.reduce((sum, a) => sum + a.egresos, 0).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
        
        {datosEgresosPorAlumno.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Egresos
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
                {datosEgresosPorAlumno.map((alumno, index) => {
                  const totalEgresosAlumnos = datosEgresosPorAlumno.reduce((sum, a) => sum + a.egresos, 0);
                  const porcentaje = totalEgresosAlumnos > 0 
                    ? (alumno.egresos / totalEgresosAlumnos) * 100 
                    : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {alumno.alumno}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">
                        ${alumno.egresos.toLocaleString('es-ES')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                        {porcentaje.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          index === 0 ? 'bg-red-100 text-red-800' :
                          index === 1 ? 'bg-orange-100 text-orange-800' :
                          index === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos de egresos por alumno disponibles
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Alumno con Mayor Egreso</h3>
            {datosEgresosPorAlumno.length > 0 ? (
              <>
                <p className="text-lg font-bold text-gray-900">
                  {datosEgresosPorAlumno[0].alumno}
                </p>
                <p className="text-xl font-bold text-red-600">
                  ${datosEgresosPorAlumno[0].egresos.toLocaleString('es-ES')}
                </p>
              </>
            ) : (
              <p className="text-gray-500">No hay datos</p>
            )}
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Promedio de Egresos</h3>
            <p className="text-2xl font-bold text-red-600">
              ${datosEgresosPorAlumno.length > 0 
                ? (datosEgresosPorAlumno.reduce((sum, a) => sum + a.egresos, 0) / datosEgresosPorAlumno.length).toLocaleString('es-ES', {maximumFractionDigits: 0})
                : '0'}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Alumnos con Egresos</h3>
            <p className="text-2xl font-bold text-red-600">
              {datosEgresosPorAlumno.length}
            </p>
            <p className="text-sm text-gray-600">
              de {alumnos.length} alumnos totales
            </p>
          </div>
        </div>
      </section>

      {/* SEXTA GRÁFICA: Balance por alumno (Ingresos vs Egresos) */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ⚖️ Balance por Alumno (Ingresos vs Egresos)
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            Análisis Completo
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Comparación de ingresos y egresos por cada alumno. Total de alumnos con registros: {datosCombinadosPorAlumno.length}</p>
        </div>
        
        {datosCombinadosPorAlumno.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-500 uppercase tracking-wider">
                    Egresos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosCombinadosPorAlumno.map((alumno, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {alumno.alumno}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                      ${alumno.ingresos.toLocaleString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      ${alumno.egresos.toLocaleString('es-ES')}
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold ${
                      alumno.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      ${alumno.balance.toLocaleString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alumno.balance > 0 
                          ? 'bg-green-100 text-green-800' 
                          : alumno.balance < 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alumno.balance > 0 ? 'Positivo' : alumno.balance < 0 ? 'Negativo' : 'Neutral'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay datos combinados por alumno disponibles
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Alumno con Mejor Balance</h3>
            {datosCombinadosPorAlumno.length > 0 ? (
              (() => {
                const alumnoMejorBalance = [...datosCombinadosPorAlumno]
                  .filter(a => a.balance > 0)
                  .sort((a, b) => b.balance - a.balance)[0];
                
                return alumnoMejorBalance ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {alumnoMejorBalance.alumno}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      +${alumnoMejorBalance.balance.toLocaleString('es-ES')}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No hay balances positivos</p>
                );
              })()
            ) : (
              <p className="text-gray-500">No hay datos</p>
            )}
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Alumno con Peor Balance</h3>
            {datosCombinadosPorAlumno.length > 0 ? (
              (() => {
                const alumnoPeorBalance = [...datosCombinadosPorAlumno]
                  .filter(a => a.balance < 0)
                  .sort((a, b) => a.balance - b.balance)[0];
                
                return alumnoPeorBalance ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {alumnoPeorBalance.alumno}
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      -${Math.abs(alumnoPeorBalance.balance).toLocaleString('es-ES')}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">No hay balances negativos</p>
                );
              })()
            ) : (
              <p className="text-gray-500">No hay datos</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Balance General</h3>
            <p className={`text-2xl font-bold ${
              datosCombinadosPorAlumno.reduce((sum, a) => sum + a.balance, 0) >= 0 
                ? 'text-blue-600' 
                : 'text-orange-600'
            }`}>
              ${datosCombinadosPorAlumno.reduce((sum, a) => sum + a.balance, 0).toLocaleString('es-ES')}
            </p>
            <p className="text-sm text-gray-600">
              {datosCombinadosPorAlumno.filter(a => a.balance >= 0).length} alumnos positivos
            </p>
          </div>
        </div>
      </section>

      {/* SÉPTIMA GRÁFICA: Egresos por mes y alumno (Últimos 12 meses) */}
      <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📉 Egresos por Mes y Alumno (Últimos 12 meses)
          </h2>
          <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
            Gastos Detallados
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando egresos desglosados por alumno para cada mes. Período: Últimos 12 meses</p>
          <p>Total meses: {datosEgresosPorMesYAlumno.meses.length} | Total alumnos: {datosEgresosPorMesYAlumno.alumnos.length}</p>
        </div>
        
        <GraficaMesAlumno 
          meses={datosEgresosPorMesYAlumno.meses}
          alumnos={datosEgresosPorMesYAlumno.alumnos}
          datos={datosEgresosPorMesYAlumno.datos}
          titulo="Egresos por Mes y Alumno"
          color="red"
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Egresos Totales (12 meses)</h3>
            <p className="text-2xl font-bold text-red-600">
              ${Object.values(datosEgresosPorMesYAlumno.datos).reduce((sum, mesData) => {
                return sum + Object.values(mesData).reduce((mesSum, valor) => mesSum + valor, 0);
              }, 0).toLocaleString('es-ES')}
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Mes con Mayor Egreso</h3>
            {datosEgresosPorMesYAlumno.meses.length > 0 ? (
              (() => {
                let mesMayorEgreso = '';
                let maxEgreso = 0;
                
                Object.entries(datosEgresosPorMesYAlumno.datos).forEach(([mes, datosMes]) => {
                  const totalMes = Object.values(datosMes).reduce((sum, valor) => sum + valor, 0);
                  if (totalMes > maxEgreso) {
                    maxEgreso = totalMes;
                    mesMayorEgreso = mes;
                  }
                });
                
                return (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {mesMayorEgreso}
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      ${maxEgreso.toLocaleString('es-ES')}
                    </p>
                  </>
                );
              })()
            ) : (
              <p className="text-gray-500">No hay datos</p>
            )}
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Alumnos con Egresos</h3>
            <p className="text-2xl font-bold text-red-600">
              {datosEgresosPorMesYAlumno.alumnos.length}
            </p>
            <p className="text-sm text-gray-600">
              en los últimos 12 meses
            </p>
          </div>
        </div>
      </section>
      
    </main>
  );
}