import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import type { AdminUser } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

type RoleFilter = '' | 'student' | 'counselor' | 'admin';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [role, setRole] = useState<RoleFilter>('');
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [newStatus, setNewStatus] = useState<'active' | 'suspended' | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers', role],
    queryFn: () => adminApi.users(role || undefined),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      setTargetUser(null);
      setNewStatus(null);
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Users</h1>
        <p className="text-gray-500">Manage platform users.</p>
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { value: '', label: 'All' },
          { value: 'student', label: 'Students' },
          { value: 'counselor', label: 'Counsellors' },
          { value: 'admin', label: 'Admins' },
        ] as { value: RoleFilter; label: string }[]).map(f => (
          <button
            key={f.value}
            onClick={() => setRole(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              role === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Joined</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(users ?? []).map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{u.full_name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.role === 'admin' ? 'blue' : u.role === 'counselor' ? 'yellow' : 'green'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.status === 'active' ? 'green' : 'red'}>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.status === 'active' ? 'danger' : 'primary'}
                          size="sm"
                          onClick={() => { setTargetUser(u); setNewStatus(u.status === 'active' ? 'suspended' : 'active'); }}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {(users ?? []).length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!targetUser && !!newStatus}
        onClose={() => { setTargetUser(null); setNewStatus(null); }}
        title={newStatus === 'suspended' ? 'Suspend User' : 'Reactivate User'}
      >
        <div className="text-center space-y-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to <strong>{newStatus === 'suspended' ? 'suspend' : 'reactivate'}</strong>{' '}
            <strong>{targetUser?.full_name}</strong>?
            {newStatus === 'suspended' && ' They will no longer be able to log in.'}
          </p>
          {mutation.isError && <p className="text-sm text-red-500">{mutation.error?.message}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setTargetUser(null); setNewStatus(null); }}>Cancel</Button>
            <Button
              variant={newStatus === 'suspended' ? 'danger' : 'primary'}
              className="flex-1"
              loading={mutation.isPending}
              onClick={() => targetUser && newStatus && mutation.mutate({ id: targetUser.id, status: newStatus })}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
