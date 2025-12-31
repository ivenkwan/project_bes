import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  Eye
} from 'lucide-react';
import { clsx } from 'clsx';

interface Requirement {
  id: string;
  requirement_id: string;
  name: string;
  description: string;
  category: string;
  ci_bill_clause: string;
  schedule_reference: string;
  implementation_timeline: string;
  investment_level: string;
  status: string;
  completion_percentage: number;
  target_date: string | null;
  actual_completion_date: string | null;
  dependencies: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: PlayCircle },
  implemented: { label: 'Implemented', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  validated: { label: 'Validated', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  continuous_monitoring: { label: 'Monitoring', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp },
};

const categoryColors = {
  Organizational: 'bg-blue-500',
  Documentation: 'bg-green-500',
  Technology: 'bg-purple-500',
  Process: 'bg-yellow-500',
  Physical: 'bg-red-500',
};

export default function RequirementsModule() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    filterRequirements();
  }, [requirements, searchTerm, selectedCategory, selectedStatus]);

  const fetchRequirements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .order('requirement_id', { ascending: true });

    if (error) {
      console.error('Error fetching requirements:', error);
    } else {
      setRequirements(data || []);
    }
    setLoading(false);
  };

  const filterRequirements = () => {
    let filtered = requirements;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requirement_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(req => req.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    setFilteredRequirements(filtered);
  };

  const getCompletionStats = () => {
    const total = requirements.length;
    const notStarted = requirements.filter(r => r.status === 'not_started').length;
    const inProgress = requirements.filter(r => r.status === 'in_progress').length;
    const implemented = requirements.filter(r => r.status === 'implemented' || r.status === 'validated' || r.status === 'continuous_monitoring').length;
    const avgCompletion = requirements.reduce((sum, r) => sum + r.completion_percentage, 0) / total;

    return { total, notStarted, inProgress, implemented, avgCompletion };
  };

  const stats = getCompletionStats();
  const categories = ['all', ...Array.from(new Set(requirements.map(r => r.category)))];
  const statuses = ['all', 'not_started', 'in_progress', 'implemented', 'validated', 'continuous_monitoring'];

  const viewRequirementDetail = (requirement: Requirement) => {
    setSelectedRequirement(requirement);
    setShowDetailModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Requirements Management</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Track all 28 HK CI Bill technology requirements with real-time status monitoring
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Requirement
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-secondary-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Total Requirements</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PlayCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">In Progress</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.inProgress}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Implemented</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.implemented}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Avg Completion</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.avgCompletion.toFixed(0)}%</dd>
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
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4">
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

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-4 pr-8 border border-secondary-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : statusConfig[status as keyof typeof statusConfig]?.label || status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Requirement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredRequirements.map((requirement) => {
                    const statusInfo = statusConfig[requirement.status as keyof typeof statusConfig];
                    const StatusIcon = statusInfo?.icon || Clock;

                    return (
                      <tr key={requirement.id} className="hover:bg-secondary-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {requirement.requirement_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-secondary-900">{requirement.name}</div>
                          <div className="text-sm text-secondary-500 truncate max-w-md">
                            {requirement.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white',
                            categoryColors[requirement.category as keyof typeof categoryColors] || 'bg-gray-500'
                          )}>
                            {requirement.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {requirement.implementation_timeline}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusInfo?.color || 'bg-gray-100 text-gray-800'
                          )}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo?.label || requirement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-secondary-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${requirement.completion_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-secondary-900">
                              {requirement.completion_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewRequirementDetail(requirement)}
                            className="text-primary-600 hover:text-primary-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredRequirements.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No requirements found</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedRequirement && (
        <RequirementDetailModal
          requirement={selectedRequirement}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequirement(null);
          }}
        />
      )}
    </MainLayout>
  );
}

interface RequirementDetailModalProps {
  requirement: Requirement;
  onClose: () => void;
}

function RequirementDetailModal({ requirement, onClose }: RequirementDetailModalProps) {
  const statusInfo = statusConfig[requirement.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">{requirement.name}</h2>
            <p className="text-sm text-secondary-500 mt-1">{requirement.requirement_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Category</h3>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white mt-1',
                categoryColors[requirement.category as keyof typeof categoryColors] || 'bg-gray-500'
              )}>
                {requirement.category}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Status</h3>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                statusInfo?.color || 'bg-gray-100 text-gray-800'
              )}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo?.label || requirement.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Implementation Timeline</h3>
              <p className="text-sm text-secondary-900 mt-1">{requirement.implementation_timeline}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Investment Level</h3>
              <p className="text-sm text-secondary-900 mt-1">{requirement.investment_level}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">CI Bill Clause</h3>
              <p className="text-sm text-secondary-900 mt-1">{requirement.ci_bill_clause}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Schedule Reference</h3>
              <p className="text-sm text-secondary-900 mt-1">{requirement.schedule_reference}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Completion Progress</h3>
            <div className="flex items-center">
              <div className="flex-1 bg-secondary-200 rounded-full h-4 mr-3">
                <div
                  className="bg-primary-600 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ width: `${requirement.completion_percentage}%` }}
                >
                  {requirement.completion_percentage > 10 && `${requirement.completion_percentage}%`}
                </div>
              </div>
              <span className="text-sm font-medium text-secondary-900">
                {requirement.completion_percentage}%
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Description</h3>
            <p className="text-sm text-secondary-900">{requirement.description}</p>
          </div>

          {requirement.metadata?.priority && (
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Priority</h3>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                requirement.metadata.priority === 'critical' ? 'bg-red-100 text-red-800' :
                requirement.metadata.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              )}>
                {requirement.metadata.priority.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
            Edit Requirement
          </button>
        </div>
      </div>
    </div>
  );
}
