import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client' // Your Better Auth configuration hook
import { requireAdminRoute } from '@/lib/admin-route-guard'
import { Plus, Edit2, Trash2, Shield, User as UserIcon, X } from 'lucide-react'

export const Route = createFileRoute('/admin/users')({
  beforeLoad: requireAdminRoute,
  component: UsersPage,
})

type Role = 'user' | 'admin'

interface UserRecord {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

function UsersPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [formData, setFormData] = useState<{ name: string; email: string; password: string; role: Role }>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })

  // 1. FETCH Dir Directory List
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users'], // Added page dependency to query boundary
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: { limit: 50 },
      })
      if (res.error) throw new Error(res.error.message)
      return res.data
    }
  })

  // 2. CREATE USER MUTATION
  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await authClient.admin.createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role
      })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      closeAndResetModal()
    },
  })

  // 3. EDIT ROLE/INFO MUTATION
  const setRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: Role }) => {
      const res = await authClient.admin.setRole({
        userId: userId,
        role: newRole
      })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  })

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) throw new Error('No user selected for update')

      // Better Auth: POST `/admin/update-user` with body { userId, data }
      const updateRes = await authClient.admin.updateUser({
        userId: editingUser.id,
        data: {
          name: formData.name,
          email: formData.email,
        },
      })
      if (updateRes.error) throw new Error(updateRes.error.message)

      // Only update role if it changed in the modal.
      if (editingUser.role !== formData.role) {
        const roleRes = await authClient.admin.setRole({
          userId: editingUser.id,
          role: formData.role,
        })
        if (roleRes.error) throw new Error(roleRes.error.message)
      }

      // Optional: POST `/admin/set-user-password` if password is provided
      if (formData.password.trim()) {
        const passwordRes = await authClient.admin.setUserPassword({
          userId: editingUser.id,
          newPassword: formData.password.trim(),
        })
        if (passwordRes.error) throw new Error(passwordRes.error.message)
      }

      return updateRes.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      closeAndResetModal()
    },
  })

  // 4. DELETE MUTATION
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await authClient.admin.removeUser({ userId })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  })

  const closeAndResetModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'user' })
  }

  const anyError = createUserMutation.error ?? updateUserMutation.error ?? setRoleMutation.error ?? deleteUserMutation.error

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#445412]/10 pb-6">
        <div>
          <h1 className="font-fraunces font-black text-4xl text-[#445412]">User Management</h1>
          <p className="text-sm text-stone-500 mt-1">Provision staff accounts and manage access roles.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#445412] hover:bg-[#3a4810] text-[#fbf0d8] px-5 h-10 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Staff Account
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-stone-400 text-sm">Loading users...</p>
      ) : (
        <div className="bg-white border border-[#445412]/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#445412]/5 border-b border-[#445412]/10 text-[10px] font-bold uppercase tracking-widest text-[#445412]/60">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {usersData?.users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fbf0d8]/40 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#445412]/10 flex items-center justify-center text-[#445412] font-bold text-sm flex-shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="block font-semibold text-stone-800">{user.name}</span>
                      <span className="block text-xs text-stone-400">{user.email}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-3.5 h-3.5 ${user.role === 'admin' ? 'text-amber-500' : 'text-stone-300'}`} />
                      <select
                        value={user.role}
                        onChange={(e) => setRoleMutation.mutate({ userId: user.id, newRole: e.target.value as Role })}
                        className="bg-transparent border border-stone-200 rounded-lg px-2 py-1 text-xs font-medium outline-none focus:border-[#445412] transition-colors"
                      >
                        <option value="user">User</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingUser(user as unknown as UserRecord)
                          setFormData({ name: user.name, email: user.email, password: '', role: user.role as Role })
                          setIsModalOpen(true)
                        }}
                        className="p-2 rounded-lg text-stone-400 hover:text-[#445412] hover:bg-[#445412]/10 transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Permanently delete this user?')) deleteUserMutation.mutate(user.id) }}
                        className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-[#445412]/10 overflow-hidden">
            {/* Modal header */}
            <div className="bg-[#445412] px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="font-fraunces font-black text-lg text-[#fbf0d8]">
                  {editingUser ? 'Edit Staff Account' : 'New Staff Account'}
                </h2>
                <p className="text-xs text-[#fbf0d8]/60 mt-0.5">
                  {editingUser ? 'Update account details below.' : 'Fill in the new staff details.'}
                </p>
              </div>
              <button onClick={closeAndResetModal} className="text-[#fbf0d8]/50 hover:text-[#fbf0d8] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (editingUser) updateUserMutation.mutate()
                else createUserMutation.mutate()
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#445412] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#445412] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#445412] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full border border-stone-200 rounded-lg h-10 px-3 text-sm outline-none focus:border-[#445412] transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {anyError ? (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {anyError instanceof Error ? anyError.message : 'Something went wrong.'}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="px-4 h-10 border border-stone-200 rounded-lg text-sm font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-5 h-10 bg-[#445412] hover:bg-[#3a4810] text-[#fbf0d8] font-bold rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {createUserMutation.isPending
                    ? 'Creating...'
                    : updateUserMutation.isPending
                      ? 'Saving...'
                      : editingUser
                        ? 'Save Changes'
                        : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
