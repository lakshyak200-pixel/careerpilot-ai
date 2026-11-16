import { Link } from 'react-router-dom'
import { Rocket, Heart, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  const footerLinks = {
    Platform: [
      { name: 'Explore Careers', href: '/explore-careers' },
      { name: 'AI Resume Analysis', href: '/dashboard/resume-analysis' },
      { name: 'AI Mock Interviews', href: '/dashboard/mock-interview' },
      { name: 'Learning Roadmap', href: '/dashboard/roadmap' },
    ],
    Resources: [
      { name: 'Curated Roles Catalog', href: '/explore-careers' },
      { name: 'Skill Gap Benchmarks', href: '/dashboard/skill-gap' },
      { name: 'ATS Verification Tips', href: '/dashboard/upload-resume' },
      { name: 'FastAPI Backend API Docs', href: 'http://localhost:8000/docs', external: true },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Security & RLS', href: '#' },
      { name: 'Responsible AI Notice', href: '#' },
    ],
  }

  return (
    <footer className="bg-[#141414] border-t border-[#262626] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#FF8C00] text-black flex items-center justify-center shadow-[0_0_12px_rgba(255,140,0,0.3)]">
                <Rocket className="w-4 h-4 font-black" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                CAREERPILOT<span className="text-[#FF8C00]">.AI</span>
              </span>
            </Link>

            <p className="text-xs text-[#A1A1AA] max-w-sm leading-relaxed">
              AI-powered career discovery and readiness platform for university students and fresh graduates.
              Analyze your CV, close verified skill gaps, and practice real-time technical interviews.
            </p>

            <div className="pt-2 text-[11px] text-[#71717A]">
              Built with Python FastAPI, PyMuPDF, Sentence Transformers & Supabase.
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <span className="w-1 h-3 bg-[#FF8C00] rounded-full inline-block" />
                <span>{title}</span>
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#A1A1AA] hover:text-[#FF8C00] transition-colors inline-flex items-center gap-1"
                      >
                        <span>{link.name}</span>
                        <ArrowUpRight className="w-3 h-3 text-gray-500" />
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-xs text-[#A1A1AA] hover:text-[#FF8C00] transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="mt-12 pt-6 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} CareerPilot AI. All rights reserved.</p>
          <p className="text-[11px] text-gray-500">
            Skill match scores measure documented alignment and do not guarantee hiring eligibility.
          </p>
        </div>
      </div>
    </footer>
  )
}
