import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import api from '../../config/axios'
import { Image as ImageIcon, ChevronRight } from 'lucide-react'

// Skeleton for loading state
const GallerySkeleton = () => (
  <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm animate-pulse">
    <div className="w-full h-56 bg-surface-container"></div>
    <div className="p-6 space-y-3">
      <div className="h-6 bg-surface-container rounded-md w-3/4"></div>
      <div className="h-4 bg-surface-container rounded-md w-full"></div>
      <div className="h-4 bg-surface-container rounded-md w-5/6"></div>
      <div className="h-4 bg-surface-container rounded-md w-1/4 mt-4"></div>
    </div>
  </div>
)

export default function Gallery() {
  const [galleries, setGalleries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchGalleries(currentPage)
  }, [currentPage])

  const fetchGalleries = async (page) => {
    setIsLoading(true)
    try {
      const res = await api.get(`/galleries?page=${page}&limit=9`)
      setGalleries(res.data.data.galleries)
      setTotalPages(res.data.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch galleries', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-primary pt-32 pb-20 px-6 text-on-primary text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-[800px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-bold backdrop-blur-md mb-6">
            <ImageIcon size={16} /> Image Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline-lg mb-6 leading-tight">
            Capturing the best moments at SCA
          </h1>
          <p className="text-lg md:text-xl text-on-primary/90 font-body-lg">
            Explore photos from our latest events, workshops, and ceremonies.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-[1200px] mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <GallerySkeleton key={i} />)}
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon size={64} className="mx-auto text-on-surface-variant/30 mb-4" />
              <h2 className="text-2xl font-bold text-on-surface">No galleries available</h2>
              <p className="text-on-surface-variant mt-2">Check back later for event photos.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleries.map(gallery => (
                  <Link 
                    key={gallery._id} 
                    to={`/gallery/${gallery._id}`}
                    className="bg-surface rounded-2xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={gallery.bannerImage} 
                        alt={gallery.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <span className="text-white font-bold text-sm bg-primary/90 px-3 py-1 rounded-full backdrop-blur-md">
                          View Album
                        </span>
                        <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                          {gallery.images?.length || 0} Photos
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-1 group-hover:text-primary transition-colors">{gallery.title}</h3>
                      <div 
                        className="text-on-surface-variant text-sm line-clamp-2 flex-1 prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: gallery.content || '' }}
                      />
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/50">
                        <span className="text-on-surface-variant/80 font-medium text-sm">
                          {gallery.startDate ? `${new Date(gallery.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${gallery.endDate && gallery.endDate !== gallery.startDate ? ` - ${new Date(gallery.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}` : new Date(gallery.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-primary flex items-center group-hover:translate-x-1 transition-transform text-sm font-bold">
                          Explore <ChevronRight size={16} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-full font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-primary text-on-primary shadow-md scale-110' 
                          : 'bg-surface hover:bg-surface-container-high text-on-surface border border-outline-variant hover:scale-105'
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
      </section>
    </PublicLayout>
  )
}
