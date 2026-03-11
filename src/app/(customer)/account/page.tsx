'use client';

import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="card p-6 max-w-md">
      <h2 className="font-bold mb-4">Profile</h2>
      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-500 block">Name</span>
          <span className="font-medium">{user.name}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Email</span>
          <span className="font-medium">{user.email}</span>
        </div>
        {user.phone && (
          <div>
            <span className="text-gray-500 block">Phone</span>
            <span className="font-medium">{user.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
