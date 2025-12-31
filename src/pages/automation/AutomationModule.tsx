import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bot, Cpu, TrendingUp, Activity, Target, Plus, Zap, CheckCircle } from 'lucide-react';

interface MLModel {
  id: string;
  model_name: string;
  model_type: string;
  purpose: string;
  version: string;
  accuracy_target: number | null;
  current_accuracy: number | null;
  last_trained_at: string | null;
  training_data_size: number | null;
  status: string;
  model_config: Record<string, any>;
  created_at: string;
}

interface AutomationMetric {
  id: string;
  automation_type: string;
  task_name: string;
  execution_count: number;
  success_count: number;
  failure_count: number;
  average_duration: string | null;
  manual_effort_saved: string | null;
  measurement_period_start: string;
  measurement_period_end: string;
  created_at: string;
}

export default function AutomationModule() {
  const [activeTab, setActiveTab] = useState<'models' | 'metrics'>('models');
  const [mlModels, setMlModels] = useState<MLModel[]>([]);
  const [automationMetrics, setAutomationMetrics] = useState<AutomationMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModelForm, setShowModelForm] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);

  const [modelForm, setModelForm] = useState({
    model_name: '',
    model_type: 'classification',
    purpose: '',
    version: '1.0.0',
    accuracy_target: '',
    training_data_size: '',
  });

  const [metricForm, setMetricForm] = useState({
    automation_type: 'RPA',
    task_name: '',
    execution_count: '',
    success_count: '',
    failure_count: '',
    measurement_period_start: '',
    measurement_period_end: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'models') {
      await loadMLModels();
    } else {
      await loadAutomationMetrics();
    }
    setLoading(false);
  };

  const loadMLModels = async () => {
    const { data, error } = await supabase
      .from('ml_models')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMlModels(data);
    }
  };

  const loadAutomationMetrics = async () => {
    const { data, error } = await supabase
      .from('automation_metrics')
      .select('*')
      .order('measurement_period_end', { ascending: false });

    if (!error && data) {
      setAutomationMetrics(data);
    }
  };

  const createMLModel = async () => {
    const { error } = await supabase.from('ml_models').insert([
      {
        model_name: modelForm.model_name,
        model_type: modelForm.model_type,
        purpose: modelForm.purpose,
        version: modelForm.version,
        accuracy_target: modelForm.accuracy_target ? parseFloat(modelForm.accuracy_target) : null,
        training_data_size: modelForm.training_data_size
          ? parseInt(modelForm.training_data_size)
          : null,
        status: 'active',
        model_config: {},
      },
    ] as any);

    if (!error) {
      setShowModelForm(false);
      setModelForm({
        model_name: '',
        model_type: 'classification',
        purpose: '',
        version: '1.0.0',
        accuracy_target: '',
        training_data_size: '',
      });
      loadMLModels();
    }
  };

  const createAutomationMetric = async () => {
    const { error } = await supabase.from('automation_metrics').insert([
      {
        automation_type: metricForm.automation_type,
        task_name: metricForm.task_name,
        execution_count: parseInt(metricForm.execution_count),
        success_count: parseInt(metricForm.success_count),
        failure_count: parseInt(metricForm.failure_count),
        measurement_period_start: metricForm.measurement_period_start,
        measurement_period_end: metricForm.measurement_period_end,
      },
    ] as any);

    if (!error) {
      setShowMetricForm(false);
      setMetricForm({
        automation_type: 'RPA',
        task_name: '',
        execution_count: '',
        success_count: '',
        failure_count: '',
        measurement_period_start: '',
        measurement_period_end: '',
      });
      loadAutomationMetrics();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-blue-100 text-blue-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'deprecated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSuccessRate = (metric: AutomationMetric) => {
    const total = metric.execution_count;
    if (total === 0) return '0';
    return ((metric.success_count / total) * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Intelligent Automation & Optimization</h1>
        <p className="mt-2 text-gray-600">
          Machine learning models and RPA performance tracking
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('models')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'models'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4" />
              <span>ML Models</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'metrics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Automation Metrics</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'models' && (
        <div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Models</p>
                  <p className="text-2xl font-bold text-gray-900">{mlModels.length}</p>
                </div>
                <Cpu className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Models</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mlModels.filter((m) => m.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mlModels.length > 0
                      ? (
                          mlModels
                            .filter((m) => m.current_accuracy)
                            .reduce((sum, m) => sum + (m.current_accuracy || 0), 0) /
                          mlModels.filter((m) => m.current_accuracy).length
                        ).toFixed(1)
                      : '0'}
                    %
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Training</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mlModels.filter((m) => m.status === 'training').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowModelForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add ML Model
            </button>
          </div>

          {showModelForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add ML Model</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    value={modelForm.model_name}
                    onChange={(e) => setModelForm({ ...modelForm, model_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Risk Prediction Model"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model Type</label>
                    <select
                      value={modelForm.model_type}
                      onChange={(e) => setModelForm({ ...modelForm, model_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="classification">Classification</option>
                      <option value="regression">Regression</option>
                      <option value="clustering">Clustering</option>
                      <option value="anomaly_detection">Anomaly Detection</option>
                      <option value="forecasting">Forecasting</option>
                      <option value="nlp">Natural Language Processing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      value={modelForm.version}
                      onChange={(e) => setModelForm({ ...modelForm, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <textarea
                    value={modelForm.purpose}
                    onChange={(e) => setModelForm({ ...modelForm, purpose: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Model purpose and use case..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accuracy Target (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={modelForm.accuracy_target}
                      onChange={(e) => setModelForm({ ...modelForm, accuracy_target: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="95.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Training Data Size
                    </label>
                    <input
                      type="number"
                      value={modelForm.training_data_size}
                      onChange={(e) =>
                        setModelForm({ ...modelForm, training_data_size: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10000"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModelForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createMLModel}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Model
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
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accuracy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Trained
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mlModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <Bot className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{model.model_name}</div>
                            <div className="text-sm text-gray-500">{model.purpose}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {model.model_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {model.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {model.current_accuracy ? `${model.current_accuracy}%` : '-'}
                        </div>
                        {model.accuracy_target && (
                          <div className="text-xs text-gray-500">Target: {model.accuracy_target}%</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            model.status
                          )}`}
                        >
                          {model.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {model.last_trained_at
                          ? new Date(model.last_trained_at).toLocaleDateString()
                          : 'Not trained'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {mlModels.length === 0 && (
                <div className="text-center py-12 text-gray-500">No ML models found</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{automationMetrics.length}</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {automationMetrics.reduce((sum, m) => sum + m.execution_count, 0)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {automationMetrics.length > 0
                      ? (
                          automationMetrics.reduce(
                            (sum, m) => sum + parseFloat(calculateSuccessRate(m)),
                            0
                          ) / automationMetrics.length
                        ).toFixed(1)
                      : '0'}
                    %
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Automation Types</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(automationMetrics.map((m) => m.automation_type)).size}
                  </p>
                </div>
                <Bot className="w-8 h-8 text-orange-500" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Automation Metric</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                  <input
                    type="text"
                    value={metricForm.task_name}
                    onChange={(e) => setMetricForm({ ...metricForm, task_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Automated Risk Assessment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Automation Type
                  </label>
                  <select
                    value={metricForm.automation_type}
                    onChange={(e) => setMetricForm({ ...metricForm, automation_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="RPA">RPA (Robotic Process Automation)</option>
                    <option value="ML">Machine Learning</option>
                    <option value="API">API Integration</option>
                    <option value="Workflow">Workflow Automation</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Execution Count
                    </label>
                    <input
                      type="number"
                      value={metricForm.execution_count}
                      onChange={(e) =>
                        setMetricForm({ ...metricForm, execution_count: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Success Count
                    </label>
                    <input
                      type="number"
                      value={metricForm.success_count}
                      onChange={(e) => setMetricForm({ ...metricForm, success_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="95"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Failure Count
                    </label>
                    <input
                      type="number"
                      value={metricForm.failure_count}
                      onChange={(e) => setMetricForm({ ...metricForm, failure_count: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                    <input
                      type="date"
                      value={metricForm.measurement_period_start}
                      onChange={(e) =>
                        setMetricForm({ ...metricForm, measurement_period_start: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                    <input
                      type="date"
                      value={metricForm.measurement_period_end}
                      onChange={(e) =>
                        setMetricForm({ ...metricForm, measurement_period_end: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowMetricForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createAutomationMetric}
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
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Executions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {automationMetrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <Zap className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{metric.task_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.automation_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{metric.execution_count}</div>
                        <div className="text-xs text-gray-500">
                          {metric.success_count} success / {metric.failure_count} failed
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {calculateSuccessRate(metric)}%
                          </div>
                          <div className="ml-2 flex-1">
                            <div className="h-2 bg-gray-200 rounded-full w-20">
                              <div
                                className="h-2 bg-green-500 rounded-full"
                                style={{ width: `${calculateSuccessRate(metric)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(metric.measurement_period_start).toLocaleDateString()} -{' '}
                        {new Date(metric.measurement_period_end).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {automationMetrics.length === 0 && (
                <div className="text-center py-12 text-gray-500">No automation metrics found</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
