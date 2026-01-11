import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ArrowRight, Shield, Users, CreditCard, MessageSquare } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Cotizaciones</h1>
          <nav className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Encuentra los mejores profesionales para tus servicios
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Publica tu solicitud y recibe propuestas de profesionales verificados.
              Compara precios, reseñas y elige la mejor opción.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 flex items-center"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ¿Por qué elegirnos?
            </h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Profesionales Verificados
                </h4>
                <p className="text-gray-600">
                  Todos nuestros proveedores pasan por un proceso de verificación.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Comparar Propuestas
                </h4>
                <p className="text-gray-600">
                  Recibe múltiples propuestas y elige la mejor para ti.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Pagos Seguros
                </h4>
                <p className="text-gray-600">
                  Tus pagos están protegidos hasta que el trabajo esté completado.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Chat en Tiempo Real
                </h4>
                <p className="text-gray-600">
                  Comunícate directamente con los proveedores.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                ¿Listo para encontrar tu profesional ideal?
              </h3>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Únete a miles de usuarios que ya encuentran los mejores servicios en nuestra plataforma.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50"
              >
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Cotizaciones. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
