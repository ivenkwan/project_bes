import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Upload, Eye, History } from 'lucide-react';

interface Policy {
  id: string;
  policy_id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  effective_date: string | null;
  next_review_date: string | null;
  created_at: string;
}

interface PolicyVersion {
  id: string;
  version_number: number;
  change_summary: string;
  approved_at: string | null;
  created_at: string;
}

interface Evidence {
  id: string;
  evidence_type: string;
  description: string;
  file_url: string | null;
  collection_method: string;
  collected_at: string;
  expiration_date: string | null;
  status: string;
}

export default function PolicyModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'policies' | 'evidence'>('policies');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [versions, setVersions] = useState<PolicyVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const [policyForm, setPolicyForm] = useState({
    title: '',
    category: 'security',
    description: '',
    effective_date: '',
    next_review_date: '',
  });

  const [evidenceForm, setEvidenceForm] = useState({
    evidence_type: 'document',
    description: '',
    file_url: '',
    collection_method: 'manual',
    expiration_date: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'policies') {
      await loadPolicies();
    } else {
      await loadEvidence();
    }
    setLoading(false);
  };

  const loadPolicies = async () => {
    const { data, error } = await supabase
      .from('policies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPolicies(data);
    }
  };

  const loadEvidence = async () => {
    const { data, error } = await supabase
      .from('compliance_evidence')
      .select('*')
      .order('collected_at', { ascending: false });

    if (!error && data) {
      setEvidence(data);
    }
  };

  const loadVersions = async (policyId: string) => {
    const { data, error } = await supabase
      .from('policy_versions')
      .select('*')
      .eq('policy_id', policyId)
      .order('version_number', { ascending: false });

    if (!error && data) {
      setVersions(data);
      setShowVersions(true);
    }
  };

  const createPolicy = async () => {
    if (!user) return;

    const policyId = `POL-${Date.now()}`;
    const { error } = await supabase.from('policies').insert([
      {
        policy_id: policyId,
        title: policyForm.title,
        category: policyForm.category,
        description: policyForm.description,
        status: 'draft',
        effective_date: policyForm.effective_date || null,
        next_review_date: policyForm.next_review_date || null,
        owner_id: user.id,
      },
    ] as any);

    if (!error) {
      setShowPolicyForm(false);
      setPolicyForm({
        title: '',
        category: 'security',
        description: '',
        effective_date: '',
        next_review_date: '',
      });
      loadPolicies();
    }
  };

  const createEvidence = async () => {
    if (!user) return;

    const { error } = await supabase.from('compliance_evidence').insert([
      {
        evidence_type: evidenceForm.evidence_type,
        description: evidenceForm.description,
        file_url: evidenceForm.file_url || null,
        collection_method: evidenceForm.collection_method,
        expiration_date: evidenceForm.expiration_date || null,
        status: 'valid',
        created_by: user.id,
      },
    ] as any);

    if (!error) {
      setShowEvidenceForm(false);
      setEvidenceForm({
        evidence_type: 'document',
        description: '',
        file_url: '',
        collection_method: 'manual',
        expiration_date: '',
      });
      loadEvidence();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'invalid':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid':
        return <CheckCircle className="w-4 h-4" />;
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'expired':
      case 'invalid':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documentation & Policy Management</h1>
        <p className="mt-2 text-gray-600">
          Manage security policies, procedures, and compliance evidence
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'policies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Policies & Procedures</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Compliance Evidence</span>
            </div>
          </button>
        </nav>
      </div>

      {activeTab === 'policies' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {policies.length} Total Policies
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {policies.filter((p) => p.status === 'active').length} Active
              </span>
            </div>
            <button
              onClick={() => setShowPolicyForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </button>
          </div>

          {showPolicyForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Policy</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Policy title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={policyForm.category}
                    onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="security">Security</option>
                    <option value="incident_response">Incident Response</option>
                    <option value="access_control">Access Control</option>
                    <option value="data_protection">Data Protection</option>
                    <option value="business_continuity">Business Continuity</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={policyForm.description}
                    onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Policy description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={policyForm.effective_date}
                      onChange={(e) => setPolicyForm({ ...policyForm, effective_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Review Date</label>
                    <input
                      type="date"
                      value={policyForm.next_review_date}
                      onChange={(e) => setPolicyForm({ ...policyForm, next_review_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPolicyForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPolicy}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Policy
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
                      Policy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Effective Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {policies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{policy.title}</div>
                            <div className="text-sm text-gray-500">{policy.policy_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {policy.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            policy.status
                          )}`}
                        >
                          {getStatusIcon(policy.status)}
                          <span className="ml-1 capitalize">{policy.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {policy.effective_date
                          ? new Date(policy.effective_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {policy.next_review_date
                          ? new Date(policy.next_review_date).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedPolicy(policy);
                            loadVersions(policy.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <History className="w-4 h-4 mr-1" />
                          Versions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {policies.length === 0 && (
                <div className="text-center py-12 text-gray-500">No policies found</div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {evidence.length} Total Evidence
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {evidence.filter((e) => e.status === 'valid').length} Valid
              </span>
            </div>
            <button
              onClick={() => setShowEvidenceForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Evidence
            </button>
          </div>

          {showEvidenceForm && (
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Compliance Evidence</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
                  <select
                    value={evidenceForm.evidence_type}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="screenshot">Screenshot</option>
                    <option value="log_export">Log Export</option>
                    <option value="configuration">Configuration</option>
                    <option value="audit_report">Audit Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={evidenceForm.description}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Evidence description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
                  <input
                    type="text"
                    value={evidenceForm.file_url}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, file_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Collection Method</label>
                    <select
                      value={evidenceForm.collection_method}
                      onChange={(e) =>
                        setEvidenceForm({ ...evidenceForm, collection_method: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manual</option>
                      <option value="automated">Automated</option>
                      <option value="api">API</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      value={evidenceForm.expiration_date}
                      onChange={(e) =>
                        setEvidenceForm({ ...evidenceForm, expiration_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEvidenceForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createEvidence}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Evidence
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
                      Evidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collected
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evidence.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <Upload className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.description}</div>
                            {item.file_url && (
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View File
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {item.evidence_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {item.collection_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.collected_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {evidence.length === 0 && (
                <div className="text-center py-12 text-gray-500">No evidence found</div>
              )}
            </div>
          )}
        </div>
      )}

      {showVersions && selectedPolicy && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Policy Versions</h3>
                  <p className="text-sm text-gray-500">{selectedPolicy.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowVersions(false);
                    setSelectedPolicy(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Version {version.version_number}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {version.change_summary && (
                      <p className="text-sm text-gray-600 mb-2">{version.change_summary}</p>
                    )}
                    {version.approved_at && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved {new Date(version.approved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
                {versions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">No versions found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
