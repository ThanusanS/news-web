import { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiShield } from 'react-icons/fi';

const DEMO_USERS = [
  {
    id: '1',
    name: 'Nimal Perera',
    email: 'nimal@ceylonupdates.me',
    role: 'Admin',
    posts: 84,
    status: 'active',
    joined: '2025-01-01',
  },
  {
    id: '2',
    name: 'Kasun Silva',
    email: 'kasun@ceylonupdates.me',
    role: 'Editor',
    posts: 63,
    status: 'active',
    joined: '2025-02-15',
  },
  {
    id: '3',
    name: 'Priya Mendis',
    email: 'priya@ceylonupdates.me',
    role: 'Author',
    posts: 42,
    status: 'active',
    joined: '2025-03-10',
  },
  {
    id: '4',
    name: 'Ravi De Silva',
    email: 'ravi@ceylonupdates.me',
    role: 'Author',
    posts: 28,
    status: 'active',
    joined: '2025-04-20',
  },
  {
    id: '5',
    name: 'Thilini W.',
    email: 'thilini@ceylonupdates.me',
    role: 'Author',
    posts: 19,
    status: 'inactive',
    joined: '2025-05-01',
  },
];

const ROLE_COLORS = {
  Admin: 'bg-red-100 text-red-700',
  Editor: 'bg-blue-100 text-blue-700',
  Author: 'bg-green-100 text-green-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Author' });

  function addUser(e) {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers((prev) => [
      ...prev,
      {
        ...newUser,
        id: Date.now().toString(),
        posts: 0,
        status: 'active',
        joined: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowModal(false);
    setNewUser({ name: '', email: '', role: 'Author' });
    toast.success('User invited! They will receive an email to set their password.');
  }

  function removeUser(id) {
    if (!confirm('Remove this user? Their articles will remain.')) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('User removed.');
  }

  return (
    <AdminLayout title="Users" description="Manage your editorial team and their permissions.">
      <Head>
        <title>Users | CeylonUpdates Admin</title>
      </Head>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-4 text-sm text-stone-500 dark:text-neutral-500">
          <span>{users.filter((u) => u.status === 'active').length} active</span>
          <span>{users.filter((u) => u.role === 'Admin').length} admins</span>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={14} /> Invite User
        </button>
      </div>

      {/* Role permissions info */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          {
            role: 'Admin',
            perms: 'Full access: publish, edit, delete, manage users, settings',
            color: 'border-red-200 bg-red-50 dark:bg-red-950/20',
          },
          {
            role: 'Editor',
            perms: 'Can publish & edit all posts, moderate comments',
            color: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
          },
          {
            role: 'Author',
            perms: 'Can create & edit own posts, submit for review',
            color: 'border-green-200 bg-green-50 dark:bg-green-950/20',
          },
        ].map((r) => (
          <div key={r.role} className={`rounded-xl border p-3 ${r.color}`}>
            <div className="mb-1 flex items-center gap-2">
              <FiShield size={13} className="text-stone-500" />
              <span className="text-sm font-semibold">{r.role}</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-neutral-500">{r.perms}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-500 dark:bg-neutral-800 dark:text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Posts</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-stone-50 dark:hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-orange-400 text-xs font-bold text-white">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-neutral-100">{u.name}</p>
                        <p className="text-xs text-stone-400 dark:text-neutral-600">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-bold ${ROLE_COLORS[u.role]}`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500">{u.posts}</td>
                  <td className="px-4 py-3 text-xs text-stone-500 dark:text-neutral-500">
                    {u.joined}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}
                    >
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          toast.success('Edit user — connect to Appwrite Auth to implement.')
                        }
                        className="rounded p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-accent dark:hover:bg-neutral-700"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => removeUser(u.id)}
                        className="rounded p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="mb-4 font-head text-lg font-bold">Invite New User</h2>
            <form onSubmit={addUser} className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
                  className="form-input"
                >
                  <option>Author</option>
                  <option>Editor</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 py-2.5">
                  Send Invite →
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
