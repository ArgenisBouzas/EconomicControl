// app/alumnos/AlumnosClient.tsx - COMPONENTE CLIENTE
'use client';

import { useState, useEffect } from 'react';
import { Alumno } from '@/app/lib/definitions';

interface AlumnosClientProps {
  initialAlumnos: Alumno[];
}

export default function AlumnosClient({ initialAlumnos }: AlumnosClientProps) {
  const [alumnos, setAlumnos] = useState<Alumno[]>(initialAlumnos);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',

    activo: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Cargar alumnos al iniciar
  const fetchAlumnos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alumnos');
      if (response.ok) {
        const data = await response.json();
        setAlumnos(data);
      }
    } catch (error) {
      console.error('Error cargando alumnos:', error);
      alert('Error al cargar los alumnos');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    
    
   
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const url = editingId ? `/api/alumnos/${editingId}` : '/api/alumnos';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Limpiar campos vacíos
          
          telefono: formData.telefono || null,
          
          
          
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar alumno');
      }
      
      // Recargar lista
      await fetchAlumnos();
      
      // Limpiar formulario
      resetForm();
      
      alert(editingId ? 'Alumno actualizado exitosamente' : 'Alumno creado exitosamente');
      
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar alumno');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Editar alumno
  const handleEdit = (alumno: Alumno) => {
    setFormData({
      nombre: alumno.nombre,

      telefono: alumno.telefono || '',


      activo: alumno.activo,
    });
    setEditingId(alumno.id);
    setShowForm(true);
  };
  
  // Eliminar alumno
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/alumnos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar alumno');
      }
      
      // Recargar lista
      await fetchAlumnos();
      alert('Alumno eliminado exitosamente');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar alumno');
    }
  };
  
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      activo: true
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };
  
  // Estadísticas
  const stats = {
    total: alumnos.length,
    activos: alumnos.filter(a => a.activo).length,
    inactivos: alumnos.filter(a => !a.activo).length,
    recientes: alumnos.filter(a => {
      const fechaRegistro = new Date(a.fecha_registro);
      const sieteDiasAtras = new Date();
      sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
      return fechaRegistro > sieteDiasAtras;
    }).length
  };
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👥 Gestión de Alumnos</h1>
          <p className="text-gray-600 mt-2">Administra la información de tus alumnos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
        >
          {showForm ? '← Volver a la lista' : '➕ Nuevo Alumno'}
        </button>
      </div>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Alumnos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Alumnos Activos</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Alumnos Inactivos</h3>
          <p className="text-3xl font-bold text-red-600">{stats.inactivos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Registrados (7 días)</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.recientes}</p>
        </div>
      </div>
      
      {showForm ? (
        /* Formulario */
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? '✏️ Editar Alumno' : '➕ Nuevo Alumno'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Juan"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>
              
              {/* Apellido */}
             
              
              {/* Email */}
              
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              
              {/* Fecha de nacimiento */}
              
              
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="activo"
                  value={formData.activo ? 'true' : 'false'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
            
            {/* Dirección */}
           
            
            {/* Observaciones */}
           
            
            {/* Botones */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Guardando...' : (editingId ? 'Actualizar Alumno' : 'Crear Alumno')}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Listado de alumnos */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Lista de Alumnos</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} registrado{alumnos.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    // Puedes implementar búsqueda aquí
                    console.log('Buscar:', e.target.value);
                  }}
                />
                <button
                  onClick={fetchAlumnos}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                  title="Refrescar lista"
                >
                  🔄
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Contacto</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Registro</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : alumnos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No hay alumnos registrados
                    </td>
                  </tr>
                ) : (
                  alumnos.map((alumno) => (
                    <tr key={alumno.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {alumno.nombre.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {alumno.nombre} 
                            </p>
                            
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {alumno.email && (
                            <p className="text-sm">
                              📧 {alumno.email}
                            </p>
                          )}
                          {alumno.telefono && (
                            <p className="text-sm">
                              📱 {alumno.telefono}
                            </p>
                          )}
                          
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alumno.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {alumno.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {new Date(alumno.fecha_registro).toLocaleDateString()}
                        <p className="text-xs mt-1">
                          {new Date(alumno.fecha_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(alumno)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition duration-200"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(alumno.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition duration-200"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() => alert(`Ver detalles de ${alumno.nombre}`)}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition duration-200"
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación simple */}
          {alumnos.length > 0 && (
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Mostrando {alumnos.length} de {alumnos.length} alumnos
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                  Anterior
                </button>
                <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}