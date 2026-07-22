import React, { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import { Plus, Image as ImageIcon, Trash2, X, UploadCloud } from 'lucide-react'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import TiptapEditor from '../../components/TiptapEditor'

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingGalleryId, setEditingGalleryId] = useState(null)

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [imageUrls, setImageUrls] = useState(['', '', '']) // Start with 3 empty slots

  useEffect(() => {
    fetchGalleries()
  }, [currentPage])

  const fetchGalleries = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/galleries?all=true&page=${currentPage}&limit=9`)
      setGalleries(res.data.data.galleries)
      setTotalPages(res.data.data.pagination.pages)
    } catch (error) {
      toast.error('Failed to fetch galleries')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
  }

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, ''])
  }

  const removeImageUrlField = (index) => {
    const newUrls = [...imageUrls]
    newUrls.splice(index, 1)
    setImageUrls(newUrls)
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setStartDate('')
    setEndDate('')
    setBannerFile(null)
    setBannerPreview(null)
    setImageUrls(['', '', ''])
    setEditingGalleryId(null)
    setIsModalOpen(false)
  }

  const handleEdit = (gallery) => {
    setEditingGalleryId(gallery._id)
    setTitle(gallery.title)
    setContent(gallery.content || '')
    setStartDate(gallery.startDate ? new Date(gallery.startDate).toISOString().split('T')[0] : '')
    setEndDate(gallery.endDate ? new Date(gallery.endDate).toISOString().split('T')[0] : '')
    setBannerPreview(gallery.bannerImage)
    setBannerFile(null) // It's an existing image, user can upload a new one to replace it
    
    // Setup existing external URLs
    const urls = gallery.images && gallery.images.length > 0 ? [...gallery.images] : ['']
    setImageUrls(urls)
    
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !content || !startDate || !endDate || (!bannerFile && !bannerPreview)) {
      toast.error('Please fill all required fields and ensure a banner image is present')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('content', content)
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)
      if (bannerFile) {
        formData.append('image', bannerFile)
      } else if (editingGalleryId && bannerPreview) {
        // If not uploading a new file but keeping the old one, send the URL or omit so the backend keeps it
        formData.append('bannerImage', bannerPreview)
      }
      
      // Filter out empty URLs and append
      const validUrls = imageUrls.filter(url => url.trim() !== '')
      validUrls.forEach(url => {
        formData.append('images[]', url.trim())
      })

      if (editingGalleryId) {
        await api.put(`/galleries/${editingGalleryId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Gallery updated successfully!')
      } else {
        await api.post('/galleries', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Gallery created successfully!')
      }
      
      resetForm()
      fetchGalleries()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create gallery')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery?')) return
    
    try {
      await api.delete(`/galleries/${id}`)
      toast.success('Gallery deleted')
      fetchGalleries()
    } catch (error) {
      toast.error('Failed to delete gallery')
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-primary">Manage Galleries</h2>
            <p className="text-on-surface-variant font-body-md mt-1">Create and manage image albums for the public gallery.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-btn font-headline-sm hover:opacity-90 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} />
            <span>New Gallery</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-surface-container rounded-2xl h-64 border border-outline-variant"></div>
            ))}
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-20 bg-surface-container rounded-2xl border border-outline-variant border-dashed">
            <ImageIcon size={48} className="mx-auto text-on-surface-variant/50 mb-4" />
            <h3 className="text-xl font-bold text-on-surface mb-2">No galleries found</h3>
            <p className="text-on-surface-variant">Click the button above to create your first image gallery.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map(gallery => (
                <div key={gallery._id} className="bg-surface rounded-2xl border border-outline-variant overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group">
                  <div className="h-48 overflow-hidden relative">
                    <img src={gallery.bannerImage} alt={gallery.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                        {gallery.images?.length || 0} Images
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${
                        gallery.status === 'published' ? 'bg-green-500/90 text-white' :
                        gallery.status === 'rejected' ? 'bg-red-500/90 text-white' :
                        gallery.status?.startsWith('pending') ? 'bg-amber-500/90 text-white' :
                        'bg-gray-500/90 text-white'
                      }`}>
                        {gallery.status === 'published' ? 'Published' :
                         gallery.status === 'pending_hod' ? 'Pending HOD' :
                         gallery.status === 'pending_hos' ? 'Pending HOS' :
                         gallery.status === 'rejected' ? 'Rejected' : 'Draft'}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-on-surface line-clamp-1">{gallery.title}</h3>
                    <div 
                      className="text-on-surface-variant text-sm mt-2 line-clamp-2 flex-1 prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: gallery.content || '' }}
                    />
                    <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant font-medium">
                        {gallery.startDate ? `${new Date(gallery.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${gallery.endDate && gallery.endDate !== gallery.startDate ? ` - ${new Date(gallery.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}` : new Date(gallery.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(gallery)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-semibold"
                          title="Edit Gallery"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(gallery._id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Delete Gallery"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-full font-bold transition-colors ${
                      currentPage === page 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container hover:bg-surface-variant text-on-surface'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Gallery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm}></div>
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-on-surface">{editingGalleryId ? 'Edit Gallery' : 'Create New Gallery'}</h2>
              <button onClick={resetForm} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="gallery-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm">1</span>
                    Basic Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1">Gallery Title *</label>
                    <input 
                      type="text" 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      placeholder="e.g. Innotek 2026 Highlight Reel"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-sm font-bold text-on-surface">Content *</label>
                    </div>
                    <TiptapEditor 
                      content={content} 
                      onChange={setContent} 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-1">Event Start Date *</label>
                      <input 
                        type="date" 
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-1">Event End Date *</label>
                      <input 
                        type="date" 
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm">2</span>
                    Banner Image (Cloudinary Upload) *
                  </h3>
                  
                  <label className="block border-2 border-dashed border-outline-variant rounded-xl p-6 hover:bg-surface-container transition-colors cursor-pointer text-center relative overflow-hidden group">
                    <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                    {bannerPreview ? (
                      <div className="absolute inset-0">
                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white font-bold flex items-center gap-2"><UploadCloud size={20} /> Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                          <ImageIcon size={32} />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">Click to upload banner image</p>
                          <p className="text-sm text-on-surface-variant mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                <div className="space-y-4 pt-4 border-t border-outline-variant">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-primary flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm">3</span>
                      Additional Image URLs
                    </h3>
                    <button 
                      type="button" 
                      onClick={addImageUrlField}
                      className="text-sm font-bold text-secondary flex items-center gap-1 hover:bg-secondary/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={16} /> Add Another URL
                    </button>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">Paste URLs from ImageBB, Cloudinary, etc.</p>
                  
                  <div className="space-y-3">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          placeholder={`Image URL ${index + 1}`}
                          className="flex-1 h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                        />
                        {imageUrls.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeImageUrlField(index)}
                            className="p-3 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 shrink-0 bg-surface-container-lowest rounded-b-2xl">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container rounded-btn transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="gallery-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-btn font-bold shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : editingGalleryId ? (
                  'Update Gallery'
                ) : (
                  'Create Gallery'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  )
}
