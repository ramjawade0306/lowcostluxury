'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAdminAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch {
          return {};
        }
      })
      .then(setSettings)
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success('Saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 rounded-xl" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={save} className="card p-6 max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">COD Enabled</label>
          <select
            value={settings.cod_enabled ?? 'true'}
            onChange={(e) => setSettings((s) => ({ ...s, cod_enabled: e.target.value }))}
            className="input"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
          <input
            type="number"
            value={settings.delivery_charge ?? '49'}
            onChange={(e) => setSettings((s) => ({ ...s, delivery_charge: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <input
            value={settings.whatsapp_number ?? ''}
            onChange={(e) => setSettings((s) => ({ ...s, whatsapp_number: e.target.value }))}
            className="input"
            placeholder="919876543210"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
