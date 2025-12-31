import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingDown, Server, Target, AlertTriangle, CheckCircle, Plus, BarChart3 } from 'lucide-react';

interface ProcessMetric {
  id: string;
  process_name: string;
  metric_type: string;
  metric_value: number;
  measurement_date: string;
  bottleneck_identified: boolean;
  improvement_opportunity: string | null;
  metadata: Record<string, any>;
}

interface LegacySystem {
  id: string;
  system_name: string;
  system_type: string | null;
  description: string | null;
  status: string;
  redundancy_identified: boolean;
  replacement_system: string | null;
  migration_plan: string | null;
  decommission_target_date: string | null;
  created_at: string;
}

export default function OptimizationModule() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'legacy'>('metrics');
  const [processMetrics, setProcessMetrics] = useState<ProcessMetric[]>([]);
  const [legacySystems, setLegacySystems] = useState<LegacySystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showSystemForm, setShowSystemForm] = useState(false);

  const [metricForm, setMetricForm] = useState({
    process_name: '',
    metric_type: 'execution_time',
    metric_value: '',
    bottleneck_identified: false,
    improvement_opportunity: '',
  });

  const [systemForm, setSystemForm] = useState({
    system_name: '',
    system_type: '',
    description: '',
    redundancy_identified: false,
    replacement_system: '',
    migration_plan: '',
    decommission_target_date: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'metrics') {
      await loadProcessMetrics();
    } else {
      await loadLegacySystems();
    }
    setLoading(false);
  };

  const loadProcessMetrics = async () => {
    const { data, error } = await supabase
      .from('process_metrics')
      .select('*')
      .order('measurement_date', { ascending: false });

    if (!error && data) {
      setProcessMetrics(data);
    }
  };

  const loadLegacySystems = async () => {
    const { data, error } = await supabase
      .from('legacy_systems')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLegacySystems(data);
    }
  };

  const createProcessMetric = async () => {
    const { error } = await supabase.from('process_metrics').insert([
      {
        process_name: metricForm.process_name,
        metric_type: metricForm.metric_type,
        metric_value: parseFloat(metricForm.metric_value),
        bottleneck_identified: metricForm.bottleneck_identified,
        improvement_opportunity: metricForm.improvement_opportunity || null,
        metadata: {},
      },
    ] as any);

    if (!error) {
      setShowMetricForm(false);
      setMetricForm({
        process_name: '',
        metric_type: 'execution_time',
        metric_value: '',
        bottleneck_identified: false,
        improvement_opportunity: '',
      });
      loadProcessMetrics();
    }
  };

  const createLegacySystem = async () => {
    const { error } = await supabase.from('legacy_systems').insert([
      {
        system_name: systemForm.system_name,
        system_type: systemForm.system_type || null,
        description: systemForm.description || null,
        status: 'active',
        redundancy_identified: systemForm.redundancy_identified,
        replacement_system: systemForm.replacement_system || null,
        migration_plan: systemForm.migration_plan || null,
        decommission_target_date: systemForm.decommission_target_date || null,
      },
    ] as any);

    if (!error) {
      setShowSystemForm(false);
      setSystemForm({
        system_name: '',
        system_type: '',
        description: '',
        redundancy_identified: false,
        replacement_system: '',
        migration_plan: '',
        decommission_target_date: '',
      });
      loadLegacySystems();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'migrating':
        return 'bg-blue-100 text-blue-800';
      case 'decommissioned':
        return 'bg-gray-100 text-gray-800';
      case 'planned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      execution_time: 'Execution Time',
      error_rate: 'Error Rate',
      throughput: 'Throughput',
      resource_usage: 'Resource Usage',
      cost: 'Cost',
      user_satisfaction: 'User Satisfaction',
    };
    return labels[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simplification & Standardization</h1>
        <p className="mt-2 text-gray-600">
          Optimize compliance processes and identify legacy system redundancies
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Process Metrics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('legacy')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'legacy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>Legacy Systems</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'metrics' && (
        <div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Metrics</p>
                  <p className="text-2xl font-bold text-gray-900">{processMetrics.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bottlenecks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {processMetrics.filter((m) => m.bottleneck_identified).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Opportunities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {processMetrics.filter((m) => m.improvement_opportunity).length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(processMetrics.map((m) => m.process_name)).size}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowMetricForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Metric
            </button>
          </div>

          {showMetricForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Process Metric</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Process Name</label>
                  <input
                    type="text"
                    value={metricForm.process_name}
                    onChange={(e) => setMetricForm({ ...metricForm, process_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Risk Assessment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric Type</label>
                    <select
                      value={metricForm.metric_type}
                      onChange={(e) => setMetricForm({ ...metricForm, metric_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="execution_time">Execution Time</option>
                      <option value="error_rate">Error Rate</option>
                      <option value="throughput">Throughput</option>
                      <option value="resource_usage">Resource Usage</option>
                      <option value="cost">Cost</option>
                      <option value="user_satisfaction">User Satisfaction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric Value</label>
                    <input
                      type="number"
                      step="0.01"
                      value={metricForm.metric_value}
                      onChange={(e) => setMetricForm({ ...metricForm, metric_value: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={metricForm.bottleneck_identified}
                      onChange={(e) =>
                        setMetricForm({ ...metricForm, bottleneck_identified: e.target.checked })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Bottleneck Identified</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Improvement Opportunity
                  </label>
                  <textarea
                    value={metricForm.improvement_opportunity}
                    onChange={(e) =>
                      setMetricForm({ ...metricForm, improvement_opportunity: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe improvement opportunity..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowMetricForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createProcessMetric}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Metric
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Process
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {processMetrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <BarChart3 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{metric.process_name}</div>
                            {metric.improvement_opportunity && (
                              <div className="text-sm text-gray-500">{metric.improvement_opportunity}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getMetricTypeLabel(metric.metric_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {metric.metric_value}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(metric.measurement_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {metric.bottleneck_identified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Bottleneck
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {processMetrics.length === 0 && (
                <div className="text-center py-12 text-gray-500">No metrics found</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'legacy' && (
        <div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Systems</p>
                  <p className="text-2xl font-bold text-gray-900">{legacySystems.length}</p>
                </div>
                <Server className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {legacySystems.filter((s) => s.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Redundant</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {legacySystems.filter((s) => s.redundancy_identified).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Decommissioned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {legacySystems.filter((s) => s.status === 'decommissioned').length}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowSystemForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Legacy System
            </button>
          </div>

          {showSystemForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Legacy System</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                  <input
                    type="text"
                    value={systemForm.system_name}
                    onChange={(e) => setSystemForm({ ...systemForm, system_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Legacy SIEM Platform"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Type</label>
                  <input
                    type="text"
                    value={systemForm.system_type}
                    onChange={(e) => setSystemForm({ ...systemForm, system_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Security Monitoring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={systemForm.description}
                    onChange={(e) => setSystemForm({ ...systemForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="System description..."
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={systemForm.redundancy_identified}
                      onChange={(e) =>
                        setSystemForm({ ...systemForm, redundancy_identified: e.target.checked })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Redundancy Identified</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Replacement System</label>
                  <input
                    type="text"
                    value={systemForm.replacement_system}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, replacement_system: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Splunk Enterprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Migration Plan</label>
                  <textarea
                    value={systemForm.migration_plan}
                    onChange={(e) => setSystemForm({ ...systemForm, migration_plan: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Migration plan details..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decommission Target Date
                  </label>
                  <input
                    type="date"
                    value={systemForm.decommission_target_date}
                    onChange={(e) =>
                      setSystemForm({ ...systemForm, decommission_target_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSystemForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createLegacySystem}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add System
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Replacement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {legacySystems.map((system) => (
                    <tr key={system.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <Server className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{system.system_name}</div>
                            {system.description && (
                              <div className="text-sm text-gray-500">{system.description}</div>
                            )}
                            {system.redundancy_identified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Redundant
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {system.system_type || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            system.status
                          )}`}
                        >
                          {system.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {system.replacement_system || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {system.decommission_target_date
                          ? new Date(system.decommission_target_date).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {legacySystems.length === 0 && (
                <div className="text-center py-12 text-gray-500">No legacy systems found</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
