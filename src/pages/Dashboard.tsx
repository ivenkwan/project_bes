import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { supabase } from '../lib/supabase';
import { FileText, Workflow, AlertTriangle, TrendingUp, Shield, Activity, Clock } from 'lucide-react';

interface DashboardStats {
  requirements: { total: number; inProgress: number; completed: number };
  risks: { total: number; critical: number; high: number };
  actions: { total: number; overdue: number; completed: number };
  incidents: { total: number; active: number; critical: number };
  workflows: { total: number; active: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);

    const [requirementsData, risksData, actionsData, incidentsData, workflowsData] = await Promise.all([
      supabase.from('requirements').select('status, completion_percentage'),
      supabase.from('risks').select('risk_score'),
      supabase.from('actions').select('status'),
      supabase.from('incidents').select('status, severity'),
      supabase.from('workflows').select('is_active')
    ]);

    const requirements = {
      total: requirementsData.data?.length || 0,
      inProgress: requirementsData.data?.filter((r: any) => r.status === 'in_progress').length || 0,
      completed: requirementsData.data?.filter((r: any) => r.status === 'implemented' || r.status === 'validated').length || 0
    };

    const risks = {
      total: risksData.data?.length || 0,
      critical: risksData.data?.filter((r: any) => r.risk_score >= 15).length || 0,
      high: risksData.data?.filter((r: any) => r.risk_score >= 10 && r.risk_score < 15).length || 0
    };

    const actions = {
      total: actionsData.data?.length || 0,
      overdue: actionsData.data?.filter((a: any) => a.status === 'overdue').length || 0,
      completed: actionsData.data?.filter((a: any) => a.status === 'completed').length || 0
    };

    const incidents = {
      total: incidentsData.data?.length || 0,
      active: incidentsData.data?.filter((i: any) => ['new', 'investigating', 'contained'].includes(i.status)).length || 0,
      critical: incidentsData.data?.filter((i: any) => i.severity === 'critical').length || 0
    };

    const workflows = {
      total: workflowsData.data?.length || 0,
      active: workflowsData.data?.filter((w: any) => w.is_active).length || 0
    };

    setStats({ requirements, risks, actions, incidents, workflows });
    setLoading(false);
  };

  const getComplianceScore = () => {
    if (!stats) return 0;
    const reqCompletion = stats.requirements.total > 0
      ? (stats.requirements.completed / stats.requirements.total) * 100
      : 0;
    return Math.round(reqCompletion);
  };

  const dashboardCards = [
    {
      name: 'Requirements',
      value: stats?.requirements.total || 0,
      subtitle: `${stats?.requirements.inProgress || 0} in progress`,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/requirements'
    },
    {
      name: 'Active Workflows',
      value: stats?.workflows.active || 0,
      subtitle: `${stats?.workflows.total || 0} total`,
      icon: Workflow,
      color: 'bg-green-500',
      link: '/workflows'
    },
    {
      name: 'High Priority Risks',
      value: (stats?.risks.critical || 0) + (stats?.risks.high || 0),
      subtitle: `${stats?.risks.total || 0} total risks`,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      link: '/risks'
    },
    {
      name: 'Overdue Actions',
      value: stats?.actions.overdue || 0,
      subtitle: `${stats?.actions.total || 0} total actions`,
      icon: Clock,
      color: 'bg-red-500',
      link: '/actions'
    },
    {
      name: 'Active Incidents',
      value: stats?.incidents.active || 0,
      subtitle: `${stats?.incidents.critical || 0} critical`,
      icon: Shield,
      color: 'bg-purple-500',
      link: '/incidents'
    },
    {
      name: 'Compliance Score',
      value: `${getComplianceScore()}%`,
      subtitle: 'Requirements completed',
      icon: TrendingUp,
      color: 'bg-primary-500',
      link: '/requirements'
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Compliance Dashboard</h1>
          <p className="mt-2 text-sm text-secondary-600">
            Hong Kong Critical Infrastructure Cybersecurity Compliance Overview
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <dt>
                  <div className={`absolute ${item.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-secondary-500 truncate">{item.name}</p>
                </dt>
                <dd className="ml-16 pb-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-secondary-900">{item.value}</p>
                </dd>
                <dd className="ml-16">
                  <p className="text-xs text-secondary-500">{item.subtitle}</p>
                </dd>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Compliance Progress by Category</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Organizational (4 requirements)</span>
                  <span className="font-medium text-secondary-900">75%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Technology (13 requirements)</span>
                  <span className="font-medium text-secondary-900">42%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full transition-all" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Process (9 requirements)</span>
                  <span className="font-medium text-secondary-900">48%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2.5">
                  <div className="bg-yellow-600 h-2.5 rounded-full transition-all" style={{ width: '48%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary-600">Documentation (2 requirements)</span>
                  <span className="font-medium text-secondary-900">75%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full transition-all" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Risk Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-secondary-900">Critical Risks</p>
                    <p className="text-xs text-secondary-500">Risk score ≥ 15</p>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-secondary-900">{stats?.risks.critical || 0}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-secondary-900">High Risks</p>
                    <p className="text-xs text-secondary-500">Risk score 10-14</p>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-secondary-900">{stats?.risks.high || 0}</p>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-900">
                    {stats?.risks.total || 0} total risks being actively managed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-600">Requirements Progress</span>
                <span className="text-lg font-bold text-secondary-900">
                  {stats?.requirements.inProgress || 0}/{stats?.requirements.total || 0}
                </span>
              </div>
              <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats?.requirements.total ? (stats.requirements.inProgress / stats.requirements.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-600">Actions Completion</span>
                <span className="text-lg font-bold text-secondary-900">
                  {stats?.actions.completed || 0}/{stats?.actions.total || 0}
                </span>
              </div>
              <div className="mt-2 w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats?.actions.total ? (stats.actions.completed / stats.actions.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-600">Incident Resolution</span>
                <span className="text-lg font-bold text-secondary-900">
                  {stats?.incidents.active || 0} active
                </span>
              </div>
              <div className="mt-2 flex items-center">
                {stats?.incidents.critical ? (
                  <span className="text-xs text-red-600 font-medium">
                    {stats.incidents.critical} critical incidents require attention
                  </span>
                ) : (
                  <span className="text-xs text-green-600 font-medium">
                    No critical incidents
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
