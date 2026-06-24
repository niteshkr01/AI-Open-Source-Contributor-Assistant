import { useState, useEffect, useRef } from 'react'
import IssueList from './components/IssueList'
import RepositoryCard from './components/RepositoryCard'
import SearchBar from './components/SearchBar'
import { fetchRepository, fetchIssues } from './services/github'

type Issue = {
  title: string
  state: string
  url: string
  html_url?: string
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [query, setQuery] = useState('facebook/react')
  const [repositoryName, setRepositoryName] = useState('Not searched yet')
  const [description, setDescription] = useState('Not searched yet')
  const [stars, setStars] = useState(0)
  const [language, setLanguage] = useState('Unknown')
  const [issues, setIssues] = useState<Issue[] | null>(null)
  const [issueExplanations, setIssueExplanations] = useState<Record<string, string>>({})
  const [explainingUrl, setExplainingUrl] = useState<string | null>(null)
  const [issueFilter, setIssueFilter] = useState<string>('all')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const W = canvas.width
    const H = canvas.height
    const commits = ['feat: AI explain', 'fix: #404', 'merge PR #12', 'docs: readme', 'v2.0.0 🚀', 'feat: search', 'fix: cors', 'refactor: api', 'feat: filters', 'chore: deploy']
    const branchColors = ['#23c55e', '#3b82f6', '#a855f7', '#f59e0b']
    const cols = [60, 90, 120, 75]

    const stars2 = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1 + 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
    }))

    const treeNodes = Array.from({ length: 20 }, (_, i) => {
      const col = i % 4
      return {
        x: cols[col] + (Math.random() - 0.5) * 10,
        y: Math.random() * H,
        color: branchColors[col],
        label: commits[Math.floor(Math.random() * commits.length)],
        vy: -(Math.random() * 0.4 + 0.2),
        r: Math.random() * 2 + 2,
        pulse: Math.random() * Math.PI * 2,
      }
    })

    const lines = Array.from({ length: 8 }, () => ({
      x: W * 0.65 + Math.random() * W * 0.3,
      y: Math.random() * H,
      text: commits[Math.floor(Math.random() * commits.length)],
      opacity: Math.random() * 0.07 + 0.02,
      speed: Math.random() * 0.5 + 0.2,
    }))

    const arcs = Array.from({ length: 3 }, (_, i) => ({
      x1: cols[i % 4],
      y1: 150 + i * 120,
      x2: cols[(i + 1) % 4],
      y2: 220 + i * 120,
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.002,
      color: branchColors[i % 4],
    }))

    let animId: number

    function draw() {
      const c = ctx!
      c.clearRect(0, 0, W, H)

      stars2.forEach(s => {
        s.twinkle += 0.02
        const op = s.opacity * (Math.sin(s.twinkle) * 0.3 + 0.7)
        c.beginPath()
        c.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        c.fillStyle = `rgba(255,255,255,${op})`
        c.fill()
      })

      lines.forEach(l => {
        l.y += l.speed
        if (l.y > H + 30) { l.y = -30; l.x = W * 0.65 + Math.random() * W * 0.3 }
        c.font = '9px monospace'
        c.fillStyle = `rgba(35,197,94,${l.opacity})`
        c.fillText(l.text, l.x, l.y)
      })

      arcs.forEach(a => {
        a.progress += a.speed
        if (a.progress > 1) a.progress = 0
        const t = a.progress
        const cx = (a.x1 + a.x2) / 2
        const cy = (a.y1 + a.y2) / 2 - 40
        const px = (1 - t) * (1 - t) * a.x1 + 2 * (1 - t) * t * cx + t * t * a.x2
        const py = (1 - t) * (1 - t) * a.y1 + 2 * (1 - t) * t * cy + t * t * a.y2
        c.beginPath()
        c.arc(px, py, 2.5, 0, Math.PI * 2)
        c.fillStyle = a.color + 'aa'
        c.fill()
        c.beginPath()
        c.arc(px, py, 5, 0, Math.PI * 2)
        c.fillStyle = a.color + '22'
        c.fill()
      })

      treeNodes.forEach(n => {
        n.y += n.vy
        n.pulse += 0.03
        if (n.y < -30) n.y = H + 30
        const p = Math.sin(n.pulse) * 0.4 + 0.6
        c.beginPath()
        c.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2)
        c.fillStyle = n.color + '18'
        c.fill()
        c.beginPath()
        c.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        c.fillStyle = n.color + Math.floor(p * 0.8 * 255).toString(16).padStart(2, '0')
        c.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const explainIssue = async (issueUrl: string, title: string) => {
    setExplainingUrl(issueUrl)
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: title }),
      })
      const data = await response.json()
      setIssueExplanations((prev) => ({ ...prev, [issueUrl]: data.explanation }))
    } catch (error) {
      console.log(error)
      setIssueExplanations((prev) => ({ ...prev, [issueUrl]: "AI explanation failed." }))
    } finally {
      setExplainingUrl(null)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setIssues(null)
    setIssueExplanations({})
    try {
      const repo = await fetchRepository(trimmed)
      if (!repo) {
        setRepositoryName('Repository not found')
        setDescription('Not searched yet')
        setStars(0)
        setLanguage('Unknown')
        return
      }
      setRepositoryName(repo.name)
      setDescription(repo.description ?? 'No description')
      setStars(repo.stars)
      setLanguage(repo.language ?? 'Unknown')
      const issuesData = await fetchIssues(trimmed, issueFilter === 'all' ? undefined : issueFilter)
      const repoIssues = issuesData
        .filter((item: { pull_request?: unknown }) => !item.pull_request)
        .slice(0, 5)
        .map((item: { title: string; state: string; html_url: string }) => ({
          title: item.title,
          state: item.state,
          url: item.html_url,
        }))
      setIssues(repoIssues)
    } catch {
      // Network error
    }
  }

  const handleFilterChange = async (filter: string) => {
    setIssueFilter(filter)
    if (repositoryName === 'Not searched yet') return
    const issuesData = await fetchIssues(query.trim(), filter === 'all' ? undefined : filter)
    const repoIssues = issuesData
      .filter((item: { pull_request?: unknown }) => !item.pull_request)
      .slice(0, 5)
      .map((item: { title: string; state: string; html_url: string }) => ({
        title: item.title,
        state: item.state,
        url: item.html_url,
      }))
    setIssues(repoIssues)
  }

  const features = [
    {
      title: 'Repository Discovery',
      description: 'Find open source projects that match your skills, interests, and experience level with intelligent recommendations.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: 'Issue Analysis',
      description: 'Understand issue complexity, required skills, and estimated effort before you commit to contributing.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: 'AI Explanations',
      description: 'Get clear, contextual explanations of codebases, pull requests, and contribution workflows powered by AI.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 14h6M9 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .landing {
          display: flex;
          flex-direction: column;
          min-height: 100svh;
          background: #0d1117;
          position: relative;
        }

        .bg-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 10;
        }

        .logo {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #238636;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-links {
          display: flex;
          gap: 24px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: #fff; }

        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 32px 80px;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          border-radius: 999px;
          border: 0.5px solid rgba(35,197,94,0.3);
          background: rgba(35,197,94,0.08);
          color: #23c55e;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #23c55e;
          border-radius: 50%;
          animation: blink 1.5s infinite;
        }

        @keyframes blink {
          0%,100%{opacity:1} 50%{opacity:0.2}
        }

        .hero h1 {
          font-size: 48px;
          line-height: 1.1;
          letter-spacing: -2px;
          max-width: 700px;
          margin: 0 0 20px;
          color: #fff;
        }

        .hero h1 span { color: #23c55e; }

        .hero-subtitle {
          font-size: 17px;
          line-height: 1.6;
          color: #666;
          max-width: 520px;
          margin: 0 0 40px;
        }

        .search-form {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 520px;
        }

        .search-input {
          flex: 1;
          padding: 13px 18px;
          border-radius: 10px;
          border: 0.5px solid #30363d;
          background: rgba(255,255,255,0.04);
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input::placeholder { color: #555; }
        .search-input:focus { border-color: rgba(35,197,94,0.4); }

        .search-btn {
          padding: 13px 24px;
          border-radius: 10px;
          border: none;
          background: #238636;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
          white-space: nowrap;
        }

        .search-btn:hover { opacity: 0.85; }

        .repo-card {
          width: 100%;
          max-width: 520px;
          margin-top: 28px;
          padding: 20px 24px;
          border-radius: 12px;
          border: 0.5px solid #21262d;
          background: rgba(22,27,34,0.85);
          text-align: left;
          backdrop-filter: blur(10px);
        }

        .repo-card h2 {
          font-size: 14px;
          margin: 0 0 14px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .repo-details { display: flex; flex-direction: column; gap: 10px; }
        .repo-detail { display: flex; flex-direction: column; gap: 3px; }
        .repo-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; }
        .repo-value { font-size: 14px; color: #e6edf3; }

        .issues-list {
          width: 100%;
          max-width: 520px;
          margin-top: 16px;
          padding: 20px 24px;
          border-radius: 12px;
          border: 0.5px solid #21262d;
          background: rgba(22,27,34,0.85);
          text-align: left;
          backdrop-filter: blur(10px);
        }

        .issues-list h2 {
          font-size: 14px;
          margin: 0 0 14px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .issue-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 5px 12px;
          border-radius: 6px;
          border: 0.5px solid #30363d;
          background: transparent;
          color: #666;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover { border-color: #23c55e44; color: #23c55e; }
        .filter-btn.active { border-color: #23c55e; color: #23c55e; background: rgba(35,197,94,0.08); }

        .issues-empty { color: #555; font-size: 14px; }

        .issues-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .issue-item {
          padding: 12px 14px;
          border-radius: 8px;
          border: 0.5px solid #21262d;
          background: rgba(13,17,23,0.6);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .issue-title { margin: 0; font-size: 14px; font-weight: 500; color: #e6edf3; line-height: 1.4; }

        .issue-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .issue-state {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 999px;
        }

        .issue-state.open { color: #23c55e; background: rgba(35,197,94,0.1); }
        .issue-state.closed { color: #666; background: rgba(255,255,255,0.06); }

        .issue-link { font-size: 13px; color: #3b82f6; text-decoration: none; }
        .issue-link:hover { text-decoration: underline; }

        .explain-btn {
          align-self: flex-start;
          padding: 6px 12px;
          border-radius: 6px;
          border: 0.5px solid rgba(35,197,94,0.3);
          background: rgba(35,197,94,0.08);
          color: #23c55e;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .explain-btn:hover:not(:disabled) { opacity: 0.8; }
        .explain-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .issue-explanation {
          margin: 0;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(35,197,94,0.06);
          border: 0.5px solid rgba(35,197,94,0.2);
          font-size: 13px;
          line-height: 1.6;
          color: #e6edf3;
          white-space: pre-wrap;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border-top: 0.5px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 10;
        }

        .feature-card {
          background: #0d1117;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(35,197,94,0.1);
          color: #23c55e;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-card h2 { margin: 0; font-size: 16px; color: #e6edf3; }
        .feature-card p { color: #555; font-size: 14px; line-height: 1.6; margin: 0; }

        @media (max-width: 768px) {
          .hero h1 { font-size: 32px; letter-spacing: -1px; }
          .search-form { flex-direction: column; }
          .features { grid-template-columns: 1fr; }
          .feature-card { padding: 24px 20px; }
          .nav-links { display: none; }
        }
      `}</style>

      <div className="landing">
        <canvas ref={canvasRef} className="bg-canvas" />

        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            OpenSource AI
          </div>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#search">Search</a></li>
          </ul>
        </nav>

        <section className="hero" id="search">
          <span className="hero-badge">
            <span className="badge-dot" />
            Your First PR Start Here
          </span>
          <h1>Find. Understand.<br /><span>Contribute.</span></h1>
          <p className="hero-subtitle">
            Search any GitHub repository, explore beginner-friendly issues, and get AI explanations instantly.
          </p>
          <SearchBar query={query} onQueryChange={setQuery} onSubmit={handleSearch} />
          <RepositoryCard name={repositoryName} description={description} stars={stars} language={language} />

          {issues !== null && (
            <article className="issues-list">
              <h2>Issues</h2>
              <div className="issue-filters">
                <button className={issueFilter === 'all' ? 'filter-btn active' : 'filter-btn'} onClick={() => handleFilterChange('all')}>All Issues</button>
                <button className={issueFilter === 'good first issue' ? 'filter-btn active' : 'filter-btn'} onClick={() => handleFilterChange('good first issue')}>Good First Issue</button>
                <button className={issueFilter === 'help wanted' ? 'filter-btn active' : 'filter-btn'} onClick={() => handleFilterChange('help wanted')}>Help Wanted</button>
              </div>
              {issues.length === 0 ? (
                <p className="issues-empty">No issues found</p>
              ) : (
                <IssueList issues={issues} issueExplanations={issueExplanations} explainingUrl={explainingUrl} onExplain={explainIssue} />
              )}
            </article>
          )}
        </section>

        <section className="features" id="features">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}

export default App