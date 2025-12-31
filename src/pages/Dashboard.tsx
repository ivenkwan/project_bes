import { MainLayout } from '../components/layout/MainLayout';
import { FileText, Workflow, AlertTriangle, CheckSquare, TrendingUp, Shield } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: '28 Requirements', value: '28', icon: FileText, color: 'bg-blue-500' },
    { name: 'Active Workflows', value: '12', icon: Workflow, color: 'bg-green-500' },
    { name: 'Open Risks', value: '45', icon: AlertTriangle, color: 'bg-yellow-500' },
    { name: 'Pending Actions', value: '23', icon: CheckSquare, color: 'bg-red-500' },
    { name: 'Compliance Score', value: '87%', icon: TrendingUp, color: 'bg-primary-500' },
    { name: 'Audit Readiness', value: '92%', icon: Shield, color: 'bg-purple-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Critical Infrastructure Cybersecurity Compliance Overview
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className={`absolute ${item.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-secondary-500 truncate">{item.name}</p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-secondary-900">{item.value}</p>
                </dd>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-secondary-900">New requirement added: SIEM Implementation</p>
                  <p className="text-xs text-secondary-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-secondary-900">Action completed: Patch Management Review</p>
                  <p className="text-xs text-secondary-500">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-secondary-900">New risk identified: Critical vulnerability in web server</p>
                  <p className="text-xs text-secondary-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Compliance Status by Category</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Security Monitoring</span>
                  <span className="font-medium text-secondary-900">95%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Risk Management</span>
                  <span className="font-medium text-secondary-900">82%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Incident Response</span>
                  <span className="font-medium text-secondary-900">78%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Documentation</span>
                  <span className="font-medium text-secondary-900">88%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
