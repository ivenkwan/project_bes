import { MainLayout } from '../../components/layout/MainLayout';

export default function WorkflowModule() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Workflow Orchestration</h1>
        <p className="mt-2 text-sm text-secondary-600">
          BPMN 2.0 workflow modeling and execution engine
        </p>
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <p className="text-secondary-600">Module implementation in progress...</p>
        </div>
      </div>
    </MainLayout>
  );
}
