import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'
import api from '../../config/axios'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

// Skeleton for loading an image
const ImageSkeleton = () => (
  <div className="bg-surface-container rounded-xl overflow-hidden aspect-video animate-pulse"></div>
)

export default function GalleryDetail() {
  const { id } = useParams()
  const [gallery, setGallery] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    fetchGallery()
  }, [id])

  const fetchGallery = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/galleries/${id}`)
      setGallery(res.data.data)
    } catch (error) {
      console.error('Failed to fetch gallery', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Combine banner and additional images for the full grid
  const allImages = gallery ? [gallery.bannerImage, ...(gallery.images || [])] : []

  const handleNext = (e) => {
    e.stopPropagation()
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return
      if (e.key === 'ArrowRight') handleNext(e)
      if (e.key === 'ArrowLeft') handlePrev(e)
      if (e.key === 'Escape') setSelectedImageIndex(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageIndex, allImages.length])

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-6">
          
          <Link to="/gallery" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold mb-8 transition-colors">
            <ArrowLeft size={20} /> Back to Galleries
          </Link>

          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-12 bg-surface-container w-2/3 md:w-1/3 rounded-lg"></div>
              <div className="h-6 bg-surface-container w-full md:w-1/2 rounded-lg"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                {[...Array(8)].map((_, i) => <ImageSkeleton key={i} />)}
              </div>
            </div>
          ) : !gallery ? (
            <div className="text-center py-32">
              <ImageIcon size={64} className="mx-auto text-on-surface-variant/30 mb-4" />
              <h2 className="text-2xl font-bold text-on-surface">Gallery not found</h2>
              <p className="text-on-surface-variant mt-2">The album you are looking for doesn't exist or was removed.</p>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="mb-8 text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-headline-lg text-primary mb-4">{gallery.title}</h1>
                
                <div className="flex items-center justify-center gap-4 mb-8 text-sm font-bold text-on-surface-variant bg-surface-container inline-flex px-4 py-2 rounded-lg mx-auto">
                  <span className="text-on-surface-variant font-medium">
                    {gallery.startDate ? `${new Date(gallery.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${gallery.endDate && gallery.endDate !== gallery.startDate ? ` - ${new Date(gallery.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}` : new Date(gallery.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                  <span>{allImages.length} Photos</span>
                </div>
              </div>

              {/* Images Grid - Moved to top & Centered */}
              <div className="mb-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
                {allImages.map((src, index) => (
                  <div 
                    key={index} 
                    className="relative group rounded-2xl overflow-hidden cursor-zoom-in aspect-[4/3] w-full bg-surface-container-lowest border border-outline-variant shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={src} 
                      alt={`${gallery.title} - Image ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                ))}
              </div>

              {/* Blog Content - Centered */}
              <div className="max-w-4xl mx-auto bg-surface p-8 md:p-12 rounded-[2rem] border border-outline-variant shadow-lg mb-12">
                <div 
                  className="text-lg md:text-xl leading-relaxed text-on-surface-variant prose prose-lg prose-headings:text-primary prose-a:text-primary max-w-none text-center mx-auto"
                  dangerouslySetInnerHTML={{ __html: gallery.content || '' }}
                />
              </div>
            </>
          )}

        </div>
      </div>

      {/* Lightbox / Modal for full screen image view */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedImageIndex(null)
            }}
          >
            <ArrowLeft size={32} className="rotate-45" />
            <span className="sr-only">Close</span>
          </button>
          
          {allImages.length > 1 && (
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 rounded-full hover:bg-white/10 transition-colors z-10"
              onClick={handlePrev}
            >
              <ArrowLeft size={36} />
              <span className="sr-only">Previous</span>
            </button>
          )}

          <img 
            src={allImages[selectedImageIndex]} 
            alt="Expanded view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()} 
          />

          {allImages.length > 1 && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4 rounded-full hover:bg-white/10 transition-colors z-10"
              onClick={handleNext}
            >
              <ArrowLeft size={36} className="rotate-180" />
              <span className="sr-only">Next</span>
            </button>
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-bold bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
            {selectedImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
