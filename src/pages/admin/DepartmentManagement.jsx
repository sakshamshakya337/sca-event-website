import { useState, useEffect } from 'react'
import { Pencil, Trash2, ShieldAlert, Plus, Users, Building2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../config/axios'
import useAuthStore from '../../store/authStore'
import PageWrapper from '../../components/layout/PageWrapper'

export default function DepartmentManagement() {
  const { user } = useAuthStore()
  const [departments, setDepartments] = useState([])
  const [facultyList, setFacultyList] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isHodModalOpen, setIsHodModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  const [currentDept, setCurrentDept] = useState(null)
  
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    status: 'active'
  })
  
  const [hodFormData, setHodFormData] = useState({
    hodIds: []
  })

  useEffect(() => {
    fetchDepartments()
    fetchFaculty()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/departments')
      setDepartments(response.data.data)
    } catch (error) {
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/users/faculty')
      setFacultyList(response.data.data)
    } catch (error) {
      toast.error('Failed to load faculty list')
    }
  }

  const handleOpenDeptModal = (dept = null) => {
    setCurrentDept(dept)
    if (dept) {
      setFormData({
        departmentName: dept.departmentName,
        departmentCode: dept.departmentCode,
        status: dept.status
      })
    } else {
      setFormData({
        departmentName: '',
        departmentCode: '',
        status: 'active'
      })
    }
    setIsDeptModalOpen(true)
  }

  const handleOpenHodModal = (dept) => {
    setCurrentDept(dept)
    setHodFormData({ hodIds: dept.hodIds?.map(h => h._id) || [] })
    setIsHodModalOpen(true)
  }
  
  const handleOpenDeleteModal = (dept) => {
    setCurrentDept(dept)
    setIsDeleteModalOpen(true)
  }

  const handleSaveDept = async () => {
    try {
      if (!formData.departmentName || !formData.departmentCode) {
        return toast.error('Name and Code are required')
      }

      if (currentDept) {
        await api.put(`/departments/${currentDept._id}`, formData)
        toast.success('Department updated successfully')
      } else {
        await api.post('/departments', formData)
        toast.success('Department created successfully')
      }
      
      setIsDeptModalOpen(false)
      fetchDepartments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department')
    }
  }

  const handleAssignHod = async () => {
    try {
      await api.put(`/departments/${currentDept._id}/assign-hods`, {
        hodIds: hodFormData.hodIds
      })
      
      toast.success('HOD assigned successfully')
      setIsHodModalOpen(false)
      fetchDepartments()
      fetchFaculty() // Refresh faculty to reflect role changes
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign HOD')
    }
  }

  const handleDeleteDept = async () => {
    try {
      await api.delete(`/departments/${currentDept._id}`)
      toast.success('Department deleted successfully')
      setIsDeleteModalOpen(false)
      fetchDepartments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department')
    }
  }

  if (user?.role !== 'superadmin' && user?.role !== 'admin') {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center h-96">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-gray-500 mt-2">Only Super Admins can manage departments.</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-headline-lg text-on-surface">Departments Management</h1>
            <p className="text-body-md text-on-surface-variant mt-1">Create and manage departments and assign HODs.</p>
          </div>
          <button 
            onClick={() => handleOpenDeptModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-btn hover:opacity-90 transition-all font-body-md active:scale-95 shadow-md"
          >
            <Plus className="h-4 w-4" /> Add Department
          </button>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Department Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Assigned HOD</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Loading departments...
                    </td>
                  </tr>
                ) : departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      No departments found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 text-body-md font-semibold text-on-surface">{dept.departmentName}</td>
                      <td className="px-6 py-4">
                        <span className="font-code-sm text-code-sm bg-surface-container px-2 py-1 rounded text-primary">{dept.departmentCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        {dept.hodIds && dept.hodIds.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {dept.hodIds.map(hod => (
                              <div key={hod._id} className="flex flex-col">
                                <span className="text-body-md font-medium text-primary">{hod.firstName} {hod.lastName}</span>
                                <span className="text-body-sm text-on-surface-variant">{hod.officialEmail}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-body-md text-error/80 italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${dept.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {dept.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          className="px-3 py-1 border border-outline-variant text-primary text-sm font-semibold rounded-lg hover:bg-surface-container transition-all"
                          onClick={() => handleOpenHodModal(dept)}
                        >
                          Assign HOD
                        </button>
                        <button 
                          className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container"
                          onClick={() => handleOpenDeptModal(dept)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error/10"
                          onClick={() => handleOpenDeleteModal(dept)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Department Modal */}
        {isDeptModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
                <h2 className="text-headline-md text-primary">{currentDept ? 'Edit Department' : 'Add New Department'}</h2>
                <button onClick={() => setIsDeptModalOpen(false)} className="p-1 hover:bg-surface-container rounded-full">
                  <X className="text-on-surface-variant" size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-headline-sm text-primary">Department Name</label>
                  <input 
                    placeholder="e.g. Computer Science" 
                    value={formData.departmentName}
                    onChange={e => setFormData({ ...formData, departmentName: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-headline-sm text-primary">Department Code</label>
                  <input 
                    placeholder="e.g. CSE" 
                    value={formData.departmentCode}
                    onChange={e => setFormData({ ...formData, departmentCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant bg-surface-container grid grid-cols-2 gap-4">
                <button onClick={() => setIsDeptModalOpen(false)} className="px-6 py-3 border border-outline-variant rounded-lg text-body-md font-bold text-primary hover:bg-surface-container-high">
                  Cancel
                </button>
                <button onClick={handleSaveDept} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-body-md font-bold hover:shadow-lg hover:opacity-90">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign HOD Modal */}
        {isHodModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
                <h2 className="text-headline-md text-primary">Assign Head of Department</h2>
                <button onClick={() => setIsHodModalOpen(false)} className="p-1 hover:bg-surface-container rounded-full">
                  <X className="text-on-surface-variant" size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-body-sm text-on-surface-variant">
                  Assign a faculty member as the HOD for {currentDept?.departmentName} ({currentDept?.departmentCode}). 
                  They will automatically be granted the HOD role.
                </p>
                <div className="space-y-2">
                  <label className="block text-headline-sm text-primary">Select Faculty Members (Hold Ctrl/Cmd to select multiple)</label>
                  <select 
                    multiple
                    size={5}
                    value={hodFormData.hodIds} 
                    onChange={(e) => {
                      const options = [...e.target.selectedOptions]
                      const values = options.map(option => option.value)
                      setHodFormData({ hodIds: values })
                    }}
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none"
                  >
                    {facultyList.map(faculty => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.firstName} {faculty.lastName} ({faculty.officialEmail})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant bg-surface-container grid grid-cols-2 gap-4">
                <button onClick={() => setIsHodModalOpen(false)} className="px-6 py-3 border border-outline-variant rounded-lg text-body-md font-bold text-primary hover:bg-surface-container-high">
                  Cancel
                </button>
                <button onClick={handleAssignHod} className="px-6 py-3 bg-primary text-on-primary rounded-lg text-body-md font-bold hover:shadow-lg hover:opacity-90">
                  Assign HOD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-primary/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
                <h2 className="text-headline-md text-error">Delete Department</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-1 hover:bg-surface-container rounded-full">
                  <X className="text-on-surface-variant" size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-body-sm text-on-surface-variant">
                  Are you sure you want to delete the department "{currentDept?.departmentName}"? 
                  This action cannot be undone. You can only delete departments that have no faculty assigned.
                </p>
              </div>
              <div className="p-6 border-t border-outline-variant bg-surface-container grid grid-cols-2 gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-3 border border-outline-variant rounded-lg text-body-md font-bold text-primary hover:bg-surface-container-high">
                  Cancel
                </button>
                <button onClick={handleDeleteDept} className="px-6 py-3 bg-error text-white rounded-lg text-body-md font-bold hover:shadow-lg hover:opacity-90">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
