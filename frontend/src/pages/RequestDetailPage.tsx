import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchRequestById } from '../store/slices/requestSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MapPin, Calendar, DollarSign, MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentRequest: request, loading } = useSelector((state: RootState) => state.requests);
  const { user } = useSelector((state: RootState) => state.auth);
  const [showProposalForm, setShowProposalForm] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchRequestById(id));
    }
  }, [dispatch, id]);

  if (loading || !request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const urgencyColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  const canPropose = user?.role === 'PROVIDER' && request.status === 'OPEN';

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/app/requests" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Volver a solicitudes
      </Link>

      <div className="grid gap-6">
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
            {request.urgency && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgencyColors[request.urgency]}`}>
                {request.urgency}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{request.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{request.address}, {request.city}, {request.state}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>
               Publicado {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: es })}
              </span>
            </div>
            {request.budgetMin && request.budgetMax && (
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-5 h-5 mr-2" />
                <span>S/. {request.budgetMin} - S/. {request.budgetMax}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <User className="w-5 h-5 mr-2" />
              <span>{request.client?.profile?.firstName || 'Cliente'}</span>
            </div>
          </div>
        </Card>

        {canPropose && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Enviar Propuesta
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (S/.)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Días estimados
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe tu propuesta..."
                />
              </div>
              <Button type="submit" className="w-full">
                Enviar Propuesta
              </Button>
            </form>
          </Card>
        )}

        {request.proposals && request.proposals.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Propuestas ({request.proposals.length})
            </h2>
            <div className="space-y-4">
              {request.proposals.map((proposal: any) => (
                <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {proposal.provider.businessName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{proposal.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        S/. {proposal.price}
                      </p>
                      <p className="text-sm text-gray-500">
                        {proposal.estimatedDays} días
                      </p>
                    </div>
                  </div>
                  {user?.role === 'CLIENT' && (
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" variant="primary">
                        Aceptar
                      </Button>
                      <Button size="sm" variant="secondary">
                        Rechazar
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chatear
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
