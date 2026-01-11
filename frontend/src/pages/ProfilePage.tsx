import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    phone: user?.phone || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    address: user?.profile?.address || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/me', formData);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Mi Perfil
      </h1>

      <Card className="mb-6">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.profile?.firstName} {user?.profile?.lastName}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
              {user?.role?.toLowerCase()}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información Personal
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            <Input
              label="Apellido"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>

          <Input
            label="Teléfono"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ciudad"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Distrito/Provincia"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>

          <Input
            label="Dirección"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Button type="submit" isLoading={loading} className="w-full">
            Guardar Cambios
          </Button>
        </form>
      </Card>

      {user?.role === 'PROVIDER' && user?.providerProfile && (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Perfil de Proveedor
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Negocio
              </label>
              <p className="text-gray-900">{user.providerProfile.businessName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Años de Experiencia
              </label>
              <p className="text-gray-900">{user.providerProfile.yearsExperience} años</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <p className="text-gray-900">{user.providerProfile.description || 'Sin descripción'}</p>
            </div>
            <Button variant="secondary" className="w-full">
              Editar Perfil de Proveedor
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
