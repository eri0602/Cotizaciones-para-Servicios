import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchRequests } from '../store/slices/requestSlice';
import { Card } from '../components/common/Card';
import { MapPin, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function RequestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading, total } = useSelector((state: RootState) => state.requests);
  const { user } = useSelector((state: RootState) => state.auth);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    urgency: '',
  });

  useEffect(() => {
    dispatch(fetchRequests({ ...filters, status: 'OPEN' }));
  }, [dispatch, filters]);

  const urgencyColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'CLIENT' ? 'Mis Solicitudes' : 'Solicitudes Disponibles'}
        </h1>
        {user?.role === 'CLIENT' && (
          <Link
            to="/app/requests/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nueva Solicitud
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
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
            <option value="limpieza">Limpieza</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.urgency}
            onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
          >
            <option value="">Cualquier urgencia</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando solicitudes...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron solicitudes</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Link key={request.id} to={`/app/requests/${request.id}`}>
              <Card>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.title}
                  </h3>
                  {request.urgency && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[request.urgency]}`}>
                      {request.urgency}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{request.city}, {request.state}</span>
                  </div>

                  {request.budgetMin && request.budgetMax && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>S/. {request.budgetMin} - S/. {request.budgetMax}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {request.proposalsCount} propuesta{request.proposalsCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    {request.category.name}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
