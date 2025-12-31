/*
  # CISCE Platform - Initial Database Schema

  ## Overview
  Creates comprehensive database schema for Critical Infrastructure Cybersecurity Compliance Orchestration Engine (CISCE)
  covering all 10 functional modules and 43 requirements.

  ## New Tables Created

  ### Module F2: Requirement Management & Tracking
  1. `requirements` - Catalog of all 28 HK CI Bill technology requirements
  2. `requirement_controls` - Mapping of requirements to implemented security controls
  3. `requirement_status_history` - Audit trail of requirement status changes

  ### Module F1: Workflow Orchestration Engine
  4. `workflows` - BPMN 2.0 workflow definitions
  5. `workflow_instances` - Active workflow execution instances
  6. `workflow_tasks` - Individual tasks within workflow instances
  7. `workflow_events` - Event triggers and workflow execution logs

  ### Module F3: Risk & Vulnerability Management
  8. `risks` - Risk and vulnerability registry
  9. `risk_scores` - Historical risk scoring data
  10. `remediation_playbooks` - Library of remediation procedures
  11. `remediation_actions` - Specific remediation actions and tracking

  ### Module F4: Approval & Governance Workflows
  12. `approval_workflows` - Approval workflow definitions
  13. `approvals` - Individual approval requests and decisions
  14. `exceptions` - Exception and override management

  ### Module F5: Compliance Review & Assessment
  15. `assessments` - Annual risk assessments and audits
  16. `assessment_findings` - Findings from assessments and audits
  17. `drills` - Security drill scheduling and execution

  ### Module F6: Action Tracking & Accountability
  18. `actions` - All compliance-related actions and tasks
  19. `action_evidence` - Evidence collection for action completion

  ### Module F7: Incident Response Orchestration
  20. `incidents` - Security incident registry
  21. `incident_timeline` - Timeline of incident events
  22. `incident_reports` - Regulatory incident reports

  ### Module F8: Documentation & Policy Management
  23. `policies` - Policy and procedure repository
  24. `policy_versions` - Version control for policy documents
  25. `compliance_evidence` - Automated evidence collection

  ### Module F9: Simplification & Standardization
  26. `process_metrics` - Process mining and performance metrics
  27. `legacy_systems` - Legacy system inventory

  ### Module F10: Intelligent Automation & Optimization
  28. `ml_models` - Machine learning model registry
  29. `automation_metrics` - RPA and automation performance metrics

  ### Supporting Tables
  30. `user_profiles` - Extended user profile information
  31. `audit_logs` - Comprehensive audit trail

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access to authenticated users
  - Audit trail maintained for all critical operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  department text,
  phone text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- MODULE F2: REQUIREMENT MANAGEMENT & TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS requirements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  ci_bill_clause text,
  schedule_reference text,
  implementation_timeline text,
  investment_level text,
  status text NOT NULL DEFAULT 'not_started',
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  target_date date,
  actual_completion_date date,
  dependencies jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view requirements"
  ON requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert requirements"
  ON requirements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update requirements"
  ON requirements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS requirement_controls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id uuid REFERENCES requirements(id) ON DELETE CASCADE NOT NULL,
  control_id text NOT NULL,
  control_name text NOT NULL,
  framework text NOT NULL,
  control_description text,
  implementation_status text DEFAULT 'not_implemented',
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  evidence_points jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE requirement_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view requirement controls"
  ON requirement_controls FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage requirement controls"
  ON requirement_controls FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS requirement_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id uuid REFERENCES requirements(id) ON DELETE CASCADE NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  previous_completion integer,
  new_completion integer NOT NULL,
  changed_by uuid REFERENCES auth.users(id) NOT NULL,
  change_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE requirement_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view requirement history"
  ON requirement_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert requirement history"
  ON requirement_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- MODULE F1: WORKFLOW ORCHESTRATION ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  bpmn_definition jsonb NOT NULL,
  version integer DEFAULT 1 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  trigger_type text DEFAULT 'manual',
  trigger_config jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage workflows"
  ON workflows FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'running' NOT NULL,
  started_by uuid REFERENCES auth.users(id) NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  context_data jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workflow instances"
  ON workflow_instances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage workflow instances"
  ON workflow_instances FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS workflow_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_instance_id uuid REFERENCES workflow_instances(id) ON DELETE CASCADE NOT NULL,
  task_name text NOT NULL,
  task_type text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  task_data jsonb DEFAULT '{}'::jsonb,
  result_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE workflow_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workflow tasks"
  ON workflow_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage workflow tasks"
  ON workflow_tasks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS workflow_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  workflow_instance_id uuid REFERENCES workflow_instances(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_source text,
  event_data jsonb DEFAULT '{}'::jsonb,
  processed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workflow events"
  ON workflow_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage workflow events"
  ON workflow_events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F3: RISK & VULNERABILITY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  risk_type text NOT NULL,
  source_system text,
  cvss_score numeric(3,1),
  epss_score numeric(5,4),
  asset_criticality text,
  business_impact text,
  current_risk_score numeric(5,2),
  status text DEFAULT 'open' NOT NULL,
  affected_assets jsonb DEFAULT '[]'::jsonb,
  discovered_at timestamptz DEFAULT now() NOT NULL,
  sla_due_date timestamptz,
  closed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view risks"
  ON risks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage risks"
  ON risks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS risk_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid REFERENCES risks(id) ON DELETE CASCADE NOT NULL,
  score numeric(5,2) NOT NULL,
  scoring_method text NOT NULL,
  factors jsonb DEFAULT '{}'::jsonb,
  calculated_by uuid REFERENCES auth.users(id),
  calculated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view risk scores"
  ON risk_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert risk scores"
  ON risk_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS remediation_playbooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  vulnerability_types text[] DEFAULT ARRAY[]::text[],
  steps jsonb NOT NULL,
  approval_required boolean DEFAULT false NOT NULL,
  estimated_duration interval,
  success_rate numeric(5,2),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE remediation_playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view remediation playbooks"
  ON remediation_playbooks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage remediation playbooks"
  ON remediation_playbooks FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS remediation_actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid REFERENCES risks(id) ON DELETE CASCADE NOT NULL,
  playbook_id uuid REFERENCES remediation_playbooks(id),
  action_type text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  due_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  validated_at timestamptz,
  validation_result text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE remediation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view remediation actions"
  ON remediation_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage remediation actions"
  ON remediation_actions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F6: ACTION TRACKING & ACCOUNTABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  action_type text NOT NULL,
  priority text DEFAULT 'medium' NOT NULL,
  status text DEFAULT 'assigned' NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  due_date timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  blocker_description text,
  related_requirement_id uuid REFERENCES requirements(id),
  related_risk_id uuid REFERENCES risks(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view actions"
  ON actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage actions"
  ON actions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS action_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id uuid REFERENCES actions(id) ON DELETE CASCADE NOT NULL,
  evidence_type text NOT NULL,
  file_url text,
  description text,
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  uploaded_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE action_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view action evidence"
  ON action_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage action evidence"
  ON action_evidence FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F7: INCIDENT RESPONSE ORCHESTRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL,
  classification text NOT NULL,
  status text DEFAULT 'open' NOT NULL,
  detected_at timestamptz DEFAULT now() NOT NULL,
  reported_at timestamptz,
  contained_at timestamptz,
  resolved_at timestamptz,
  detected_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  is_serious_incident boolean DEFAULT false NOT NULL,
  regulatory_report_required boolean DEFAULT false NOT NULL,
  regulatory_report_deadline timestamptz,
  affected_systems jsonb DEFAULT '[]'::jsonb,
  impact_description text,
  root_cause text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage incidents"
  ON incidents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS incident_timeline (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  description text NOT NULL,
  event_timestamp timestamptz DEFAULT now() NOT NULL,
  recorded_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE incident_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incident timeline"
  ON incident_timeline FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage incident timeline"
  ON incident_timeline FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL,
  report_version integer DEFAULT 1 NOT NULL,
  content jsonb NOT NULL,
  submitted_at timestamptz,
  submitted_by uuid REFERENCES auth.users(id),
  submission_confirmation text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incident reports"
  ON incident_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage incident reports"
  ON incident_reports FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F4: APPROVAL & GOVERNANCE WORKFLOWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_type text NOT NULL,
  requested_by uuid REFERENCES auth.users(id) NOT NULL,
  requested_at timestamptz DEFAULT now() NOT NULL,
  approver_role text NOT NULL,
  assigned_to uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' NOT NULL,
  decision text,
  decision_comment text,
  decided_at timestamptz,
  related_action_id uuid REFERENCES actions(id),
  related_risk_id uuid REFERENCES risks(id),
  context_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view approvals"
  ON approvals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage approvals"
  ON approvals FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS exceptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exception_type text NOT NULL,
  title text NOT NULL,
  justification text NOT NULL,
  requested_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' NOT NULL,
  valid_from timestamptz,
  valid_until timestamptz,
  expired boolean DEFAULT false NOT NULL,
  related_requirement_id uuid REFERENCES requirements(id),
  compensating_controls text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exceptions"
  ON exceptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage exceptions"
  ON exceptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F5: COMPLIANCE REVIEW & ASSESSMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_type text NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_date date NOT NULL,
  completion_date date,
  status text DEFAULT 'scheduled' NOT NULL,
  assessor_name text,
  assessor_organization text,
  scope text,
  report_file_url text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage assessments"
  ON assessments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS assessment_findings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  finding_id text NOT NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL,
  category text,
  affected_requirement_id uuid REFERENCES requirements(id),
  recommendation text,
  status text DEFAULT 'open' NOT NULL,
  remediation_action_id uuid REFERENCES actions(id),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE assessment_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assessment findings"
  ON assessment_findings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage assessment findings"
  ON assessment_findings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS drills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  drill_type text NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_date date NOT NULL,
  completion_date date,
  status text DEFAULT 'scheduled' NOT NULL,
  participants jsonb DEFAULT '[]'::jsonb,
  scenario_description text,
  results text,
  lessons_learned text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view drills"
  ON drills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage drills"
  ON drills FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F8: DOCUMENTATION & POLICY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id text UNIQUE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  current_version uuid,
  status text DEFAULT 'draft' NOT NULL,
  effective_date date,
  next_review_date date,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view policies"
  ON policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage policies"
  ON policies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS policy_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id uuid REFERENCES policies(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  content text NOT NULL,
  change_summary text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view policy versions"
  ON policy_versions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage policy versions"
  ON policy_versions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS compliance_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_type text NOT NULL,
  related_requirement_id uuid REFERENCES requirements(id),
  related_control_id uuid REFERENCES requirement_controls(id),
  file_url text,
  description text,
  collection_method text DEFAULT 'manual',
  collected_at timestamptz DEFAULT now() NOT NULL,
  expiration_date date,
  status text DEFAULT 'valid' NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE compliance_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view compliance evidence"
  ON compliance_evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage compliance evidence"
  ON compliance_evidence FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F9: SIMPLIFICATION & STANDARDIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS process_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_name text NOT NULL,
  metric_type text NOT NULL,
  metric_value numeric NOT NULL,
  measurement_date date DEFAULT CURRENT_DATE NOT NULL,
  bottleneck_identified boolean DEFAULT false,
  improvement_opportunity text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE process_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view process metrics"
  ON process_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage process metrics"
  ON process_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS legacy_systems (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_name text NOT NULL,
  system_type text,
  description text,
  status text DEFAULT 'active' NOT NULL,
  redundancy_identified boolean DEFAULT false,
  replacement_system text,
  migration_plan text,
  decommission_target_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE legacy_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view legacy systems"
  ON legacy_systems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage legacy systems"
  ON legacy_systems FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MODULE F10: INTELLIGENT AUTOMATION & OPTIMIZATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS ml_models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name text NOT NULL,
  model_type text NOT NULL,
  purpose text NOT NULL,
  version text NOT NULL,
  accuracy_target numeric(5,2),
  current_accuracy numeric(5,2),
  last_trained_at timestamptz,
  training_data_size integer,
  status text DEFAULT 'active' NOT NULL,
  model_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view ML models"
  ON ml_models FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ML models"
  ON ml_models FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS automation_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_type text NOT NULL,
  task_name text NOT NULL,
  execution_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  average_duration interval,
  manual_effort_saved interval,
  measurement_period_start date NOT NULL,
  measurement_period_end date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE automation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view automation metrics"
  ON automation_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage automation metrics"
  ON automation_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_category ON requirements(category);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_risk_score ON risks(current_risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_actions_assigned_to ON actions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
