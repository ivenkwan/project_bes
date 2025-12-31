import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Clock, AlertCircle, Search, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface Action {
  id: string;
  action_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string;
  due_date: string;
  completion_date: string | null;
  requirement_id: string | null;
  risk_id: string | null;
  control_id: string | null;
  created_at: string;
  updated_at: string;
}

const priorityConfig = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low', color: 'bg-green-100 text-green-800' }
};

const statusConfig = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-800', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

export default function ActionsModule() {
  const [actions, setActions] = useState<Action[]>([]);
  const [filteredActions, setFilteredActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  useEffect(() => {
    fetchActions();
  }, []);

  useEffect(() => {
    filterActions();
  }, [actions, searchTerm, selectedStatus, selectedPriority]);

  const fetchActions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching actions:', error);
    } else {
      setActions(data || []);
    }
    setLoading(false);
  };

  const filterActions = () => {
    let filtered = actions;

    if (searchTerm) {
      filtered = filtered.filter(action =>
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.action_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(action => action.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(action => action.priority === selectedPriority);
    }

    setFilteredActions(filtered);
  };

  const getStats = () => {
    const total = actions.length;
    const open = actions.filter(a => a.status === 'open').length;
    const inProgress = actions.filter(a => a.status === 'in_progress').length;
    const completed = actions.filter(a => a.status === 'completed').length;
    const overdue = actions.filter(a => a.status === 'overdue').length;

    return { total, open, inProgress, completed, overdue };
  };

  const stats = getStats();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Action Tracking</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Comprehensive action item management and accountability tracking
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus className="h-5 w-5 mr-2" />
            New Action
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Open</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.open}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">In Progress</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.inProgress}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Completed</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.completed}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Overdue</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.overdue}</dd>
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
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredActions.map((action) => {
                    const priorityInfo = priorityConfig[action.priority as keyof typeof priorityConfig];
                    const statusInfo = statusConfig[action.status as keyof typeof statusConfig];
                    const StatusIcon = statusInfo?.icon || Clock;

                    return (
                      <tr key={action.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {action.action_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-secondary-900">{action.title}</div>
                          <div className="text-sm text-secondary-500">{action.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', priorityInfo?.color)}>
                            {priorityInfo?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusInfo?.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {action.assigned_to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {format(new Date(action.due_date), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredActions.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No actions found</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
