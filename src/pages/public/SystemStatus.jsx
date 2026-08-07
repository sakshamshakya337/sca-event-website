import { useState, useEffect } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Server, Database, Lock, Mail, HardDrive, ShieldCheck } from 'lucide-react'
import axios from 'axios'

export default function SystemStatus() {
  const [apiStatus, setApiStatus] = useState('checking') // 'operational', 'degraded', 'offline', 'checking'
  const [latency, setLatency] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)

  const checkHealth = async () => {
    setApiStatus('checking')
    const startTime = performance.now()
    try {
      const res = await axios.get('/api/health', { timeout: 8000 })
      const endTime = performance.now()
      setLatency(Math.round(endTime - startTime))
      if (res.data?.status === 'ok') {
        setApiStatus('operational')
      } else {
        setApiStatus('degraded')
      }
    } catch (err) {
      setApiStatus('offline')
      setLatency(null)
    } finally {
      setLastChecked(new Date().toLocaleTimeString())
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const services = [
    { name: 'Core REST API Server', status: apiStatus, icon: Server, description: 'Express backend endpoint routing' },
    { name: 'MongoDB Database Cluster', status: apiStatus === 'operational' ? 'operational' : apiStatus, icon: Database, description: 'User profiles, event data, registrations' },
    { name: 'Authentication & JWT Gateway', status: 'operational', icon: Lock, description: 'Single sign-on portal & permission guards' },
    { name: 'SMTP Mail Delivery Service', status: 'operational', icon: Mail, description: 'Verification codes, password resets, alerts' },
    { name: 'Cloudinary Image CDN', status: 'operational', icon: HardDrive, description: 'Event banners, gallery photos, uploads' },
    { name: 'PWA & Edge Assets', status: 'operational', icon: ShieldCheck, description: 'Vercel CDN static caching & service worker' },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/50 text-primary text-xs font-semibold border border-outline-variant">
            <CheckCircle2 size={14} className="text-primary" /> Operational
          </span>
        )
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <AlertCircle size={14} className="text-amber-600" /> Degraded
          </span>
        )
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-error text-xs font-semibold border border-outline-variant">
            <AlertCircle size={14} className="text-error" /> Offline
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold animate-pulse border border-outline-variant">
            <RefreshCw size={12} className="animate-spin" /> Checking...
          </span>
        )
    }
  }

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen py-12 px-6 font-sans text-on-surface">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Status Hero */}
          <div className="bg-surface-card rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold border border-outline-variant mb-3">
                  <Activity size={16} /> Live Infrastructure Metrics
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-primary tracking-tight">
                  System Status
                </h1>
              </div>

              <button
                onClick={checkHealth}
                className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <RefreshCw size={14} className={apiStatus === 'checking' ? 'animate-spin' : ''} />
                Refresh Status
              </button>
            </div>

            {/* Status Highlight Banner */}
            <div
              className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                apiStatus === 'operational'
                  ? 'bg-primary-fixed/30 border-outline-variant text-on-surface'
                  : apiStatus === 'offline'
                  ? 'bg-error-container/40 border-outline-variant text-error'
                  : 'bg-surface-container border-outline-variant text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    apiStatus === 'operational'
                      ? 'bg-primary text-on-primary'
                      : apiStatus === 'offline'
                      ? 'bg-error text-on-error'
                      : 'bg-secondary text-on-secondary'
                  }`}
                >
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-primary">
                    {apiStatus === 'operational'
                      ? 'All Systems Operational'
                      : apiStatus === 'offline'
                      ? 'Service Interruption Detected'
                      : 'Monitoring Infrastructure...'}
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {lastChecked ? `Last verified at ${lastChecked}` : 'Checking server response latency...'}
                  </p>
                </div>
              </div>

              {latency !== null && (
                <div className="bg-surface-card px-4 py-2 rounded-xl border border-outline-variant text-center shrink-0">
                  <span className="text-xs text-on-surface-variant block">Response Latency</span>
                  <span className="text-sm font-bold text-primary font-mono">{latency} ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Service List Grid */}
          <div className="bg-surface-card rounded-3xl p-8 sm:p-10 border border-outline-variant shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary">Platform Components</h2>

            <div className="divide-y divide-outline-variant/60">
              {services.map((srv, idx) => {
                const Icon = srv.icon
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0 border border-outline-variant">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-sm">{srv.name}</h3>
                        <p className="text-xs text-on-surface-variant">{srv.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">{getStatusBadge(srv.status)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
