import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { MapPin, Star, Briefcase } from 'lucide-react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', category: '' });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await api.get('/providers/search', { params: filters });
        setProviders(response.data.data.providers);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [filters]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Explorar Proveedores
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar por ciudad..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">Todas las categorías</option>
            <option value="plomeria">Plomería</option>
            <option value="electricidad">Electricidad</option>
            <option value="carpinteria">Carpintería</option>
            <option value="pintura">Pintura</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando proveedores...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron proveedores</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Link key={provider.id} to={`/app/providers/${provider.id}`}>
              <Card>
                <div className="flex items-start">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {provider.avatarUrl ? (
                      <img
                        src={provider.avatarUrl}
                        alt={provider.businessName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-blue-600">
                        {provider.businessName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {provider.businessName}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{provider.city}, {provider.state}</span>
                    </div>
                  </div>
                </div>

                {provider.description && (
                  <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                    {provider.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{provider.ratingAverage}</span>
                    <span className="text-gray-500 ml-1">
                      ({provider.totalReviews} reseñas)
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{provider.totalJobsCompleted} trabajos</span>
                  </div>
                </div>

                {provider.isPremium && (
                  <span className="mt-3 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Premium
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
