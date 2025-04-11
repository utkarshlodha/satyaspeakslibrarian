// app/share/[id]/page.tsx

import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import SummaryDisplay from '@/components/ui/SummaryDisplay'

export default async function SharedPage({
  params,
}: {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()
  const { data } = await supabase
    .from('shared')
    .select()
    .eq('id', params.id)
    .single()

  if (!data) return notFound()

  const getYouTubeEmbedUrl = (url: string) => {
    const id = url.split('v=')[1]?.split('&')[0] || ''
    return `https://www.youtube.com/embed/${id}`
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
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
      </nav>

      {/* Shared Content */}
      <div className="max-w-3xl mx-auto w-full p-4 mt-4 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-black-600 font-medium font-bold text-sm mb-2">Question:</h3>
            <p className="text-gray-800 text-lg">{data.question}</p>
          </div>

          {data.video && (
            <div className="bg-white rounded-2xl shadow-md p-4 space-y-4">
              <h3 className="text-gray-700 font-bold font-medium text-lg">Satya ji has answered this in the video below:</h3>
              <iframe
                src={getYouTubeEmbedUrl(data.video.link)}
                className="w-full aspect-video rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <p className="text-gray-600 text-sm">{data.video.title}</p>
            </div>
          )}

          {data.summary && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <SummaryDisplay text={data.summary} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
