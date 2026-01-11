import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { DollarSign, CheckCircle, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/payments/transactions', {
          params: { role: filter || undefined },
        });
        setTransactions(response.data.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filter]);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Transacciones
      </h1>

      <div className="flex space-x-2 mb-6">
        {['', 'client', 'provider'].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setFilter(status)}
          >
            {status === '' ? 'Todas' : status === 'client' ? 'Como Cliente' : 'Como Proveedor'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tienes transacciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {transaction.request?.title || 'Trabajo'}
                    </h3>
                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColors[transaction.paymentStatus]}`}>
                      {transaction.paymentStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    S/. {transaction.amount}
                  </p>
                  {transaction.completedAt && (
                    <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completado
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Comisión (10%)</p>
                  <p className="font-medium">S/. {transaction.platformFee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tu pago</p>
                  <p className="font-medium">S/. {transaction.providerEarnings}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className="font-medium capitalize">{transaction.paymentStatus.toLowerCase()}</p>
                </div>
              </div>

              {!transaction.review && transaction.paymentStatus === 'COMPLETED' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button size="sm">
                    <Star className="w-4 h-4 mr-1" />
                    Dejar Reseña
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
