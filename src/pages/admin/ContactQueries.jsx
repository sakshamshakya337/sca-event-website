import React, { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { Search, RefreshCw, ChevronLeft, ChevronRight, MailOpen, ClipboardCheck, Timer, TrendingUp, Download, CheckCircle2, Eye, X } from 'lucide-react'
import useAdminQueriesStore from '../../store/adminQueriesStore'

const statusLabelMap = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const displayStatus = (status) => statusLabelMap[status] || status

export default function ContactQueries() {
  const { queries, fetchQueries, isLoading, markAsRead, markAsReplied, replyToQuery } = useAdminQueriesStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    setReplyText('')
  }, [selectedQuery])

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    setIsReplying(true)
    try {
      const updated = await replyToQuery(selectedQuery.id, replyText)
      setSelectedQuery(updated)
      setReplyText('')
    } catch (err) {
      alert(err.message || 'Failed to send reply')
    } finally {
      setIsReplying(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [fetchQueries])

  const filteredQueries = queries.filter(query => {
    const matchesSearch = 
      query.name.toLowerCase().includes(search.toLowerCase()) || 
      query.subject.toLowerCase().includes(search.toLowerCase())
    const queryStatusLabel = displayStatus(query.status)
    const matchesStatus = statusFilter === 'All' || queryStatusLabel === statusFilter
    const matchesCategory = categoryFilter === 'All' || query.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <PageWrapper>
      <div className="max-w-[1440px] mx-auto space-y-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-primary">Inbound Inquiries</h2>
              <p className="text-on-surface-variant font-body-md mt-1">Manage and respond to student, faculty, and stakeholder queries.</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant rounded-lg text-primary font-headline-sm hover:bg-surface-container transition-all">
              <Download size={20} />
              <span>Export Data</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">New Queries</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{queries.filter(q => q.status === 'pending').length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <MailOpen className="text-blue-700" size={28} />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Resolution Rate</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{Math.round((queries.filter(q => q.status === 'resolved').length / queries.length) * 100) || 0}%</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <ClipboardCheck className="text-green-700" size={28} />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Avg Response Time</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">4.2h</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Timer className="text-orange-700" size={28} />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Query Volume (WoW)</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">+12%</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="text-purple-700" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl flex items-center flex-wrap gap-4 border border-outline-variant">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input
                className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                placeholder="Search by name or subject..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-48">
              <select 
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <div className="w-48">
              <select 
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option>All</option>
                <option>Event Query</option>
                <option>Technical Issue</option>
                <option>Registration Dispute</option>
                <option>Feedback</option>
              </select>
            </div>
            <button className="bg-white border border-outline-variant p-2 rounded-lg text-on-surface-variant hover:text-primary hover:border-primary transition-all">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F1F5F9] border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-sm font-bold text-on-surface text-body-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredQueries.map((query, index) => (
                  <tr 
                    key={query.id} 
                    onClick={() => setSelectedQuery(query)}
                    className={`cursor-pointer hover:bg-surface-container-low transition-colors ${query.status === 'pending' ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-6 py-4 text-body-md font-semibold text-secondary">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-body-md font-semibold text-primary">{query.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-code-sm text-code-sm bg-surface-container-high px-2 py-1 rounded">{query.universityId}</span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface">{query.category}</td>
                    <td className="px-6 py-4 text-body-md text-on-surface">{query.subject}</td>
                    <td className="px-6 py-4 text-body-md text-on-surface-variant">{query.date}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-outline-variant/20 w-fit ${
                        query.status === 'pending' ? 'text-secondary' : 'text-on-surface-variant'
                      }`}>
                        {query.status === 'pending' && <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>}
                        <span className="text-body-sm font-bold">{displayStatus(query.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedQuery(query); }}
                          className="px-3 py-1.5 border border-outline-variant text-on-surface-variant rounded-lg text-body-sm font-semibold hover:bg-surface-container transition-all flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={16} /> View
                        </button>
                        {query.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); markAsRead(query.id); }}
                            className="px-4 py-1.5 border border-primary text-primary rounded-lg text-body-sm font-semibold hover:bg-primary/10 transition-all"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {query.status === 'in_progress' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); markAsReplied(query.id); }}
                            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                          >
                            Mark Resolved <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedQuery(null)}></div>
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-on-surface">Query Details</h2>
              <button onClick={() => setSelectedQuery(null)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">From</h3>
                <p className="text-lg font-bold text-on-surface">{selectedQuery.name} <span className="text-sm font-normal text-on-surface-variant ml-2">({selectedQuery.email})</span></p>
                <p className="text-sm text-on-surface-variant mt-1">ID: {selectedQuery.universityId} • Role: {selectedQuery.role || 'Student'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-y border-outline-variant py-4">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Category</h3>
                  <p className="font-medium text-on-surface">{selectedQuery.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Date Received</h3>
                  <p className="font-medium text-on-surface">{selectedQuery.date}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Subject</h3>
                <p className="text-lg font-bold text-primary">{selectedQuery.subject}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">Message</h3>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant whitespace-pre-wrap text-on-surface">
                  {selectedQuery.message}
                </div>
              </div>

              {selectedQuery.status === 'resolved' ? (
                <div className="border-t border-outline-variant pt-4 space-y-2">
                  <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Admin Response</h3>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-on-surface">
                    <p className="whitespace-pre-wrap">{selectedQuery.response}</p>
                    {selectedQuery.resolvedAt && (
                      <p className="text-xs text-on-surface-variant mt-2 font-medium">
                        Resolved on {new Date(selectedQuery.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-outline-variant pt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Write Reply (Sends Email)</h3>
                  <textarea
                    className="w-full min-h-[120px] bg-white border border-outline-variant rounded-xl p-3 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none placeholder:text-on-surface-variant/50 resize-y"
                    placeholder="Write your email reply to the user..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={isReplying}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendReply}
                      disabled={isReplying || !replyText.trim()}
                      className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isReplying ? 'Sending...' : 'Send Email & Resolve'}
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 shrink-0 bg-surface">
              <button 
                onClick={() => setSelectedQuery(null)}
                className="px-6 py-2.5 border border-outline-variant text-on-surface font-bold rounded-btn hover:bg-surface-container transition-all active:scale-95"
              >
                Close
              </button>
              {selectedQuery.status === 'pending' && (
                <button 
                  onClick={() => {
                    markAsRead(selectedQuery.id)
                    setSelectedQuery(null)
                  }}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-btn font-bold shadow-md hover:opacity-90 transition-all active:scale-95"
                >
                  Mark In Progress
                </button>
              )}
              {selectedQuery.status === 'in_progress' && (
                <button 
                  onClick={() => {
                    markAsReplied(selectedQuery.id)
                    setSelectedQuery(null)
                  }}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-btn font-bold shadow-md hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  Mark Resolved <CheckCircle2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
