import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchMyProposals, withdrawProposal } from '../store/slices/proposalSlice';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DollarSign, Clock, FileText, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function MyProposalsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { proposals, loading } = useSelector((state: RootState) => state.proposals);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    dispatch(fetchMyProposals(filter || undefined));
  }, [dispatch, filter]);

  const handleWithdraw = async (id: string) => {
    if (window.confirm('¿Estás seguro de retirar esta propuesta?')) {
      try {
        await dispatch(withdrawProposal(id)).unwrap();
        toast.success('Propuesta retirada');
      } catch (error) {
        toast.error('Error al retirar propuesta');
      }
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Mis Propuestas
      </h1>

      <div className="flex space-x-2 mb-6">
        {['', 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setFilter(status)}
          >
            {status || 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tienes propuestas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {proposal.request.title}
                    </h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[proposal.status]}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {proposal.request.category.name} • Enviado {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true, locale: es })}
                  </p>
                  <p className="text-gray-700 line-clamp-2">{proposal.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    S/. {proposal.price}
                  </p>
                  {proposal.estimatedDays && (
                    <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {proposal.estimatedDays} días
                    </p>
                  )}
                </div>
              </div>

              {proposal.status === 'PENDING' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleWithdraw(proposal.id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Retirar Propuesta
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
