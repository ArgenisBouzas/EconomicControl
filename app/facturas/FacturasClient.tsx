// app/facturas/FacturasClient.tsx - COMPONENTE CLIENTE
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alumno, RegistroPresupuestoConAlumno } from '@/app/lib/definitions';
import VerTodoButton from '../components/VerTodoButton';

interface FacturasClientProps {
  initialAlumnos: Alumno[];
  initialRegistros: RegistroPresupuestoConAlumno[];
  initialStats: {
    totalIngresos: number;
    totalEgresos: number;
    balanceTotal: number;
    totalRegistros: number;
  };
}

export default function FacturasClient({
  initialAlumnos,
  initialRegistros,
  initialStats
}: FacturasClientProps) {
  const router = useRouter();
  const [alumnos] = useState(initialAlumnos);
  const [registros, setRegistros] = useState(initialRegistros);
  const [stats, setStats] = useState(initialStats);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    usuario_id: 1,
    alumno_id: '',
    descripcion: '',
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    valor: '',
    docname: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.alumno_id) {
      newErrors.alumno_id = 'Debe seleccionar un alumno';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    } else if (formData.descripcion.length < 3) {
      newErrors.descripcion = 'La descripción debe tener al menos 3 caracteres';
    }
    
    if (!formData.valor) {
      newErrors.valor = 'El valor es requerido';
    } else if (isNaN(Number(formData.valor)) || Number(formData.valor) <= 0) {
      newErrors.valor = 'El valor debe ser un número mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
// En la función handleSubmit dentro de FacturasClient.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/registros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        valor: Number(formData.valor),
        // fecha_creacion y fecha_actualizacion ahora las maneja el backend
        metadata: {},
        ruta: null
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear el registro');
    }
    
    // El nuevo registro ya viene con alumno_nombre desde la API
    const newRegistro: RegistroPresupuestoConAlumno = data;
    
    // Actualizar el estado local con el nuevo registro
    const updatedRegistros = [newRegistro, ...registros];
    setRegistros(updatedRegistros);
    
    // Recalcular estadísticas
    const totalIngresos = updatedRegistros
      .filter(r => r.tipo === 'ingreso')
      .reduce((sum, r) => sum + r.valor, 0);
    
    const totalEgresos = updatedRegistros
      .filter(r => r.tipo === 'egreso')
      .reduce((sum, r) => sum + r.valor, 0);
    
    setStats({
      totalIngresos,
      totalEgresos,
      balanceTotal: totalIngresos - totalEgresos,
      totalRegistros: updatedRegistros.length
    });
    
    // Limpiar formulario
    setFormData({
      usuario_id: 1,
      alumno_id: '',
      descripcion: '',
      tipo: 'ingreso',
      valor: '',
      docname: '',
    });
    
    alert('Registro creado exitosamente');
    
  } catch (error) {
    console.error('Error:', error);
    alert(error instanceof Error ? error.message : 'Error al crear el registro');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📄 Registro de Facturas y Presupuesto</h1>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Total Ingresos</h2>
          <p className="text-4xl font-bold text-green-500">${stats.totalIngresos.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Total Egresos</h2>
          <p className="text-4xl font-bold text-red-500">${stats.totalEgresos.toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Balance Total</h2>
          <p className={`text-4xl font-bold ${stats.balanceTotal >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            ${stats.balanceTotal.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Total Registros</h2>
          <p className="text-4xl font-bold text-purple-500">{stats.totalRegistros}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Registro</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alumno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alumno *
                </label>
                <select
                  name="alumno_id"
                  value={formData.alumno_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.alumno_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar alumno...</option>
                  {alumnos.map(alumno => (
                    <option key={alumno.id} value={alumno.id}>
                      {alumno.nombre}
                    </option>
                  ))}
                </select>
                {errors.alumno_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.alumno_id}</p>
                )}
              </div>
              
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Registro *
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="ingreso"
                      checked={formData.tipo === 'ingreso'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-green-600 font-medium">Ingreso</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="egreso"
                      checked={formData.tipo === 'egreso'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-red-600 font-medium">Egreso</span>
                  </label>
                </div>
              </div>
              
              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Pago de matrícula mensual, Compra de materiales, etc."
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                )}
              </div>
              
              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="text"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    className={`w-full pl-8 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.valor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.valor && (
                  <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
                )}
              </div>
              
              {/* Nombre del documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Documento (Opcional)
                </label>
                <input
                  type="text"
                  name="docname"
                  value={formData.docname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: factura_001.pdf, recibo_pago.jpg"
                />
              </div>
              
              {/* Botones */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      usuario_id: 1,
                      alumno_id: '',
                      descripcion: '',
                      tipo: 'ingreso',
                      valor: '',
                      docname: '',
                    });
                    setErrors({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Limpiar Formulario
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Lista de Registros Recientes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Registros Recientes</h2>
              <p className="text-sm text-gray-500 mt-1">Últimos 5 registros</p>
              <div className="text-center mt-4">
                  <VerTodoButton></VerTodoButton>
                </div>
            </div>
            
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {registros.slice(0, 10).map((registro) => (
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
              
              {registros.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay registros disponibles
                </div>
              )}
              
              {registros.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push('/facturas/todos')}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Ver todos los registros →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}