import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MapPin, Star, Briefcase, Award } from 'lucide-react';

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await api.get(`/providers/${id}`);
        setProvider(response.data.data);
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Proveedor no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="flex items-start">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {provider.avatarUrl ? (
              <img
                src={provider.avatarUrl}
                alt={provider.businessName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-blue-600">
                {provider.businessName.charAt(0)}
              </span>
            )}
          </div>
          <div className="ml-6 flex-1">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {provider.businessName}
              </h1>
              {provider.isPremium && (
                <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">{provider.description}</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{provider.city}, {provider.state}</span>
              <span className="mx-2">•</span>
              <span>{provider.yearsExperience} años de experiencia</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="text-center">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{provider.ratingAverage}</p>
          <p className="text-sm text-gray-500">{provider.totalReviews} reseñas</p>
        </Card>
        <Card className="text-center">
          <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{provider.totalJobsCompleted}</p>
          <p className="text-sm text-gray-500">Trabajos completados</p>
        </Card>
        <Card className="text-center">
          <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{provider.responseRate}%</p>
          <p className="text-sm text-gray-500">Tasa de respuesta</p>
        </Card>
      </div>

      {provider.servicesOffered && provider.servicesOffered.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Servicios Ofrecidos
          </h2>
          <div className="flex flex-wrap gap-2">
            {provider.servicesOffered.map((s: any) => (
              <span
                key={s.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {s.category.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      {provider.portfolioItems && provider.portfolioItems.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Portafolio
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {provider.portfolioItems.map((item: any) => (
              <div key={item.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {provider.certifications && provider.certifications.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Certificaciones
          </h2>
          <div className="space-y-3">
            {provider.certifications.map((cert: any) => (
              <div key={cert.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{cert.name}</p>
                  <p className="text-sm text-gray-500">{cert.issuer}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
