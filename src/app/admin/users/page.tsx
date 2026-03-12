'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';

type User = { id: string; name: string; email: string; phone?: string; createdAt: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAdminAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const text = await r.text();
        if (!text) return [];
        try {
          return JSON.parse(text);
        } catch {
          return [];
        }
      })
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-64 bg-accent/5 rounded-xl" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent/[0.02]">
            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.phone || '-'}</td>
                <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
