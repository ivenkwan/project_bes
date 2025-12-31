import { MainLayout } from '../../components/layout/MainLayout';

export default function RequirementsModule() {
  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Requirements Management</h1>
        <p className="mt-2 text-sm text-secondary-600">
          Track all 28 HK CI Bill technology requirements
        </p>
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <p className="text-secondary-600">Module implementation in progress...</p>
        </div>
      </div>
    </MainLayout>
  );
}
