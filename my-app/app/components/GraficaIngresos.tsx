// app/components/GraficaIngresos.tsx - VERSIÓN CORREGIDA
'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

interface MesData {
  mes: string;
  año: number;
  mesNum: number;
  ingresos: number;
  egresos: number;
}

interface GraficaIngresosProps {
  datos: MesData[];
}

// Componente para etiquetas de ingresos (verde)
const renderIngresosLabel = (props: unknown) => {
  const { x, y, width, value } = props as { x: number; y: number; width: number; value: number };
  
  if (Number(value) <= 0) return null;
  
  const formattedValue = `$${Number(value).toLocaleString('es-ES', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })}`;
  
  const fontSize = formattedValue.length > 10 ? 9 : 11;
  
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#059669"
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight="bold"
      className="font-sans"
    >
      {formattedValue}
    </text>
  );
};

// Componente para etiquetas de egresos (rojo)
const renderEgresosLabel = (props: unknown) => {
  const { x, y, width, value } = props as { x: number; y: number; width: number; value: number };
  
  if (Number(value) <= 0) return null;
  
  const formattedValue = `$${Number(value).toLocaleString('es-ES', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  })}`;
  
  const fontSize = formattedValue.length > 10 ? 9 : 11;
  
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#DC2626"
      textAnchor="middle"
      fontSize={fontSize}
      fontWeight="bold"
      className="font-sans"
    >
      {formattedValue}
    </text>
  );
};

export default function GraficaIngresos({ datos }: GraficaIngresosProps) {
  // Validación para datos vacíos
  if (!datos || datos.length === 0) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[300px] h-80">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <BarChart
          data={datos}
          margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="mes" 
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString('es-ES')}`}
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            formatter={(value: unknown, name: unknown) => {
                const numericValue = typeof value === 'number' ? value : 
                                    typeof value === 'string' ? parseFloat(value) : 0;
                
                const formattedValue = isNaN(numericValue) ? '0' : 
                                        `$${numericValue.toLocaleString('es-ES')}`;
                
                const displayName = typeof name === 'string' ? name : 
                                    name?.toString() || '';
                
                return [formattedValue, displayName];
            }}
            labelFormatter={(label) => `Mes: ${label}`}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ 
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>}
          />
          
          {/* Barra de Ingresos con etiqueta verde */}
          <Bar 
            dataKey="ingresos" 
            name="Ingresos" 
            fill="#10B981" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            <LabelList 
              dataKey="ingresos" 
              content={renderIngresosLabel}
              position="top"
            />
          </Bar>
          
          {/* Barra de Egresos con etiqueta roja */}
          <Bar 
            dataKey="egresos" 
            name="Egresos" 
            fill="#EF4444" 
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            <LabelList 
              dataKey="egresos" 
              content={renderEgresosLabel}
              position="top"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}