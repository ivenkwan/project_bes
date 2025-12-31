import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Shield, Clock, CheckCircle, XCircle, Search, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface Incident {
  id: string;
  incident_id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  reported_by: string;
  assigned_to: string;
  detected_at: string;
  resolved_at: string | null;
  impact_assessment: string;
  created_at: string;
  updated_at: string;
}

const severityConfig = {
  critical: { label: 'Critical', color: 'bg-red-500 text-white', icon: AlertTriangle },
  high: { label: 'High', color: 'bg-orange-500 text-white', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'bg-yellow-500 text-white', icon: Shield },
  low: { label: 'Low', color: 'bg-green-500 text-white', icon: Shield }
};

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
  investigating: { label: 'Investigating', color: 'bg-purple-100 text-purple-800' },
  contained: { label: 'Contained', color: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
};

export default function IncidentsModule() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, selectedSeverity, selectedStatus]);

  const fetchIncidents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents:', error);
    } else {
      setIncidents(data || []);
    }
    setLoading(false);
  };

  const filterIncidents = () => {
    let filtered = incidents;

    if (searchTerm) {
      filtered = filtered.filter(incident =>
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incident_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(incident => incident.severity === selectedSeverity);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(incident => incident.status === selectedStatus);
    }

    setFilteredIncidents(filtered);
  };

  const getStats = () => {
    const total = incidents.length;
    const active = incidents.filter(i => ['new', 'investigating', 'contained'].includes(i.status)).length;
    const critical = incidents.filter(i => i.severity === 'critical').length;
    const resolved = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;

    return { total, active, critical, resolved };
  };

  const stats = getStats();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Incident Management</h1>
            <p className="mt-2 text-sm text-secondary-600">
              Security incident detection, response, and resolution tracking
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            <Plus className="h-5 w-5 mr-2" />
            Report Incident
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Total Incidents</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.total}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Active</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.active}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Critical</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.critical}</dd>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <dt className="text-sm font-medium text-secondary-500">Resolved</dt>
                <dd className="text-2xl font-semibold text-secondary-900">{stats.resolved}</dd>
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
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-secondary-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="contained">Contained</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIncidents.map((incident) => {
                const severityInfo = severityConfig[incident.severity as keyof typeof severityConfig];
                const statusInfo = statusConfig[incident.status as keyof typeof statusConfig];
                const SeverityIcon = severityInfo?.icon || Shield;

                return (
                  <div key={incident.id} className="border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-secondary-900">{incident.title}</h3>
                          <span className="text-sm text-secondary-500">{incident.incident_id}</span>
                          <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', severityInfo?.color)}>
                            <SeverityIcon className="h-3 w-3 mr-1" />
                            {severityInfo?.label}
                          </span>
                          <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', statusInfo?.color)}>
                            {statusInfo?.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-secondary-600">{incident.description}</p>

                        <div className="mt-4 grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-secondary-500">Category</p>
                            <p className="text-sm font-medium text-secondary-900">{incident.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500">Reported By</p>
                            <p className="text-sm font-medium text-secondary-900">{incident.reported_by}</p>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500">Assigned To</p>
                            <p className="text-sm font-medium text-secondary-900">{incident.assigned_to}</p>
                          </div>
                          <div>
                            <p className="text-xs text-secondary-500">Detected</p>
                            <p className="text-sm font-medium text-secondary-900">
                              {format(new Date(incident.detected_at), 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>

                        {incident.resolved_at && (
                          <div className="mt-3 text-sm text-green-600">
                            Resolved on {format(new Date(incident.resolved_at), 'MMMM d, yyyy HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredIncidents.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">No incidents found</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
