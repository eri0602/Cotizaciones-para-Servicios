import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { register } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      toast.success('¡Cuenta creada!');
      navigate('/app');
    } else {
      toast.error(error || 'Error al crear cuenta');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Cotizaciones</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Crea tu Cuenta
          </h2>
          <p className="mt-2 text-gray-600">
            O{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              inicia sesión
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    formData.role === 'CLIENT'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                >
                  <span className="block font-semibold">Cliente</span>
                  <span className="text-sm text-gray-500">Busco servicios</span>
                </button>
                <button
                  type="button"
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    formData.role === 'PROVIDER'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
                >
                  <span className="block font-semibold">Proveedor</span>
                  <span className="text-sm text-gray-500">Ofrezco servicios</span>
                </button>
              </div>
            </div>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              required
            />

            <Input
              label="Teléfono (opcional)"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+51 999 999 999"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirmar Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
            >
              Crear Cuenta
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
