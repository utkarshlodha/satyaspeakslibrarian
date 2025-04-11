import { openai } from '@/lib/openai';
import { createClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const { question } = await req.json();
  const supabase = createClient();

  // 1. Get embedding of the question
  const embeddingRes = await openai.embeddings.create({
    input: question,
    model: 'text-embedding-3-small'
  });

  const embedding = embeddingRes.data[0].embedding;

  // 2. Query top matching video chunks
  const { data: matches } = await supabase.rpc('match_video_chunks', {
    query_embedding: embedding,
    match_count: 15
  });

  if (!matches || matches.length === 0) {
    return Response.json({ error: 'No relevant video found' }, { status: 404 });
  }

  // 3. Group chunks by video
  const grouped: Record<string, { title: string, link: string, chunks: string[] }> = {};

  for (const match of matches) {
    if (!grouped[match.link]) {
      grouped[match.link] = {
        title: match.title,
        link: match.link,
        chunks: []
      };
    }
    grouped[match.link].chunks.push(match.caption_chunk);
  }

  // 4. Pick video with most chunks
  const bestVideo = Object.values(grouped).sort((a, b) => b.chunks.length - a.chunks.length)[0];
  const combinedText = bestVideo.chunks.join(' ');

  // 5. Improved prompt for structured, readable response
  const summaryPrompt = `
  The user asked: "${question}"
  
  Below is a transcript extract from Satya Ji's talk:
  
  ---
  ${combinedText}
  ---
  You are a wise and helpful assistant.

  Now do the following:
  1. Summarize the message from the video clip clearly and calmly with a bold heading: " Summary of Satya ji's insights:".
  2. Then write another section with a bold heading: "AI Reflections", where you share further thoughtful guidance.
  3. Format everything in **plain text**, not Markdown. Use uppercase or asterisks for **bold** headings.
  4. Keep it beautiful and human-readable.
  `;

  const chat = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a wise assistant inspired by Satya Ji. Your tone is peaceful, clear, and grounded in practical insight.' },
      { role: 'user', content: summaryPrompt }
    ],
    model: 'gpt-4o-mini',
    temperature: 0.7
  });

  return Response.json({
    summary: chat.choices[0].message.content,
    video: {
      title: bestVideo.title,
      link: bestVideo.link
    }
  });
}
