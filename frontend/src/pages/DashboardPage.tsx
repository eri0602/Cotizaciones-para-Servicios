import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { Card } from '../components/common/Card';
import { FileText, Users, MessageSquare, CreditCard, Plus } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, loading } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const clientStats = [
    { name: 'Mis Solicitudes', value: stats.clientRequests, icon: FileText, href: '/app/requests', color: 'bg-blue-500' },
    { name: 'Propuestas Recibidas', value: stats.receivedProposals, icon: Users, href: '/app/requests', color: 'bg-green-500' },
    { name: 'Transacciones', value: stats.transactions, icon: CreditCard, href: '/app/transactions', color: 'bg-purple-500' },
    { name: 'Mensajes', value: stats.messages, icon: MessageSquare, href: '/app/chat', color: 'bg-orange-500' },
  ];

  const providerStats = [
    { name: 'Propuestas Enviadas', value: stats.providerProposals, icon: FileText, href: '/app/my-proposals', color: 'bg-blue-500' },
    { name: 'Trabajos Activos', value: stats.activeJobs, icon: CreditCard, href: '/app/transactions', color: 'bg-green-500' },
    { name: 'Mensajes', value: stats.messages, icon: MessageSquare, href: '/app/chat', color: 'bg-orange-500' },
    { name: 'Solicitudes Disponibles', value: stats.availableRequests, icon: Users, href: '/app/requests', color: 'bg-purple-500' },
  ];

  const statsToShow = user?.role === 'CLIENT' ? clientStats : providerStats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ¡Bienvenido, {user?.email}!
        </h1>
        <p className="text-gray-600 mt-1">
          Aquí está el resumen de tu actividad
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsToShow.map((stat) => (
            <Link key={stat.name} to={stat.href}>
              <Card className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <Link
              to="/app/requests/new"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-700">Crear nueva solicitud</span>
            </Link>
            <Link
              to="/app/requests"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-gray-700">Ver todas las solicitudes</span>
            </Link>
            <Link
              to="/app/providers"
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-gray-700">Explorar proveedores</span>
            </Link>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
              <div>
                <p className="text-sm text-gray-900">Nueva propuesta recibida</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3" />
              <div>
                <p className="text-sm text-gray-900">Trabajo completado</p>
                <p className="text-xs text-gray-500">Hace 5 horas</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3" />
              <div>
                <p className="text-sm text-gray-900">Nuevo mensaje</p>
                <p className="text-xs text-gray-500">Hace 1 día</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
