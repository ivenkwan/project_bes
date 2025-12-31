import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import {
  Workflow,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Eye,
  Edit
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  bpmn_definition: any;
  version: number;
  is_active: boolean;
  trigger_type: string;
  trigger_config: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowInstance {
  id: string;
  workflow_id: string;
  status: string;
  started_by: string;
  started_at: string;
  completed_at: string | null;
  context_data: any;
  error_message: string | null;
  workflow_name?: string;
}

const categoryColors = {
  'Requirements Implementation': 'bg-blue-500',
  'Risk Management': 'bg-red-500',
  'Compliance Assessment': 'bg-green-500',
  'Incident Response': 'bg-orange-500',
  'Approval Process': 'bg-purple-500',
  'Documentation': 'bg-yellow-500',
};

const statusConfig = {
  running: { label: 'Running', color: 'bg-blue-100 text-blue-800', icon: Play },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
};

export default function WorkflowModule() {
  const [activeTab, setActiveTab] = useState<'definitions' | 'instances'>('definitions');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'definitions') {
      fetchWorkflows();
    } else {
      fetchInstances();
    }
  }, [activeTab]);

  const fetchWorkflows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflows:', error);
    } else {
      setWorkflows(data || []);
    }
    setLoading(false);
  };

  const fetchInstances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        workflows(name)
      `)
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching instances:', error);
    } else {
      const instancesWithNames = (data || []).map((inst: any) => ({
        ...inst,
        workflow_name: inst.workflows?.name
      }));
      setInstances(instancesWithNames);
    }
    setLoading(false);
  };

  const getWorkflowStats = () => {
    const total = workflows.length;
    const active = workflows.filter(w => w.is_active).length;
    const categories = new Set(workflows.map(w => w.category)).size;

    return { total, active, categories };
  };

  const getInstanceStats = () => {
    const total = instances.length;
    const running = instances.filter(i => i.status === 'running').length;
    const completed = instances.filter(i => i.status === 'completed').length;
    const failed = instances.filter(i => i.status === 'failed').length;

    return { total, running, completed, failed };
  };

  const workflowStats = getWorkflowStats();
  const instanceStats = getInstanceStats();
  const categories = ['all', ...Array.from(new Set(workflows.map(w => w.category)))];

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = !searchTerm ||
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInstances = instances.filter(i => {
    const matchesSearch = !searchTerm ||
      i.workflow_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || i.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Workflow Orchestration</h1>
            <p className="mt-2 text-sm text-secondary-600">
              BPMN 2.0 workflow modeling and execution engine for compliance automation
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Create Workflow
          </button>
        </div>

        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('definitions')}
              className={clsx(
                'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'definitions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              )}
            >
              Workflow Definitions
            </button>
            <button
              onClick={() => setActiveTab('instances')}
              className={clsx(
                'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'instances'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              )}
            >
              Workflow Instances
            </button>
          </nav>
        </div>

        {activeTab === 'definitions' ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Workflow className="h-6 w-6 text-secondary-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Total Workflows</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{workflowStats.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Active Workflows</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{workflowStats.active}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Categories</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{workflowStats.categories}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search workflows..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 border border-secondary-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <Workflow className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No workflows found</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Get started by creating a new workflow
                  </p>
                  <div className="mt-6">
                    <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Workflow
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className={clsx(
                            'p-2 rounded-lg',
                            categoryColors[workflow.category as keyof typeof categoryColors] || 'bg-gray-500'
                          )}>
                            <Workflow className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-medium text-secondary-900">{workflow.name}</h3>
                            <p className="text-sm text-secondary-500">v{workflow.version}</p>
                          </div>
                        </div>
                        {workflow.is_active && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm text-secondary-600 line-clamp-2">
                        {workflow.description}
                      </p>

                      <div className="mt-4 flex items-center text-sm text-secondary-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(workflow.created_at), 'MMM d, yyyy')}
                      </div>

                      <div className="mt-4 flex justify-between items-center pt-4 border-t border-secondary-100">
                        <span className="text-xs text-secondary-500">{workflow.trigger_type}</span>
                        <div className="flex space-x-2">
                          <button className="p-1 text-secondary-400 hover:text-primary-600">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-1 text-secondary-400 hover:text-primary-600">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button className="p-1 text-secondary-400 hover:text-green-600">
                            <Play className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-6 w-6 text-secondary-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Total Executions</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{instanceStats.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Play className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Running</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{instanceStats.running}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Completed</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{instanceStats.completed}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">Failed</dt>
                        <dd className="text-2xl font-semibold text-secondary-900">{instanceStats.failed}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search instances..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="pl-4 pr-8 border border-secondary-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Workflow
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Started
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {filteredInstances.map((instance) => {
                        const statusInfo = statusConfig[instance.status as keyof typeof statusConfig];
                        const StatusIcon = statusInfo?.icon || Clock;
                        const duration = instance.completed_at
                          ? Math.round((new Date(instance.completed_at).getTime() - new Date(instance.started_at).getTime()) / 1000)
                          : Math.round((Date.now() - new Date(instance.started_at).getTime()) / 1000);

                        return (
                          <tr key={instance.id} className="hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-secondary-900">{instance.workflow_name}</div>
                              <div className="text-sm text-secondary-500">{instance.id.substring(0, 8)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={clsx(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                statusInfo?.color || 'bg-gray-100 text-gray-800'
                              )}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo?.label || instance.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                              {format(new Date(instance.started_at), 'MMM d, yyyy HH:mm')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                              {duration < 60 ? `${duration}s` : `${Math.round(duration / 60)}m`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900 flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredInstances.length === 0 && (
                    <div className="text-center py-12">
                      <Activity className="mx-auto h-12 w-12 text-secondary-400" />
                      <h3 className="mt-2 text-sm font-medium text-secondary-900">No workflow instances found</h3>
                      <p className="mt-1 text-sm text-secondary-500">
                        Workflow instances will appear here once workflows are executed
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
