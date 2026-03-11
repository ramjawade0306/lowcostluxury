'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const { token } = useAuth();

  const load = () => {
    fetch('/api/user/addresses', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setAddresses);
  };

  useEffect(() => {
    if (!token) return;
    load();
    setLoading(false);
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAddresses((prev) => [...prev, data]);
      setForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
      setShowForm(false);
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold">Saved Addresses</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Add Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="card p-6 space-y-4">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
            required
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input"
            required
          />
          <textarea
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="input"
            rows={2}
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="input"
              required
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              className="input"
              required
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
              className="input"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Save Address
          </button>
        </form>
      )}

      <div className="space-y-4">
        {addresses.map((a) => (
          <div key={a.id} className="card p-6">
            <div className="font-medium">{a.name} · {a.phone}</div>
            <div className="text-gray-600 text-sm mt-1">
              {a.address}, {a.city}, {a.state} - {a.pincode}
            </div>
            {a.isDefault && (
              <span className="inline-block mt-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Default</span>
            )}
          </div>
        ))}
        {addresses.length === 0 && !showForm && (
          <p className="text-gray-500">No addresses saved. Add one above.</p>
        )}
      </div>
    </div>
  );
}
