import { useState } from 'react'
import { Pencil, Save, Eye, EyeOff, CheckCircle, X, ChevronRight, ChevronDown, Info, UserCircle, Mail } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'

export default function Profile() {
  const [showToast, setShowToast] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const handleSave = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  return (
    <PageWrapper>
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border-l-4 border-green-500 p-4 rounded shadow-lg">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-semibold text-on-surface">Profile updated successfully!</p>
            <p className="text-sm text-on-surface-variant">Changes saved to your account.</p>
          </div>
          <button onClick={() => setShowToast(false)} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-headline-lg text-headline-lg text-primary">System Administrator Profile</h2>
        <p className="text-body-md text-on-surface-variant">Manage your institutional identity and security credentials.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px]">
        {/* Left Panel */}
        <div className="w-full md:w-[30%] bg-primary-container p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative mt-8">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-[#BE185D] flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-extrabold tracking-tighter">SA</span>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-headline-md font-semibold text-white">Superadmin</h3>
            <div className="inline-flex items-center px-3 py-1 bg-[#FCE7F3] text-[#9D174D] rounded-full text-[12px] font-bold uppercase tracking-wider">
              Superadmin
            </div>
          </div>
          <div className="pt-4 w-full border-t border-white/10 space-y-3">
            <div className="flex flex-col items-center">
              <span className="font-code-sm text-code-sm text-[#93C5FD]">sca@admin.lpu</span>
              <span className="text-[11px] text-white/50 uppercase font-bold mt-1 tracking-widest">Primary Identity</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-body-md text-white/70">System Account</span>
              <span className="text-[11px] text-white/50 uppercase font-bold mt-1 tracking-widest">Entity Type</span>
            </div>
          </div>
          <div className="mt-auto pb-4">
            <div className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">
              LPU Environment v4.2.0
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-[70%] bg-white p-6 flex flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            {/* Account Information */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <h4 className="text-headline-sm text-primary flex items-center gap-2">
                  <UserCircle className="text-secondary" />
                  Account Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Display Name</label>
                  <input
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-body-md"
                    type="text"
                    value="SCA Administrator"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-body-sm font-semibold text-on-surface-variant">System Role</label>
                  <input
                    className="w-full h-10 px-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface-variant text-body-md cursor-not-allowed"
                    readOnly
                    type="text"
                    value="Superadmin"
                  />
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-surface-container-low rounded-lg border border-outline-variant/30">
                <Info className="text-outline text-[20px]" />
                <p className="text-body-sm text-on-surface-variant">
                  System role cannot be modified from this interface. Contact LPU Registrar for global policy changes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                <h4 className="text-headline-sm text-primary flex items-center gap-2">
                  <ContactMail className="text-secondary" />
                  Contact Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Admin Mail</label>
                  <input
                    className="w-full h-10 px-3 bg-surface-container border border-outline-variant rounded-lg font-code-sm text-code-sm text-on-surface-variant cursor-not-allowed"
                    readOnly
                    type="text"
                    value="sca@admin.lpu"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-body-sm font-semibold text-on-surface-variant">Recovery Mail</label>
                  <input
                    className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-body-md"
                    type="email"
                    value="backup-admin@lpu.edu.in"
                  />
                </div>
              </div>
            </section>

            {/* Info Box */}
            <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] border-l-4 border-l-[#2563EB] rounded-lg">
              <h5 className="text-headline-sm text-[#1E40AF] mb-1">Superadmin Account</h5>
              <p className="text-body-sm text-[#1E40AF]">
                This account possesses unrestricted access to all modules within the SCA CalendarDays Management System. Actions performed here are logged for institutional auditing purposes.
              </p>
            </div>

            {/* Password Section */}
            <section className="pt-2">
              <button
                className="flex items-center gap-2 text-primary font-bold text-body-md hover:text-secondary transition-colors"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                {showPasswordSection ? <ChevronDown /> : <ChevronRight />}
                Change Password
              </button>
              {showPasswordSection && (
                <div className="mt-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface-variant">Current Password</label>
                      <div className="relative">
                        <input
                          className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-body-md"
                          placeholder="••••••••"
                          type={showCurrentPassword ? 'text' : 'password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-body-sm font-semibold text-on-surface-variant">New Password</label>
                      <div className="relative">
                        <input
                          className="w-full h-10 px-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-body-md"
                          placeholder="••••••••"
                          type={showNewPassword ? 'text' : 'password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-secondary text-white text-body-sm font-bold rounded-lg hover:bg-primary transition-all">
                    Update Password
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-6 border-t border-outline-variant flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-secondary text-white font-bold rounded-lg hover:bg-[#1D4ED8] shadow-sm hover:shadow active:scale-95 transition-all text-body-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
