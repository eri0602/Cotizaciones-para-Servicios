import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { fetchNotifications, addNotification } from '../../store/slices/notificationSlice';
import { socketService } from '../../services/socket';
import {
  Home,
  FileText,
  Users,
  MessageSquare,
  CreditCard,
  User,
  LogOut,
  Bell,
  Plus,
  X
} from 'lucide-react';

export default function Layout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    socketService.connect();
    if (user?.id) {
      socketService.join(user.id);
      dispatch(fetchNotifications());
    }

    socketService.on('notification', (notification: any) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socketService.off('notification');
      socketService.disconnect();
    };
  }, [user?.id, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const clientNavigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Mis Solicitudes', href: '/app/requests', icon: FileText },
    { name: 'Proveedores', href: '/app/providers', icon: Users },
    { name: 'Mensajes', href: '/app/chat', icon: MessageSquare },
    { name: 'Transacciones', href: '/app/transactions', icon: CreditCard },
  ];

  const providerNavigation = [
    { name: 'Dashboard', href: '/app', icon: Home },
    { name: 'Solicitudes', href: '/app/requests', icon: FileText },
    { name: 'Mis Propuestas', href: '/app/my-proposals', icon: FileText },
    { name: 'Mensajes', href: '/app/chat', icon: MessageSquare },
    { name: 'Transacciones', href: '/app/transactions', icon: CreditCard },
  ];

  const navigation = user?.role === 'CLIENT' ? clientNavigation : providerNavigation;

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">Cotizaciones</h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/app' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {user?.role === 'CLIENT' && (
            <div className="p-4 border-t border-gray-200">
              <Link
                to="/app/requests/new"
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Solicitud
              </Link>
            </div>
          )}

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4 relative">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map((notification: any) => (
                      <Link
                        key={notification.id}
                        to={notification.link || '/app/chat'}
                        className={`block p-4 border-b border-gray-100 hover:bg-gray-50 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setShowNotifications(false)}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            <Link to="/app/profile" className="p-2 text-gray-400 hover:text-gray-600">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
