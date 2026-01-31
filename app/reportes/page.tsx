import { fetchAlumnos, fetchRegistrosConNombre } from "../lib/data";
import { RegistroPresupuesto } from "../lib/definitions";
import GraficaIngresos from "../components/GraficaIngresos";
import GraficaAlumnos from "../components/GraficaAlumnos";
import GraficaMesAlumno from "../components/GraficaMesAlumno";
export const dynamic = 'force-dynamic'

export default async function ReportesPage() {

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
      const datosPorMesYAlumno = calcularIngresosPorMesYAlumno(); // Últimos 12 meses
      const datosPorMesYAlumnoCompleto = calcularIngresosPorMesYAlumnoCompleto(); // Histórico completo
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">📊 Reportes</h1>
     
      {/* Contenido adicional de reportes puede ir aquí */}
         <section className="bg-white rounded-2xl shadow-xl p-6 mb-8 hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📊 Histórico Completo por Mes y Alumno
          </h2>
          <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
            Vista Histórica Completa
          </span>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p>Mostrando TODOS los ingresos históricos desglosados por alumno para cada mes desde el inicio.</p>
          <p>Total meses: {datosPorMesYAlumnoCompleto.meses.length} | Total alumnos: {datosPorMesYAlumnoCompleto.alumnos.length}</p>
          <p className="text-xs mt-2 text-gray-500">
            * Los meses se ordenan cronológicamente desde el primer registro
          </p>
        </div>
        
        <GraficaMesAlumno 
          meses={datosPorMesYAlumnoCompleto.meses}
          alumnos={datosPorMesYAlumnoCompleto.alumnos}
          datos={datosPorMesYAlumnoCompleto.datos}
          titulo=""
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">Periodo Histórico</h3>
            <p className="text-lg font-bold text-amber-900">
              {datosPorMesYAlumnoCompleto.meses.length} meses
            </p>
            <p className="text-sm text-amber-700">
              Desde {datosPorMesYAlumnoCompleto.meses[0] || 'N/A'}
            </p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">Alumnos Totales Históricos</h3>
            <p className="text-2xl font-bold text-amber-600">
              {datosPorMesYAlumnoCompleto.alumnos.length}
            </p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">Total Histórico</h3>
            <p className="text-2xl font-bold text-green-600">
              ${Object.values(datosPorMesYAlumnoCompleto.datos).reduce((sum, mesData) => {
                return sum + Object.values(mesData).reduce((mesSum, valor) => mesSum + valor, 0);
              }, 0).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}