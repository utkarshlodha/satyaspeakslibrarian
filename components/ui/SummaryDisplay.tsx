type Props = { text: string }

export default function SummaryDisplay({ text }: Props) {
  const lines = text.split('\n').filter(line => line.trim() !== '')

  return (
    <div className="space-y-4 text-gray-800 leading-relaxed text-[17px]">
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // Bold headings using ** or UPPERCASE
        if (/^\*{2}.+\*{2}$/.test(trimmed) || /^[A-Z0-9\s]+$/.test(trimmed)) {
          return (
            <h2 key={i} className="text-xl font-semibold text-gray-700">
              {trimmed.replace(/\*{2}/g, '')}
            </h2>
          )
        }

        // Numbered or bullet lists
        if (/^(\d+\.|\-|\*)\s+/.test(trimmed)) {
          return <li key={i} className="ml-4 list-disc">{trimmed}</li>
        }

        // Paragraphs
        return <p key={i}>{trimmed}</p>
      })}
    </div>
  )
}
