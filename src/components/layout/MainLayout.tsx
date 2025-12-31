import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  LayoutDashboard,
  FileText,
  Workflow,
  AlertTriangle,
  CheckSquare,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';

interface MainLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Requirements', href: '/requirements', icon: FileText },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Risk Management', href: '/risk', icon: AlertTriangle },
  { name: 'Actions', href: '/actions', icon: CheckSquare },
  { name: 'Incidents', href: '/incidents', icon: AlertCircle },
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-primary-800 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Shield className="h-8 w-8 text-white" />
                <span className="ml-2 text-white text-lg font-semibold">CISCE</span>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        isActive
                          ? 'bg-primary-900 text-white'
                          : 'text-primary-100 hover:bg-primary-700',
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                      )}
                    >
                      <Icon
                        className={clsx(
                          isActive ? 'text-white' : 'text-primary-200',
                          'mr-3 flex-shrink-0 h-5 w-5'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-primary-200">Administrator</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="ml-3 p-2 text-primary-200 hover:text-white hover:bg-primary-700 rounded-md transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
