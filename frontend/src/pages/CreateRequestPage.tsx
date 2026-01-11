import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { createRequest } from '../store/slices/requestSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';

export default function CreateRequestPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirigir si no es cliente
    if (user && user.role !== 'CLIENT') {
      toast.error('Solo los clientes pueden crear solicitudes');
      navigate('/app');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    city: '',
    state: '',
    address: '',
    budgetMin: '',
    budgetMax: '',
    urgency: 'MEDIUM',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await dispatch(createRequest(data)).unwrap();
      toast.success('Solicitud creada exitosamente');
      navigate('/app/requests');
    } catch (error) {
      toast.error('Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'plomeria', name: 'Plomería' },
    { id: 'electricidad', name: 'Electricidad' },
    { id: 'carpinteria', name: 'Carpintería' },
    { id: 'pintura', name: 'Pintura' },
    { id: 'limpieza', name: 'Limpieza' },
    { id: 'gasfiteria', name: 'Gasfitería' },
    { id: 'albañileria', name: 'Albañilería' },
    { id: 'jardineria', name: 'Jardinería' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Crear Nueva Solicitud
      </h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Servicio
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Instalación de grifería en baño"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción detallada *
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Describe detalladamente el trabajo que necesitas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Presupuesto y Tiempo
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto Mínimo (S/.)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto Máximo (S/.)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgencia
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            >
              <option value="LOW">Baja - Sin prisa</option>
              <option value="MEDIUM">Media - En una semana</option>
              <option value="HIGH">Alta - En pocos días</option>
              <option value="URGENT">Urgente - Lo antes posible</option>
            </select>
          </div>
        </Card>

        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ubicación
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Lima"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distrito/Provincia *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Miraflores"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección exacta
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Av. Larco 123, Oficina 5"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading}>
            Publicar Solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}
