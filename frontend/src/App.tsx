import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { checkAuth } from './store/slices/authSlice';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RequestsPage from './pages/RequestsPage';
import RequestDetailPage from './pages/RequestDetailPage';
import CreateRequestPage from './pages/CreateRequestPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import MyProposalsPage from './pages/MyProposalsPage';
import ChatPage from './pages/ChatPage';
import TransactionsPage from './pages/TransactionsPage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function ClientRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return user?.role === 'CLIENT' ? <>{children}</> : <Navigate to="/app" />;
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="requests/new" element={<ClientRoute><CreateRequestPage /></ClientRoute>} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="providers/:id" element={<ProviderProfilePage />} />
        <Route path="my-proposals" element={<MyProposalsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
