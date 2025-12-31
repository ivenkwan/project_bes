import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface Risk {
  id: string;
  risk_id: string;
  title: string;
  description: string;
  category: string;
  likelihood: string;
  impact: string;
  risk_score: number;
  status: string;
  owner: string;
  mitigation_strategy: string;
  residual_risk_score: number;
  review_date: string;
  created_at: string;
  updated_at: string;
}

const likelihoodLevels = {
  rare: { label: 'Rare', value: 1, color: 'bg-green-100 text-green-800' },
  unlikely: { label: 'Unlikely', value: 2, color: 'bg-blue-100 text-blue-800' },
  possible: { label: 'Possible', value: 3, color: 'bg-yellow-100 text-yellow-800' },
  likely: { label: 'Likely', value: 4, color: 'bg-orange-100 text-orange-800' },
  almost_certain: { label: 'Almost Certain', value: 5, color: 'bg-red-100 text-red-800' }
};

const impactLevels = {
  insignificant: { label: 'Insignificant', value: 1, color: 'bg-green-100 text-green-800' },
  minor: { label: 'Minor', value: 2, color: 'bg-blue-100 text-blue-800' },
  moderate: { label: 'Moderate', value: 3, color: 'bg-yellow-100 text-yellow-800' },
  major: { label: 'Major', value: 4, color: 'bg-orange-100 text-orange-800' },
  catastrophic: { label: 'Catastrophic', value: 5, color: 'bg-red-100 text-red-800' }
};

const getRiskLevel = (score: number) => {
  if (score >= 15) return { label: 'Critical', color: 'bg-red-500', textColor: 'text-white' };
  if (score >= 10) return { label: 'High', color: 'bg-orange-500', textColor: 'text-white' };
  if (score >= 6) return { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-white' };
  return { label: 'Low', color: 'bg-green-500', textColor: 'text-white' };
};

const statusConfig = {
  identified: { label: 'Identified', color: 'bg-blue-100 text-blue-800' },
  assessed: { label: 'Assessed', color: 'bg-purple-100 text-purple-800' },
  mitigating: { label: 'Mitigating', color: 'bg-yellow-100 text-yellow-800' },
  monitoring: { label: 'Monitoring', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
};

export default function RiskModule() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRisks();
  }, []);

  useEffect(() => {
    filterRisks();
  }, [risks, searchTerm, selectedCategory, selectedRiskLevel, selectedStatus]);

  const fetchRisks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('risks')
      .select('*')
      .order('risk_score', { ascending: false });

    if (error) {
      console.error('Error fetching risks:', error);
    } else {
      setRisks(data || []);
    }
    setLoading(false);
  };

  const filterRisks = () => {
    let filtered = risks;

    if (searchTerm) {
      filtered = filtered.filter(risk =>
        risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.risk_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(risk => risk.category === selectedCategory);
    }

    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(risk => {
        const level = getRiskLevel(risk.risk_score).label.toLowerCase();
        return level === selectedRiskLevel;
      });
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(risk => risk.status === selectedStatus);
    }

    setFilteredRisks(filtered);
  };

  const getRiskStats = () => {
    const total = risks.length;
    const critical = risks.filter(r => r.risk_score >= 15).length;
    const high = risks.filter(r => r.risk_score >= 10 && r.risk_score < 15).length;
    const medium = risks.filter(r => r.risk_score >= 6 && r.risk_score < 10).length;
    const low = risks.filter(r => r.risk_score < 6).length;
    const avgScore = risks.length > 0 ? risks.reduce((sum, r) => sum + r.risk_score, 0) / total : 0;

    return { total, critical, high, medium, low, avgScore };
  };

  const stats = getRiskStats();
  const categories = ['all', ...Array.from(new Set(risks.map(r => r.category)))];

  const viewRiskDetail = (risk: Risk) => {
    setSelectedRisk(risk);
    setShowDetailModal(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Risk Management</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Comprehensive risk assessment and mitigation tracking system
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Risk
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-secondary-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Total Risks</dt>
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
                  <TrendingUp className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Critical + High</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.critical + stats.high}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Medium</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.medium}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">Avg Risk Score</dt>
                    <dd className="text-2xl font-semibold text-secondary-900">{stats.avgScore.toFixed(1)}</dd>
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
                  placeholder="Search risks..."
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
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="pl-4 pr-8 border border-secondary-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-4 pr-8 border border-secondary-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="identified">Identified</option>
                  <option value="assessed">Assessed</option>
                  <option value="mitigating">Mitigating</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRisks.map((risk) => {
                const riskLevel = getRiskLevel(risk.risk_score);
                const statusInfo = statusConfig[risk.status as keyof typeof statusConfig];

                return (
                  <div
                    key={risk.id}
                    className="border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => viewRiskDetail(risk)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-secondary-900">{risk.title}</h3>
                          <span className="text-sm text-secondary-500">{risk.risk_id}</span>
                          <span className={clsx(
                            'px-3 py-1 rounded-full text-xs font-semibold',
                            riskLevel.color,
                            riskLevel.textColor
                          )}>
                            {riskLevel.label}
                          </span>
                          <span className={clsx(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusInfo?.color || 'bg-gray-100 text-gray-800'
                          )}>
                            {statusInfo?.label || risk.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary-600">{risk.description}</p>

                        <div className="mt-4 grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-secondary-500">Category</p>
                            <p className="text-sm font-medium text-secondary-900">{risk.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500">Likelihood</p>
                            <p className="text-sm font-medium text-secondary-900">
                              {likelihoodLevels[risk.likelihood as keyof typeof likelihoodLevels]?.label || risk.likelihood}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500">Impact</p>
                            <p className="text-sm font-medium text-secondary-900">
                              {impactLevels[risk.impact as keyof typeof impactLevels]?.label || risk.impact}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500">Risk Score</p>
                            <p className="text-sm font-semibold text-secondary-900">{risk.risk_score} / 25</p>
                          </div>
                        </div>

                        {risk.residual_risk_score && (
                          <div className="mt-3 flex items-center space-x-2">
                            <TrendingDown className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-secondary-600">
                              Residual Risk: <span className="font-medium">{risk.residual_risk_score}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-5 w-5 text-secondary-400" />
                    </div>
                  </div>
                );
              })}

              {filteredRisks.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No risks found</h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showDetailModal && selectedRisk && (
        <RiskDetailModal
          risk={selectedRisk}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRisk(null);
          }}
        />
      )}
    </MainLayout>
  );
}

interface RiskDetailModalProps {
  risk: Risk;
  onClose: () => void;
}

function RiskDetailModal({ risk, onClose }: RiskDetailModalProps) {
  const riskLevel = getRiskLevel(risk.risk_score);
  const residualLevel = risk.residual_risk_score ? getRiskLevel(risk.residual_risk_score) : null;
  const statusInfo = statusConfig[risk.status as keyof typeof statusConfig];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">{risk.title}</h2>
            <p className="text-sm text-secondary-500 mt-1">{risk.risk_id}</p>
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
          <div className="flex items-center space-x-4">
            <span className={clsx(
              'px-4 py-2 rounded-full text-sm font-semibold',
              riskLevel.color,
              riskLevel.textColor
            )}>
              {riskLevel.label} Risk
            </span>
            <span className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium',
              statusInfo?.color || 'bg-gray-100 text-gray-800'
            )}>
              {statusInfo?.label || risk.status}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Description</h3>
            <p className="text-sm text-secondary-900">{risk.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Category</h3>
              <p className="text-sm text-secondary-900">{risk.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Risk Owner</h3>
              <p className="text-sm text-secondary-900">{risk.owner}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Likelihood</h3>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                likelihoodLevels[risk.likelihood as keyof typeof likelihoodLevels]?.color
              )}>
                {likelihoodLevels[risk.likelihood as keyof typeof likelihoodLevels]?.label} ({likelihoodLevels[risk.likelihood as keyof typeof likelihoodLevels]?.value})
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Impact</h3>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                impactLevels[risk.impact as keyof typeof impactLevels]?.color
              )}>
                {impactLevels[risk.impact as keyof typeof impactLevels]?.label} ({impactLevels[risk.impact as keyof typeof impactLevels]?.value})
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Risk Score</h3>
              <p className="text-2xl font-bold text-secondary-900">{risk.risk_score}</p>
              <p className="text-xs text-secondary-500">out of 25</p>
            </div>
          </div>

          {risk.mitigation_strategy && (
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Mitigation Strategy</h3>
              <p className="text-sm text-secondary-900">{risk.mitigation_strategy}</p>
            </div>
          )}

          {risk.residual_risk_score && residualLevel && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-900 mb-1">Residual Risk After Mitigation</h3>
                  <div className="flex items-center space-x-3">
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-sm font-semibold',
                      residualLevel.color,
                      residualLevel.textColor
                    )}>
                      {residualLevel.label}
                    </span>
                    <span className="text-lg font-bold text-green-900">{risk.residual_risk_score}</span>
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingDown className="h-6 w-6 mr-2" />
                  <span className="text-2xl font-bold">-{risk.risk_score - risk.residual_risk_score}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Next Review Date</h3>
              <p className="text-sm text-secondary-900">
                {risk.review_date ? format(new Date(risk.review_date), 'MMMM d, yyyy') : 'Not set'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Last Updated</h3>
              <p className="text-sm text-secondary-900">{format(new Date(risk.updated_at), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 hover:bg-secondary-50"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700">
            Edit Risk
          </button>
        </div>
      </div>
    </div>
  );
}
