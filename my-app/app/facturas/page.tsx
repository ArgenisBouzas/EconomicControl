// app/facturas/page.tsx - COMPONENTE SERVIDOR
import FacturasClient from './FacturasClient';
import { fetchAlumnos, fetchRegistrosConNombre } from '@/app/lib/data';

export default async function FacturasPage() {
  // Fetch data on the server


  const [alumnos, registros] = await Promise.all([
    fetchAlumnos(),
    fetchRegistrosConNombre()
  ]);

 
 
  const registrosConNombre = await fetchRegistrosConNombre();
  console.log('Registros fetched on Home page:', registrosConNombre);

const registrosPresupuesto = registrosConNombre;
const totalIngresos = registrosPresupuesto
  .filter(r => r.tipo === 'ingreso')
  .reduce((sum, r) => sum + Number(r.valor), 0);

const totalEgresos = registrosPresupuesto
  .filter(r => r.tipo === 'egreso')
  .reduce((sum, r) => sum + Number(r.valor), 0);







  // Calculate statistics


  
  const balanceTotal = totalIngresos - totalEgresos;

  return (
    <FacturasClient 
      initialAlumnos={alumnos}
      initialRegistros={registros}
      initialStats={{
        totalIngresos,
        totalEgresos,
        balanceTotal,
        totalRegistros: registros.length
      }}
    />
  );
}