import React, { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdSearch, MdRefresh, MdChevronLeft, MdChevronRight, MdMarkEmailUnread, MdTaskAlt, MdTimer, MdTrendingUp, MdDownload, MdCheckCircle } from 'react-icons/md'
import useAdminQueriesStore from '../../store/adminQueriesStore'

const statusLabelMap = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const displayStatus = (status) => statusLabelMap[status] || status

export default function ContactQueries() {
  const { queries, fetchQueries, isLoading, markAsRead, markAsReplied } = useAdminQueriesStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

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
              <MdDownload size={20} />
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
                <MdMarkEmailUnread className="text-blue-700" size={28} />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Resolution Rate</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">{Math.round((queries.filter(q => q.status === 'resolved').length / queries.length) * 100) || 0}%</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <MdTaskAlt className="text-green-700" size={28} />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Avg Response Time</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">4.2h</h3>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <MdTimer className="text-orange-700" size={28} />
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-outline-variant rounded-xl p-6 flex items-start justify-between stat-card-shadow">
              <div>
                <p className="text-body-sm font-medium text-on-surface-variant uppercase tracking-wider">Query Volume (WoW)</p>
                <h3 className="text-headline-lg text-[28px] mt-2 text-primary">+12%</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <MdTrendingUp className="text-purple-700" size={28} />
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl flex items-center flex-wrap gap-4 border border-outline-variant">
            <div className="relative flex-1 min-w-[200px]">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
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
              <MdRefresh size={20} />
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
                  <tr key={query.id} className={`hover:bg-surface-container-low transition-colors ${query.status === 'pending' ? 'bg-primary/5' : ''}`}>
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
                        {query.status === 'pending' && (
                          <button 
                            onClick={() => markAsRead(query.id)}
                            className="px-4 py-1.5 border border-primary text-primary rounded-lg text-body-sm font-semibold hover:bg-primary/10 transition-all"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {query.status === 'in_progress' && (
                          <button 
                            onClick={() => markAsReplied(query.id)}
                            className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-body-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                          >
                            Mark Resolved <MdCheckCircle size={16} />
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
    </PageWrapper>
  )
}
