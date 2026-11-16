import React, { useState } from 'react'
import {
  Sparkles,
  BookOpen,
  Calendar,
  Code,
  CheckCircle2,
  MessageSquare,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react'

/**
 * AIRecommendationsView
 * Formats the fine-tuned Model V4.1 recommendations into clean, structured UI cards
 * with headings for Career Readiness, Learning Priorities, 4-Week Roadmap,
 * Recommended Project, Interview Preparation, and Resume Improvements.
 */
export default function AIRecommendationsView({ recommendations, technicalQuality, recommendationQuality }) {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('formatted') // 'formatted' | 'raw'
  const [expandedWeek, setExpandedWeek] = useState('Week 1')

  if (!recommendations) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(recommendations)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Parse text into logical sections
  const parseSections = (text) => {
    const sections = {}
    const lines = text.split('\n')
    let currentKey = 'Career Readiness'
    let currentLines = []

    const headerMap = [
      { key: 'Career Readiness', regex: /^(#+\s*)?\**Career Readiness:?\**/i },
      { key: 'Learning Priorities', regex: /^(#+\s*)?\**Learning Priorities:?\**/i },
      { key: 'Week 1', regex: /^(#+\s*)?\**Week 1:?\**/i },
      { key: 'Week 2', regex: /^(#+\s*)?\**Week 2:?\**/i },
      { key: 'Week 3', regex: /^(#+\s*)?\**Week 3:?\**/i },
      { key: 'Week 4', regex: /^(#+\s*)?\**Week 4:?\**/i },
      { key: 'Recommended Project', regex: /^(#+\s*)?\**Recommended Project:?\**/i },
      { key: 'Interview Preparation', regex: /^(#+\s*)?\**Interview Preparation:?\**/i },
      { key: 'Resume Improvements', regex: /^(#+\s*)?\**Resume Improvements:?\**/i },
    ]

    for (const line of lines) {
      let matchedKey = null
      for (const h of headerMap) {
        if (h.regex.test(line.trim())) {
          matchedKey = h.key
          break
        }
      }

      if (matchedKey) {
        if (currentLines.length > 0) {
          sections[currentKey] = currentLines.join('\n').trim()
        }
        currentKey = matchedKey
        currentLines = []
      } else {
        currentLines.push(line)
      }
    }

    if (currentLines.length > 0) {
      sections[currentKey] = currentLines.join('\n').trim()
    }

    return sections
  }

  const sections = parseSections(recommendations)

  const renderContentLines = (text) => {
    if (!text) return null
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={idx} className="h-2" />

      // Bullet points
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const content = trimmed.replace(/^[-•*]\s*/, '')
        return (
          <div key={idx} className="flex items-start gap-2.5 py-1 text-xs text-[#D1D5DB] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C00] mt-1.5 shrink-0" />
            <span>{renderFormattedInline(content)}</span>
          </div>
        )
      }

      // Numbered list
      if (/^\d+\.\s+/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)\.\s+/)[1]
        const content = trimmed.replace(/^\d+\.\s+/, '')
        return (
          <div key={idx} className="flex items-start gap-2.5 py-1 text-xs text-[#D1D5DB] leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-[#FF8C00]/15 text-[#FF8C00] font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              {num}
            </span>
            <span>{renderFormattedInline(content)}</span>
          </div>
        )
      }

      return (
        <p key={idx} className="text-xs text-[#D1D5DB] leading-relaxed py-1">
          {renderFormattedInline(trimmed)}
        </p>
      )
    })
  }

  // Highlight bold markdown **bold** or `code`
  const renderFormattedInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-[#161616] text-[#FF8C00] text-[11px] font-mono border border-[#303030]">{part.slice(1, -1)}</code>
      }
      return part
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar: View Mode Switcher & Copy */}
      <div className="flex items-center justify-between border-b border-[#2C2C2C] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF8C00]/20 border border-[#FF8C00]/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#FF8C00]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Fine-Tuned AI Career Recommendations</h3>
            <p className="text-[10px] text-[#A1A1AA]">Generated by your trained CareerPilot V4.1 LoRA Model</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            className="px-3 py-1.5 bg-[#202020] hover:bg-[#282828] border border-[#353535] text-xs font-bold text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            {viewMode === 'formatted' ? 'View Raw Markdown' : 'View Structured Cards'}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#FF8C00]/15 hover:bg-[#FF8C00]/25 border border-[#FF8C00]/30 text-xs font-bold text-[#FF8C00] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Advice'}</span>
          </button>
        </div>
      </div>

      {/* Technical Quality Warnings (if any) */}
      {technicalQuality?.warnings && technicalQuality.warnings.length > 0 && (
        <div className="p-3.5 bg-[#2B2314] border border-[#524122] rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Technical Quality Verification:</span>
          </div>
          <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-1">
            {technicalQuality.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {viewMode === 'raw' ? (
        <div className="p-5 bg-[#121212] border border-[#2D2D2D] rounded-2xl">
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
            {recommendations}
          </pre>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Career Readiness Card */}
          {sections['Career Readiness'] && (
            <div className="bg-gradient-to-br from-[#241A10] to-[#1A1A1A] border border-[#4D2E0E] rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF8C00]">
                <Lightbulb className="w-4 h-4 text-[#FF8C00]" />
                <span>Career Readiness Assessment</span>
              </div>
              <div className="text-xs text-gray-200 leading-relaxed">
                {renderContentLines(sections['Career Readiness'])}
              </div>
            </div>
          )}

          {/* 2. Learning Priorities Card */}
          {sections['Learning Priorities'] && (
            <div className="bg-[#1A1A1A] border border-[#303030] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <BookOpen className="w-4 h-4 text-[#FF8C00]" />
                <span>Immediate Learning Priorities</span>
              </div>
              <div className="space-y-1">
                {renderContentLines(sections['Learning Priorities'])}
              </div>
            </div>
          )}

          {/* 3. Four-Week Personalized Learning Roadmap */}
          <div className="bg-[#1A1A1A] border border-[#303030] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                <Calendar className="w-4 h-4 text-[#FF8C00]" />
                <span>Four-Week Action Roadmap</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF8C00]/15 text-[#FF8C00] border border-[#FF8C00]/30">
                Week by Week Plan
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((weekKey, idx) => {
                const weekContent = sections[weekKey]
                if (!weekContent) return null
                return (
                  <div
                    key={weekKey}
                    className="p-4 bg-[#141414] border border-[#2A2A2A] hover:border-[#FF8C00]/60 rounded-xl space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-[#242424] pb-2">
                      <span className="text-xs font-black text-[#FF8C00] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#FF8C00] text-black font-extrabold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span>{weekKey}</span>
                      </span>
                    </div>
                    <div className="pt-1">
                      {renderContentLines(weekContent)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. Recommended Project & Interview Preparation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recommended Project */}
            {sections['Recommended Project'] && (
              <div className="bg-[#1A1A1A] border border-[#303030] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Recommended Portfolio Project</span>
                </div>
                <div className="pt-1">
                  {renderContentLines(sections['Recommended Project'])}
                </div>
              </div>
            )}

            {/* Interview Preparation */}
            {sections['Interview Preparation'] && (
              <div className="bg-[#1A1A1A] border border-[#303030] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-400">
                  <MessageSquare className="w-4 h-4 text-sky-400" />
                  <span>Interview Preparation Strategy</span>
                </div>
                <div className="pt-1">
                  {renderContentLines(sections['Interview Preparation'])}
                </div>
              </div>
            )}
          </div>

          {/* 5. Resume Improvements Card */}
          {sections['Resume Improvements'] && (
            <div className="bg-[#1A1A1A] border border-[#303030] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF8C00]">
                <FileText className="w-4 h-4 text-[#FF8C00]" />
                <span>Resume Improvements & Guardrails</span>
              </div>
              <div className="pt-1">
                {renderContentLines(sections['Resume Improvements'])}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
