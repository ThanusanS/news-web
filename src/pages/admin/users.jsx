import { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiShield } from 'react-icons/fi';

const DEMO_USERS = [
  { id: '1', name: 'Nimal Perera',    email: 'nimal@ceylonupdates.com',    role: 'Admin',  posts: 84,  status: 'active',  joined: '2025-01-01' },
  { id: '2', name: 'Kasun Silva',     email: 'kasun@ceylonupdates.com',    role: 'Editor', posts: 63,  status: 'active',  joined: '2025-02-15' },
  { id: '3', name: 'Priya Mendis',    email: 'priya@ceylonupdates.com',    role: 'Author', posts: 42,  status: 'active',  joined: '2025-03-10' },
  { id: '4', name: 'Ravi De Silva',   email: 'ravi@ceylonupdates.com',     role: 'Author', posts: 28,  status: 'active',  joined: '2025-04-20' },
  { id: '5', name: 'Thilini W.',      email: 'thilini@ceylonupdates.com',  role: 'Author', posts: 19,  status: 'inactive', joined: '2025-05-01' },
];

const ROLE_COLORS = {
  Admin:  'bg-red-100 text-red-700',
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
    setUsers((prev) => [...prev, { ...newUser, id: Date.now().toString(), posts: 0, status: 'active', joined: new Date().toISOString().split('T')[0] }]);
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
      <Head><title>Users | CeylonUpdates Admin</title></Head>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-4 text-sm text-stone-500 dark:text-neutral-500">
          <span>{users.filter((u) => u.status === 'active').length} active</span>
          <span>{users.filter((u) => u.role === 'Admin').length} admins</span>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={14} /> Invite User
        </button>
      </div>

      {/* Role permissions info */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { role: 'Admin', perms: 'Full access: publish, edit, delete, manage users, settings', color: 'border-red-200 bg-red-50 dark:bg-red-950/20' },
          { role: 'Editor', perms: 'Can publish & edit all posts, moderate comments', color: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' },
          { role: 'Author', perms: 'Can create & edit own posts, submit for review', color: 'border-green-200 bg-green-50 dark:bg-green-950/20' },
        ].map((r) => (
          <div key={r.role} className={`border rounded-xl p-3 ${r.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <FiShield size={13} className="text-stone-500" />
              <span className="font-semibold text-sm">{r.role}</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-neutral-500">{r.perms}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-neutral-800 text-xs text-stone-500 dark:text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Posts</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-neutral-100">{u.name}</p>
                        <p className="text-xs text-stone-400 dark:text-neutral-600">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${ROLE_COLORS[u.role]}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500">{u.posts}</td>
                  <td className="px-4 py-3 text-stone-500 dark:text-neutral-500 text-xs">{u.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toast.success('Edit user — connect to Appwrite Auth to implement.')} className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-neutral-700 text-stone-400 hover:text-accent transition-colors"><FiEdit2 size={13} /></button>
                      <button onClick={() => removeUser(u.id)} className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"><FiTrash2 size={13} /></button>
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-700 p-6 w-full max-w-md shadow-xl">
            <h2 className="font-head font-bold text-lg mb-4">Invite New User</h2>
            <form onSubmit={addUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">Full Name</label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))} className="form-input" required />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">Email Address</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))} className="form-input" required />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-wider text-stone-500 uppercase mb-1.5">Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))} className="form-input">
                  <option>Author</option>
                  <option>Editor</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 btn-primary py-2.5">Send Invite →</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
