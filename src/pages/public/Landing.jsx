import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronDown, ShieldCheck, Calendar,
  CheckSquare, LogIn, ChevronLeft, ChevronRight, Play
} from 'lucide-react'
import api from '../../config/axios'
import { formatDate } from '../../lib/utils'
import PublicLayout from '../../components/layout/PublicLayout'
import useAuthStore from '../../store/authStore'

// ─────────────────────────────────────────────────────────────────────────────
// LAZY LOAD BACKGROUND IMAGE HOOK
// Uses Intersection Observer to load image only when element is in viewport
// ─────────────────────────────────────────────────────────────────────────────
function useLazyBgImage(imageSrc) {
  const ref = useRef(null)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !backgroundImage) {
            setIsLoading(true)
            // Preload image to ensure it's cached before setting as background
            const img = new Image()
            img.onload = () => {
              setBackgroundImage(`url('${imageSrc}')`)
              setIsLoading(false)
            }
            img.onerror = () => {
              setBackgroundImage(`url('${imageSrc}')`) // Set anyway if error
              setIsLoading(false)
            }
            img.src = imageSrc
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '100px' } // Start loading 100px before element is visible
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [imageSrc, backgroundImage])

  return { ref, backgroundImage, isLoading }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — change these two values only
// ─────────────────────────────────────────────────────────────────────────────

// Paste your YouTube video ID here (the part after ?v= in the URL)
// Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  'dQw4w9WgXcQ'
const YOUTUBE_ID = 'Phu9v6IUblw'

// Hero background carousel images
const CAROUSEL_SLIDES = [
  {
    src: 'https://res.cloudinary.com/amqo58is/image/upload/v1782934075/51e539c9-3500-49c1-878b-ff1ac476e49b_jsmcjj.jpg',
    label: 'School Commencement Ceremony',
    sub: 'School Dean is acknowledged students for their achievements and milestones',
  },
  {
    src: 'https://res.cloudinary.com/amqo58is/image/upload/v1782934082/IMG_2142.HEIC_hb79nq.jpg',
    label: 'LPU Experience 2026',
    sub: 'Welcoming new students to the university community',
  },
  {
    src: 'https://res.cloudinary.com/amqo58is/image/upload/v1782934081/IMG_0931_j9e7dk.jpg',
    label: 'LPU 9th Innotek Inter University Event',
    sub: 'Connecting students across departments and universities for collaboration',
  },
  {
    src: 'https://res.cloudinary.com/amqo58is/image/upload/v1782934087/IMG_1222.HEIC_n0nuhi.jpg',
    label: 'School Commencement Ceremony',
    sub: 'Celebrating student achievements and milestones',
  },
  {
    src: 'https://res.cloudinary.com/amqo58is/image/upload/v1782934088/IMG_9329.HEIC_xwzbug.jpg',
    label: 'Spectra',
    sub: 'Showcasing student talent through events',
  },
  {
    src: 'https://res.cloudinary.com/amqo58is/image/upload/v1783412602/IMG-2271_ez97uo.jpg',
    label: 'LPU Experience 2026',
    sub: 'Showcasing Projects for freshers',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// FULL BACKGROUND CAROUSEL
// Images fill entire hero behind text — dark overlay keeps text readable
// ─────────────────────────────────────────────────────────────────────────────
function FullBgCarousel({ children }) {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const total = CAROUSEL_SLIDES.length

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total])

  useEffect(() => {
    if (isHovered) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next, isHovered])

  return (
    <div
      className="relative min-h-[480px] sm:min-h-[560px] md:min-h-[640px] w-full overflow-hidden flex items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image slides */}
      {CAROUSEL_SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <img
            src={slide.src}
            alt={slide.label}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.src = 'https://res.cloudinary.com/amqo58is/image/upload/v1783408632/IMG-2271_1_optimized_3500_cd2fhf.jpg'
            }}
          />
        </div>
      ))}

      {/* Gradient overlay — stronger left (text area), lighter right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25 z-10" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/40 to-transparent z-10" />

      {/* Prev button */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full
                   bg-black/40 hover:bg-black/70 text-white flex items-center justify-center
                   backdrop-blur-sm border border-white/20 transition-all duration-200
                   opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Next button */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full
                   bg-black/40 hover:bg-black/70 text-white flex items-center justify-center
                   backdrop-blur-sm border border-white/20 transition-all duration-200
                   opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slide caption — bottom right */}
      <div className="absolute bottom-14 right-6 z-20 text-right pointer-events-none">
        <p className="text-white font-semibold text-sm drop-shadow">
          {CAROUSEL_SLIDES[current].label}
        </p>
        <p className="text-white/60 text-xs mt-0.5">
          {CAROUSEL_SLIDES[current].sub}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {CAROUSEL_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`rounded-full transition-all duration-300 ${idx === current
              ? 'w-6 h-2 bg-[#E87722]'
              : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-30">
        <div
          key={current}
          className="h-full bg-[#E87722] origin-left"
          style={{ animation: isHovered ? 'none' : 'progressBar 5s linear forwards' }}
        />
      </div>

      {/* Content sits on top */}
      <div className="relative z-20 w-full">{children}</div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// YOUTUBE VIDEO SECTION
// Interactive thumbnail → click to load and play the YouTube iframe
// Uses YouTube's privacy-enhanced mode (no tracking until play)
// ─────────────────────────────────────────────────────────────────────────────
function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  // YouTube thumbnail URL (highest quality)
  const thumbnailUrl = `https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`
  // Fallback if maxresdefault doesn't exist
  const thumbnailFallback = `https://img.youtube.com/vi/${YOUTUBE_ID}/hqdefault.jpg`

  // YouTube embed URL with autoplay + relevant params
  const embedUrl = [
    `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`,
    '?autoplay=1',        // auto-play when iframe loads
    '&rel=0',             // no related videos at end
    '&modestbranding=1',  // minimal YouTube branding
    '&color=white',       // white progress bar
    '&iv_load_policy=3',  // no annotations
    '&showinfo=0',        // no title bar
  ].join('')

  return (
    <section className="py-14 sm:py-20 bg-surface-container-low">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 space-y-3">
          <span className="text-[#E87722] font-mono text-xs tracking-widest uppercase
                           py-1 px-3 border border-[#E87722]/30 rounded-full inline-block">
            See It In Action
          </span>
          <h2 className="text-2xl sm:text-[32px] text-on-surface font-bold">
            SCA Events Walkthrough
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-sm sm:text-base px-4 sm:px-0">
            A quick walkthrough of how faculty, students and admins collaborate
            on events through the platform.
          </p>
        </div>

        {/* Video player card */}
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-xl sm:rounded-2xl overflow-hidden
                       shadow-[0_20px_60px_rgba(0,0,0,0.25)]
                       border border-outline-variant group"
            style={{ aspectRatio: '16/9' }}
          >
            {isPlaying ? (
              /* ── YouTube iframe — loads only after user clicks play ── */
              <iframe
                src={embedUrl}
                title="SCA EMS Introduction Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            ) : (
              /* ── Custom thumbnail + play button (before user clicks) ── */
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => setIsPlaying(true)}
                role="button"
                aria-label="Play SCA EMS introduction video"
              >
                {/* Thumbnail image */}
                <img
                  src={thumbnailUrl}
                  alt="SCA EMS video thumbnail"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = thumbnailFallback }}
                />

                {/* Dark overlay on thumbnail */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20
                                transition-colors duration-300" />

                {/* Top-left label */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-xs
                                   font-semibold px-3 py-1.5 rounded-full border border-white/20">
                    SCA Event Management System
                  </span>
                </div>

                {/* Center play button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-4">
                    {/* Outer ring pulse animation */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-[#E87722]/30
                                      animate-ping scale-110" />
                      <div className="relative w-20 h-20 rounded-full bg-[#E87722]
                                      hover:bg-[#C4611A] flex items-center justify-center
                                      shadow-[0_8px_32px_rgba(232,119,34,0.6)]
                                      transition-all duration-200 active:scale-95
                                      group-hover:scale-110">
                        <Play size={34} className="text-white ml-1.5" fill="white" />
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm drop-shadow-lg
                                  bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
                      Watch Introduction
                    </p>
                  </div>
                </div>

                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 z-10
                                bg-gradient-to-t from-black/80 to-transparent
                                px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">
                      SCA EMS — Platform Overview
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">
                      School of Computer Applications, LPU
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#E87722] animate-pulse" />
                    Click to play
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Below video — rewatch button + note */}
          {isPlaying && (
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setIsPlaying(false)}
                className="text-sm text-on-surface-variant hover:text-primary
                           flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft size={14} />
                Back to thumbnail
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${YOUTUBE_ID}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#E87722] hover:underline font-medium"
              >
                Open on YouTube ↗
              </a>
            </div>
          )}
        </div>

        
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Admin, Faculty, Student' },
            { icon: Calendar, label: 'Event Lifecycle', desc: 'Propose → Approve → Run' },
            { icon: CheckSquare, label: 'Task Tracking', desc: 'Real-time todo updates' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-surface-card border border-outline-variant
                         rounded-xl px-4 py-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-[#E87722]/10 flex items-center
                              justify-center text-[#E87722] shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { user } = useAuthStore()
  const [approvedEvents, setApprovedEvents] = useState([])
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState(null)
  
  const [galleries, setGalleries] = useState([])
  const [isGalleriesLoading, setIsGalleriesLoading] = useState(false)

  const howitWorksImage = useLazyBgImage('https://i.ibb.co/gZNKm5FB/1000049206.jpg')

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      setIsEventsLoading(true)
      setEventsError(null)
      try {
        const res = await api.get('/events/approved-events')
        setApprovedEvents(res.data.data)
      } catch (err) {
        setEventsError(err.response?.data?.message || 'Unable to load upcoming events')
      } finally {
        setIsEventsLoading(false)
      }
    }
    
    const fetchGalleries = async () => {
      setIsGalleriesLoading(true)
      try {
        const res = await api.get('/galleries?page=1&limit=3')
        setGalleries(res.data.data.galleries)
      } catch (err) {
        console.error('Unable to load galleries', err)
      } finally {
        setIsGalleriesLoading(false)
      }
    }
    
    fetchApprovedEvents()
    fetchGalleries()
  }, [])

  return (
    <PublicLayout>

      {/* ── HERO — Full background carousel with text overlay ── */}
      <FullBgCarousel>
        <div className="container mx-auto px-4 sm:px-6 pt-[60px]">
          <div className="max-w-2xl space-y-5 py-12 sm:py-16 md:py-24">

            <span className="text-[#E87722] font-mono text-xs tracking-widest uppercase
                             py-1 px-3 border border-[#E87722]/50 rounded-full inline-block">
              SCA EVENT MANAGEMENT SYSTEM
            </span>

            <h1 className="text-[32px] sm:text-[42px] md:text-[56px] leading-tight font-extrabold
                           text-white drop-shadow-lg">
              Manage Events. <br />
              <span className="text-[#F5A623]">Empower Students.</span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg max-w-lg leading-relaxed drop-shadow">
              A unified platform for the School of Computer Application at LPU —
              manage events, assign tasks, track progress across all roles.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
              {user ? (
                <Link
                  to="/portal"
                  className="bg-[#E87722] hover:bg-[#C4611A] text-white px-6 sm:px-8 py-3 sm:py-4
                             rounded-btn font-bold flex items-center gap-2
                             shadow-[0_4px_20px_rgba(232,119,34,0.5)]
                             transition-all active:scale-95 text-sm sm:text-base"
                >
                  Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  to="/portal"
                  className="bg-[#E87722] hover:bg-[#C4611A] text-white px-6 sm:px-8 py-3 sm:py-4
                             rounded-btn font-bold flex items-center gap-2
                             shadow-[0_4px_20px_rgba(232,119,34,0.5)]
                             transition-all active:scale-95 text-sm sm:text-base"
                >
                  Login
                  <ArrowRight size={18} />
                </Link>
              )}
              <Link
                to="/about"
                className="border-2 border-white/70 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-btn
                           font-bold hover:bg-white/10 transition-all flex items-center gap-2
                           backdrop-blur-sm active:scale-95 text-sm sm:text-base"
              >
                Learn More
                <ChevronDown size={16} />
              </Link>
            </div>

          </div>
        </div>
      </FullBgCarousel>

      {/* ── VIDEO SECTION ── */}
      <VideoSection />

      <section className="py-14 sm:py-24 bg-surface-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-[32px] text-on-surface font-bold">
                SCA Approved Events
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base mt-1">
                Only SCA approved events appear here with registration details and event imagery.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-on-surface-variant">
                {approvedEvents.length} approved event{approvedEvents.length === 1 ? '' : 's'}
              </div>
              <Link to="/events" className="text-sm text-primary font-medium hover:underline">
                View All Events →
              </Link>
            </div>
          </div>

          {isEventsLoading ? (
            <div className="rounded-card border border-dashed border-outline-variant
                            p-12 text-center text-on-surface-variant">
              Loading events…
            </div>
          ) : eventsError ? (
            <div className="rounded-card border border-error-container
                            bg-error-container p-12 text-center text-on-error-container">
              {eventsError}
            </div>
          ) : approvedEvents.length === 0 ? (
            <div className="rounded-card border border-dashed border-outline-variant
                            p-12 text-center text-on-surface-variant">
              No upcoming events are approved yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {approvedEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event.slug || event._id}`}
                  className="group flex flex-col"
                >
                  <article
                    className="overflow-hidden rounded-card border border-outline-variant
                               shadow-sm group-hover:shadow-card transition-all duration-300 bg-surface-card cursor-pointer flex flex-col flex-1"
                  >
                    <div className="overflow-hidden bg-surface-container-low h-48 relative">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex items-center justify-center text-center w-full h-full
                                      text-on-surface-variant px-4 py-10 group-hover:scale-105 transition-transform duration-500">
                          <div>
                            <p className="font-semibold text-sm">No image uploaded</p>
                            <p className="text-xs mt-1">This event was approved without a banner image.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="inline-flex rounded-full bg-primary-fixed
                                       text-on-primary-fixed px-3 py-1 text-xs font-semibold">
                          {event.type || 'Event'}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium">
                          {formatDate(event.startDate)}{event.endDate && event.endDate !== event.startDate ? ` - ${formatDate(event.endDate)}` : ''}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-on-surface mb-1.5 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                      <p className="text-on-surface-variant line-clamp-2 text-sm flex-1 mb-4">
                        {event.description || 'No description provided.'}
                      </p>
                      <div className="mt-auto">
                        <p className="text-xs text-on-surface-variant mb-4">
                          <span className="font-semibold text-on-surface">Venue:</span>{' '}
                          {event.venue}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/50">
                          <span className="text-primary flex items-center group-hover:translate-x-1 transition-transform text-sm font-bold">
                            View Details <ChevronRight size={16} className="ml-1" />
                          </span>
                          {event.registerLink && !event.registrationNotRequired && (
                            <object>
                              <a
                                href={event.registerLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full
                                         bg-primary px-4 py-2 text-xs font-semibold text-on-primary
                                         hover:opacity-90 transition-colors pointer-events-auto"
                              >
                                Register Now
                              </a>
                            </object>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERIES SECTION ── */}
      <section className="py-14 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-[32px] text-on-surface font-bold">
                Event Gallery
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-sm sm:text-base mt-1">
                Explore highlights and memories from past SCA events.
              </p>
            </div>
          </div>

          {isGalleriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-surface-container rounded-2xl h-64 border border-outline-variant"></div>
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <div className="rounded-card border border-dashed border-outline-variant
                            p-12 text-center text-on-surface-variant">
              No galleries are available yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {galleries.map(gallery => (
                <Link 
                  key={gallery._id} 
                  to={`/gallery/${gallery._id}`}
                  className="bg-surface-card rounded-card border border-outline-variant overflow-hidden flex flex-col shadow-sm hover:shadow-card transition-shadow group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={gallery.bannerImage} alt={gallery.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                      {gallery.images?.length || 0} Images
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{gallery.title}</h3>
                    <p className="text-on-surface-variant text-sm mt-2 line-clamp-2 flex-1">{gallery.description}</p>
                    <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant font-medium">
                        {gallery.startDate ? `${new Date(gallery.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${gallery.endDate && gallery.endDate !== gallery.startDate ? ` - ${new Date(gallery.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}` : new Date(gallery.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-primary flex items-center group-hover:translate-x-1 transition-transform text-sm font-bold">
                        View Details <ChevronRight size={16} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-14 sm:py-24 bg-background" id="about">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-16 space-y-4">
            <h2 className="text-2xl sm:text-[32px] text-on-surface font-bold">
              Everything you need to run SCA events
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base">
              A comprehensive toolset designed for the specific workflow of University
              event coordination, from approval to execution.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Role-Based Access',
                desc: 'Granular permissions for Admins, Faculty, Organizers, and Students. Everyone sees exactly what they need.',
              },
              {
                icon: Calendar,
                title: 'Event Lifecycle',
                desc: 'From initial proposal through approval queue to post-event reporting, manage the entire lifecycle in one place.',
              },
              {
                icon: CheckSquare,
                title: 'Tasks & Todo Tracking',
                desc: 'Assign specific tasks to student teams with deadlines and automatic reminders for seamless coordination.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-surface-container p-6 sm:p-8 rounded-card border border-outline-variant
                           hover:shadow-card transition-shadow group"
              >
                <div className="w-12 h-12 bg-primary-container/10 rounded-card flex items-center
                                justify-center text-primary mb-5
                                group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Icon size={28} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-on-surface mb-2">{title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 sm:py-24 bg-surface-card relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-[32px] text-on-surface font-bold mb-8 sm:mb-12">
                Streamlined workflow for{' '}
                <span className="text-primary">Academic Excellence</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    num: '1', color: 'bg-primary text-on-primary',
                    title: 'Admin Creates Accounts',
                    desc: 'Centralized system administrators provision secure faculty and student organizer accounts via JWT authentication.',
                  },
                  {
                    num: '2', color: 'bg-primary text-on-primary',
                    title: 'Faculty Orchestrate Events',
                    desc: 'Faculty members initiate event registries, define scope, and assign dynamic todo lists to student leadership teams.',
                  },
                  {
                    num: '3', color: 'bg-primary text-on-primary',
                    title: 'Students Execute & Track',
                    desc: 'Assigned students track their progress, check off completed tasks, and provide real-time updates through their dashboard.',
                  },
                ].map(({ num, color, title, desc }) => (
                  <div key={num} className="flex gap-5">
                    <div className={`flex-none w-9 h-9 sm:w-10 sm:h-10 rounded-full ${color} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {num}
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-base sm:text-lg text-on-surface">{title}</h4>
                      <p className="text-on-surface-variant text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-primary/5 rounded-[40px] -rotate-3" />
              <div
                ref={howitWorksImage.ref}
                className="relative z-10 aspect-square rounded-[40px] overflow-hidden
                           bg-cover bg-center shadow-card border-8 border-surface-card
                           bg-gray-300 transition-opacity duration-500"
                style={{
                  backgroundImage: howitWorksImage.backgroundImage || "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==')",
                  opacity: howitWorksImage.isLoading ? 0.6 : 1,
                }}
              />              
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-14 sm:py-20 bg-surface-container">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-[36px] text-on-surface font-bold">
              Ready to elevate your department's events?
            </h2>
            <p className="text-on-surface-variant text-base sm:text-lg">
              Join the School of Computer Application's official management portal today
              and streamline your institutional workflow.
            </p>
            <div className="flex justify-center">
              <Link
                to="/portal"
                className="bg-primary text-on-primary px-8 sm:px-10 py-4 sm:py-5 rounded-btn font-bold
                           text-base sm:text-lg shadow-md hover:opacity-90 transition-all active:scale-95
                           flex items-center gap-3"
              >
                Access SCA Portal
                <LogIn size={22} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  )
}
