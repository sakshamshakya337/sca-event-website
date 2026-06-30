import React, { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdSearch, MdFilterList, MdEdit, MdDelete, MdDownload, MdPerson, MdPersonAdd, MdClose, MdExpandMore, MdContentCopy } from 'react-icons/md'
import useAdminUserStore from '../../store/adminUserStore'

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export default function ManageUsers() {
  const [activeTab, setActiveTab] = useState('All')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formData, setFormData] = useState({
    role: 'faculty',
    firstName: '',
    lastName: '',
    personalEmail: '',
    officialEmail: '',
    phone: '',
    registrationNumber: '',
    program: '',
    degree: '',
    semester: '',
    section: '',
    employeeId: '',
    department: '',
    designation: ''
  })
  const [tempPassword, setTempPassword] = useState('')
  const [mustChangePassword, setMustChangePassword] = useState(true)
  const { users, fetchUsers, addUser, deleteUser, loading } = useAdminUserStore()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAddUser = async () => {
    try {
      const res = await addUser(formData)
      setTempPassword(res.data.tempPassword)
      alert(`User created! Temporary password: ${res.data.tempPassword}`)
      setDrawerOpen(false)
      setFormData({
        role: 'faculty',
        firstName: '',
        lastName: '',
        personalEmail: '',
        officialEmail: '',
        phone: '',
        registrationNumber: '',
        program: '',
        degree: '',
        semester: '',
        section: '',
        employeeId: '',
        department: '',
        designation: ''
      })
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredUsers = users.filter(user => {
    if (activeTab === 'All') return true
    if (activeTab === 'Faculty') return user.role === 'faculty'
    if (activeTab === 'Students') return user.role === 'student'
    return true
  })

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-headline-lg text-on-surface">Manage Users</h2>
            <p className="text-body-md text-on-surface-variant">View and manage faculty and student accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface text-body-md font-semibold rounded-lg hover:bg-surface-container transition-all">
              <MdDownload size={20} />
              Export Data
            </button>
            <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white text-body-md font-semibold rounded-lg hover:bg-opacity-90 transition-all active:scale-95">
              <MdPersonAdd size={20} />
              Add New User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container border border-outline-variant p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-body-sm font-semibold uppercase tracking-wider">Total Users</span>
              <MdPerson className="text-secondary" size={20} />
            </div>
            <div className="text-[32px] font-bold text-on-surface">{users.length}</div>
          </div>
          <div className="bg-surface-container border border-outline-variant p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-body-sm font-semibold uppercase tracking-wider">Faculty</span>
              <MdPerson className="text-secondary" size={20} />
            </div>
            <div className="text-[32px] font-bold text-on-surface">{users.filter(u => u.role === 'faculty').length}</div>
          </div>
          <div className="bg-surface-container border border-outline-variant p-6 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-on-surface-variant text-body-sm font-semibold uppercase tracking-wider">Students</span>
              <MdPerson className="text-secondary" size={20} />
            </div>
            <div className="text-[32px] font-bold text-on-surface">{users.filter(u => u.role === 'student').length}</div>
          </div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="flex items-center gap-8 border-b border-outline-variant px-6 py-4">
            <button
              onClick={() => setActiveTab('All')}
              className={`py-2 border-b-2 ${activeTab === 'All' ? 'border-secondary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary transition-all font-semibold'}`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab('Faculty')}
              className={`py-2 border-b-2 ${activeTab === 'Faculty' ? 'border-secondary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary transition-all font-semibold'}`}
            >
              Faculty
            </button>
            <button
              onClick={() => setActiveTab('Students')}
              className={`py-2 border-b-2 ${activeTab === 'Students' ? 'border-secondary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary transition-all font-semibold'}`}
            >
              Students
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Department</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white text-sm font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-body-md font-semibold text-on-surface">{user.firstName} {user.lastName}</p>
                          <p className="text-body-sm text-on-surface-variant">{user.personalEmail || user.officialEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-code-sm text-code-sm bg-surface-container px-2 py-1 rounded text-primary">{user.registrationNumber || user.employeeId || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{user.department || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-body-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container">
                          <MdEdit size={18} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error/10"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-[2px] z-40" onClick={() => setDrawerOpen(false)}></div>
          {/* Right Drawer */}
          <div className="fixed top-0 right-0 h-full w-[420px] bg-surface-container-lowest z-50 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
              <h2 className="text-headline-md text-primary">Create New User</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1 hover:bg-surface-container rounded-full">
                <MdClose className="text-on-surface-variant" size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Role Selection */}
              <section className="space-y-3">
                <label className="block text-headline-sm text-primary">Select Role</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, role: 'faculty' })}
                    className={`px-6 py-2 rounded-full border-2 font-semibold text-body-md ${
                      formData.role === 'faculty'
                        ? 'bg-primary-container text-on-primary-container border-primary-container'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    Faculty
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className={`px-6 py-2 rounded-full border-2 font-semibold text-body-md ${
                      formData.role === 'student'
                        ? 'bg-primary-container text-on-primary-container border-primary-container'
                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    Student
                  </button>
                </div>
              </section>

              {/* Input Fields */}
              <section className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-headline-sm text-primary">First Name</label>
                    <input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-headline-sm text-primary">Last Name</label>
                    <input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-headline-sm text-primary">Personal Email</label>
                  <input
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-headline-sm text-primary">Phone</label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  />
                </div>

                {formData.role === 'faculty' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Official Email</label>
                      <input
                        value={formData.officialEmail}
                        onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Employee ID</label>
                      <input
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md appearance-none focus:ring-2 focus:ring-secondary/20 outline-none"
                      >
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Designation</label>
                      <input
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                  </>
                )}

                {formData.role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Registration Number</label>
                      <input
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Program</label>
                      <input
                        value={formData.program}
                        onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-headline-sm text-primary">Degree</label>
                      <input
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-headline-sm text-primary">Semester</label>
                        <input
                          value={formData.semester}
                          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-headline-sm text-primary">Section</label>
                        <input
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                          className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest grid grid-cols-2 gap-4">
              <button onClick={() => setDrawerOpen(false)} className="px-6 py-3 border border-outline-variant rounded-lg text-body-md font-bold text-primary hover:bg-surface-container">
                Cancel
              </button>
              <button onClick={handleAddUser} className="px-6 py-3 bg-secondary text-white rounded-lg text-body-md font-bold hover:shadow-lg hover:shadow-secondary/20">
                Create User Account
              </button>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  )
}
