// app/registros/edit/[id]/RegistroEditClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegistroPresupuesto } from '@/app/lib/definitions';
import { Alumno } from '@/app/lib/definitions';

interface RegistroEditClientProps {
  registroId: string;
  initialRegistro?: RegistroPresupuesto & { alumno_nombre: string };
  alumnos: Alumno[];
  currentUserId: number; // ID del usuario actual
}

export default function RegistroEditClient({
  registroId,
  initialRegistro,
  alumnos,
  currentUserId
}: RegistroEditClientProps) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    descripcion: '',
    valor: '',
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    alumno_id: '',
    usuario_id: currentUserId.toString(),
    docname: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Cargar datos del registro
  useEffect(() => {
    if (initialRegistro) {
      setFormData({
        descripcion: initialRegistro.descripcion,
        valor: initialRegistro.valor.toString(),
        tipo: initialRegistro.tipo,
        alumno_id: initialRegistro.alumno_id.toString(),
        usuario_id: currentUserId.toString(),
        docname: initialRegistro.docname || ''
      });
    } else {
      // Si no viene del servidor, cargar desde la API
      loadRegistro();
    }
  }, [registroId, initialRegistro]);
  
  const loadRegistro = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/registros/${registroId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Registro no encontrado');
        }
        throw new Error('Error al cargar el registro');
      }
      
      const registro = await response.json();
      setFormData({
        descripcion: registro.descripcion,
        valor: registro.valor.toString(),
        tipo: registro.tipo,
        alumno_id: registro.alumno_id.toString(),
        usuario_id: currentUserId.toString(),
        docname: registro.docname || ''
      });
      
    } catch (error) {
      console.error('Error cargando registro:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el registro');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (error) setError(null);
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.valor || isNaN(Number(formData.valor)) || Number(formData.valor) <= 0) {
      newErrors.valor = 'El valor debe ser un número positivo';
    }
    
    if (!formData.tipo || !['ingreso', 'egreso'].includes(formData.tipo)) {
      newErrors.tipo = 'El tipo debe ser "ingreso" o "egreso"';
    }
    
    if (!formData.alumno_id) {
      newErrors.alumno_id = 'Debe seleccionar un alumno';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Enviar formulario (actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/registros/${registroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: formData.descripcion.trim(),
          valor: Number(formData.valor),
          tipo: formData.tipo,
          alumno_id: Number(formData.alumno_id),
          usuario_id: Number(formData.usuario_id),
          docname: formData.docname?.trim() || null
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el registro');
      }
      
      // Redirigir al listado o mostrar mensaje de éxito
      alert('Registro actualizado exitosamente');
      router.push('/'); // Ajusta esta ruta según tu estructura
      router.refresh();
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el registro');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Eliminar registro
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/registros/${registroId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el registro');
      }
      
      alert('Registro eliminado exitosamente');
      router.push('/facturas/todos'); // Ajusta esta ruta según tu estructura
      router.refresh();
      
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar el registro');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Calcular totales
  const calcularTotales = () => {
    const valor = Number(formData.valor) || 0;
    const esIngreso = formData.tipo === 'ingreso';
    
    return {
      ingreso: esIngreso ? valor : 0,
      egreso: !esIngreso ? valor : 0,
      neto: esIngreso ? valor : -valor
    };
  };
  
  const totales = calcularTotales();
  
  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  if (isLoading && !formData.descripcion) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error && !formData.descripcion) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
        >
          ← Volver
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📝 Editar Registro</h1>
          <p className="text-gray-600 mt-2">Modifica los detalles del registro de presupuesto</p>
          <p className="text-sm text-gray-500 mt-1">ID: {registroId}</p>
        </div>
        
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
        >
          ← Volver
        </button>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow-md ${
          formData.tipo === 'ingreso' 
            ? 'bg-green-50 border-l-4 border-green-500' 
            : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {formData.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
          </h3>
          <p className={`text-3xl font-bold ${
            formData.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(Number(formData.valor) || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {formData.tipo === 'ingreso' ? 'Entrada de fondos' : 'Salida de fondos'}
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Alumno</h3>
          <p className="text-xl font-bold text-blue-600">
            {alumnos.find(a => a.id.toString() === formData.alumno_id)?.nombre || 'No seleccionado'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {formData.alumno_id ? `ID: ${formData.alumno_id}` : 'Selecciona un alumno'}
          </p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Balance Neto</h3>
          <p className={`text-3xl font-bold ${
            totales.neto >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(totales.neto)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Impacto en el presupuesto
          </p>
        </div>
      </div>
      
      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Descripción detallada del registro..."
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (ARS) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.valor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.valor && (
                <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
              )}
            </div>
            
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <div className="flex space-x-4">
                <label className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition duration-200 ${
                  formData.tipo === 'ingreso' 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="ingreso"
                    checked={formData.tipo === 'ingreso'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium">Ingreso</span>
                  <span className="ml-2">💰</span>
                </label>
                
                <label className={`flex items-center px-4 py-3 rounded-lg border cursor-pointer transition duration-200 ${
                  formData.tipo === 'egreso' 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                  <input
                    type="radio"
                    name="tipo"
                    value="egreso"
                    checked={formData.tipo === 'egreso'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium">Egreso</span>
                  <span className="ml-2">💸</span>
                </label>
              </div>
              {errors.tipo && (
                <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
              )}
            </div>
            
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
                {alumnos
                  .filter(alumno => alumno.activo)
                  .map(alumno => (
                    <option key={alumno.id} value={alumno.id}>
                      {alumno.nombre} {alumno.email ? `(${alumno.email})` : ''}
                    </option>
                  ))
                }
              </select>
              {errors.alumno_id && (
                <p className="mt-1 text-sm text-red-600">{errors.alumno_id}</p>
              )}
            </div>
            
            {/* Documento asociado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documento asociado (opcional)
              </label>
              <input
                type="text"
                name="docname"
                value={formData.docname}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: factura-001.pdf"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nombre del archivo o referencia del documento
              </p>
            </div>
          </div>
          
          {/* Usuario ID (oculto) */}
          <input type="hidden" name="usuario_id" value={formData.usuario_id} />
          
          {/* Botones */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Eliminando...' : '🗑️ Eliminar Registro'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
            >
              Cancelar
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </form>
      </div>
      
      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Información del registro</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">ID del registro:</p>
            <p className="font-medium">{registroId}</p>
          </div>
          <div>
            <p className="text-gray-500">Usuario responsable:</p>
            <p className="font-medium">ID: {currentUserId}</p>
          </div>
          <div>
            <p className="text-gray-500">Última actualización:</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Estado:</p>
            <p className="font-medium text-green-600">Activo</p>
          </div>
        </div>
      </div>
    </div>
  );
}