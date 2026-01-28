// app/facturas/page.tsx
export default function FacturasPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📄 Gestión de Facturas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjetas de ejemplo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Facturas Pendientes</h2>
          <p className="text-4xl font-bold text-yellow-500">12</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Facturas Pagadas</h2>
          <p className="text-4xl font-bold text-green-500">48</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Total Recaudado</h2>
          <p className="text-4xl font-bold text-blue-500">$12,580</p>
        </div>
      </div>
      
      {/* Tabla de ejemplo */}
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Lista de Facturas Recientes</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500">Aquí iría tu tabla de facturas...</p>
        </div>
      </div>
    </div>
  );
}