'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, SendHorizonalIcon } from 'lucide-react'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import SummaryDisplay from '@/components/ui/SummaryDisplay'
import { createClient } from '@/lib/supabase'



const rotatingPlaceholders = [
  'How to deal with anger',
  'Why am I always anxious?',
  'How to make peace with the past?',
  'What is true happiness?',
  'How to meditate when my mind is racing?',
]

export default function Home() {
  const [question, setQuestion] = useState('')
  const [summary, setSummary] = useState('')
  const [video, setVideo] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const [lastAskedQuestion, setLastAskedQuestion] = useState('')
  const [shareUrl, setShareUrl] = useState('')


  const { isSignedIn } = useUser()

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % rotatingPlaceholders.length)
        setFade(true)
      }, 100)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const ask = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to ask a question.')
      return
    }
    if (!question.trim()) return
  
    setLoading(true)
    setSubmitted(true)
    setLastAskedQuestion(question) 
  
    const res = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify({ question }),
      headers: { 'Content-Type': 'application/json' },
    })
  
    const data = await res.json()
    setSummary(data.summary)
    setVideo(data.video)
    
    setLoading(false)
  
    // 👇 Save to Supabase
    const supabase = createClient()
    const { data: saved, error } = await supabase
      .from('shared')
      .insert([
        {
          question,
          summary: data.summary,
          video: data.video,
        },
      ])
      .select()
      .single()
  
    if (error) {
      console.error('Error saving shared content:', error)
    } else {
      const generatedShareUrl = `${window.location.origin}/share/${saved.id}`
      setShareUrl(generatedShareUrl)

      // toast.success('Question answered! You can share this link.', {
      //   action: {
      //     label: 'Copy link',
      //     onClick: () => {
      //       navigator.clipboard.writeText(shareUrl)
      //       toast.success('Link copied to clipboard!')
      //     },
      //   },
      // })
    }
  
    // Clear input
    setQuestion('')
  }
  

  const getYouTubeEmbedUrl = (url: string) => {
    const id = url.split('v=')[1]?.split('&')[0] || ''
    return `https://www.youtube.com/embed/${id}`
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Image
              src="/satyaji.jpg"
              alt="Satya Ji"
              width={69}
              height={69}
              className="rounded-full"
            />
            <h1 className="text-xl font-bold text-gray-700">Satya Speaks</h1>
          </div>

          <div>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex gap-4">
                <SignInButton mode="modal">
                  <button className="px-6 py-2 rounded-full bg-black text-white font-medium hover:scale-105 transition-transform duration-200">
                    Log in
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="px-6 py-2 rounded-full border border-gray-400 text-black font-medium hover:bg-gray-100 transition duration-200">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </nav>

      {!submitted ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h2 className="text-5xl font-bold mb-12 text-gray-800 max-w-2xl leading-tight">
            What can I help with?
          </h2>

          <div className="w-full max-w-2xl relative">
            <div className="relative shadow-2xl rounded-full transition focus-within:shadow-[0_0_30px_rgba(0,0,0,0.15)]">
              {/* Search Icon */}
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />

              {/* Animated Placeholder */}
              {!question && (
                <div
                  className={`absolute left-14 right-24 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none transition-opacity duration-500 ease-in-out ${
                    fade ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {rotatingPlaceholders[placeholderIndex]}
                </div>
              )}

              {/* Input Field */}
              <input
                type="text"
                role="searchbox"
                className="w-full h-20 pl-14 pr-24 text-xl rounded-full focus:outline-none shadow-lg transition focus:scale-[1.01]"
                placeholder={submitted ? "How can I assist you?" : ""}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
                aria-label="Ask your question"
              />

              {/* Send Button */}
              <button
                onClick={ask}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-600 hover:text-blue-800 transition rounded-full"
                aria-label="Send question"
              >
                <SendHorizonalIcon size={28} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto w-full p-4 mt-4 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-black-600 font-medium font-bold text-sm">You asked:</h3>
                {shareUrl && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl)
                      toast.success('Link copied to clipboard!')
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Share
                  </button>
                )}
              </div>
              <p className="text-gray-800 text-lg">{lastAskedQuestion}</p>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 text-lg flex justify-center items-center gap-1">
                <span className="thinking-text">Thinking</span>
                <span className="dots"><span>.</span><span>.</span><span>.</span></span>
              </p>
            ) : (
              <>
                {video && (
                  <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                    <h3 className="text-gray-700 font-bold font-medium text-lg">Satya ji has answered your question in this video:</h3>
                    <iframe
                      src={getYouTubeEmbedUrl(video.link)}
                      className="w-full aspect-video rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <p className="text-gray-600 text-sm">{video.title}</p>
                  </div>
                )}
                {summary && (
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <SummaryDisplay text={summary} />
                  </div>
                )}
              </>
            )}
          </div>
          {/* Spacer to prevent search bar from blocking content */}
          <div className="h-28" />

          {/* Fixed Search Bar */}
          <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
            <div className="max-w-2xl mx-auto shadow-2xl rounded-full relative bg-white">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                className="w-full h-16 pl-14 pr-24 text-lg rounded-full border border-gray-200 focus:outline-none shadow-md transition-all duration-300"
                placeholder={submitted ? "How can I assist you?" : ""}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && ask()}
              />
              <button
                onClick={ask}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-all"
                aria-label="Send"
              >
                <SendHorizonalIcon size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
