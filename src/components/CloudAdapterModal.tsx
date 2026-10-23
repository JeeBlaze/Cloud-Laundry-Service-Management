import React, { useState } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  FileCode,
  Download,
  Upload,
  RefreshCw,
  Key,
  Shield,
  Server,
  Layers,
} from 'lucide-react';
import { storageService, AppConfig } from '../services/storageService';

interface CloudAdapterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudAdapterModal: React.FC<CloudAdapterModalProps> = ({ isOpen, onClose }) => {
  const config = storageService.getConfig();
  const [adapterMode, setAdapterMode] = useState<AppConfig['adapterMode']>(config.adapterMode);
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [projectId, setProjectId] = useState(config.projectId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    storageService.updateConfig({
      adapterMode,
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      firebaseConfigured: Boolean(projectId.trim() && apiKey.trim()),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDownloadJSON = () => {
    const jsonStr = storageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloud-laundry-database-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csvStr = storageService.exportOrdersCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloud-laundry-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-900">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Cloud Architecture & Adapter Hub</h2>
              <p className="text-xs text-slate-500">
                Firestore Schema Validation & High-Performance Persistence Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Active Mode Notice */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  Development Cloud Simulator (Active & Reactive)
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  The application is fully persistent in LocalStorage with real Firestore collection structures, atomic
                  transaction semantics, multi-tenant isolation (PureWash Co. vs. Aura Clean), role-based access
                  policies, and complete audit logging. No live external Firebase credentials required to run.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 mb-2">
              Operational Adapter Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdapterMode('development_adapter')}
                className={`p-3 text-left border rounded-lg transition-colors flex flex-col justify-between ${
                  adapterMode === 'development_adapter'
                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900">Development Simulator</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Preloaded with 18 orders, 8 services, 6 roles, live inventory alerts, and instant local persistence.
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-emerald-700 font-medium">✓ Zero Network Lag & Instant Offline</div>
              </button>

              <button
                type="button"
                onClick={() => setAdapterMode('live_firebase')}
                className={`p-3 text-left border rounded-lg transition-colors flex flex-col justify-between ${
                  adapterMode === 'live_firebase'
                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900">Live Firebase & Firestore</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Connect an external Google Cloud / Firebase project for production synchronization and Cloud Storage.
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 font-medium">External Cloud Config</div>
              </button>
            </div>
          </div>

          {/* Firebase Configuration Inputs if selected */}
          {adapterMode === 'live_firebase' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-700" />
                Firebase Project Settings
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. cloud-laundry-prod-9402"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-hidden focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Web API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-hidden focus:border-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Note: When running in development, client credentials remain isolated to your session.
              </p>
            </div>
          )}

          {/* Data Export & Backup Tools */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">Data Management & Audit Export</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-slate-700 font-medium text-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export DB (JSON)
              </button>

              <button
                onClick={handleDownloadCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-slate-700 font-medium text-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export Orders (CSV)
              </button>

              <button
                onClick={() => {
                  storageService.resetToDefaults();
                  onClose();
                }}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors font-medium text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Schema Specifications info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Firestore Collections Mapped:</div>
            <div className="text-slate-500 font-mono text-[10px] leading-relaxed">
              users · businesses · branches · services · orders · orderStatusHistory · deliveryJobs · staffMemberships · inventory · inventoryMovements · supportTickets · coupons · subscriptionPlans · auditLogs
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Settings saved successfully
              </span>
            ) : (
              'Changes are instantly applied'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-white"
            >
              Close
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-1.5 text-xs font-medium text-white bg-black hover:bg-slate-800 rounded-md shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
