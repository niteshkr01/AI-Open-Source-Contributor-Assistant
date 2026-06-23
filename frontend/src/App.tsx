import { useState } from 'react'
import IssueList from './components/IssueList'
import RepositoryCard from './components/RepositoryCard'
import SearchBar from './components/SearchBar'
import { fetchRepository, fetchIssues } from './services/github'

type Issue = {
  title: string
  state: string
  url: string
}

function App() {
  const [query, setQuery] = useState('facebook/react')
  const [repositoryName, setRepositoryName] = useState('Not searched yet')
  const [description, setDescription] = useState('Not searched yet')
  const [stars, setStars] = useState(0)
  const [language, setLanguage] = useState('Unknown')
  const [issues, setIssues] = useState<Issue[] | null>(null)
  const [issueExplanations, setIssueExplanations] = useState<Record<string, string>>({})
  const [explainingUrl, setExplainingUrl] = useState<string | null>(null)
  const [issueFilter, setIssueFilter] = useState<string>('all')

  const explainIssue = async (issueUrl: string, title: string) => {
    setExplainingUrl(issueUrl)
  
    try {
      const response = await fetch("http://localhost:5000/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue: title,
        }),
      })
  
      const data = await response.json()
  
      setIssueExplanations((prev) => ({
        ...prev,
        [issueUrl]: data.explanation,
      }))
  
    } catch (error) {
      console.log(error)
  
      setIssueExplanations((prev) => ({
        ...prev,
        [issueUrl]: "AI explanation failed.",
      }))
  
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
      // Network error — leave current state unchanged
    }
  }

  const handleFilterChange = async (filter: string) => {
    setIssueFilter(filter)
    if (repositoryName === 'Not searched yet') return
  
    const issuesData = await fetchIssues(
      query.trim(),
      filter === 'all' ? undefined : filter
    )
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
      description:
        'Find open source projects that match your skills, interests, and experience level with intelligent recommendations.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: 'Issue Analysis',
      description:
        'Understand issue complexity, required skills, and estimated effort before you commit to contributing.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: 'AI Explanations',
      description:
        'Get clear, contextual explanations of codebases, pull requests, and contribution workflows powered by AI.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 14h6M9 18h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ]

  return (
    <>
      <style>{`
        .landing {
          display: flex;
          flex-direction: column;
          min-height: 100svh;
          text-align: left;
        }

        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          border-bottom: 1px solid var(--border);
        }

        .logo {
          font-family: var(--heading);
          font-size: 20px;
          font-weight: 600;
          color: var(--text-h);
          letter-spacing: -0.4px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
        }

        .nav-links {
          display: flex;
          gap: 24px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: var(--text);
          text-decoration: none;
          font-size: 15px;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: var(--text-h);
        }

        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 32px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--accent-bg) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--accent-border);
          background: var(--accent-bg);
          color: var(--accent);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
          position: relative;
        }

        .hero h1 {
          font-size: 52px;
          line-height: 1.1;
          letter-spacing: -2px;
          max-width: 720px;
          margin: 0 0 20px;
          position: relative;
        }

        .hero-subtitle {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text);
          max-width: 560px;
          margin: 0 0 40px;
          position: relative;
        }

        .search-form {
          display: flex;
          gap: 10px;
          width: 100%;
          max-width: 520px;
          position: relative;
        }

        .search-input {
          flex: 1;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--code-bg);
          color: var(--text-h);
          font-family: var(--sans);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-input::placeholder {
          color: var(--text);
          opacity: 0.7;
        }

        .search-input:focus {
          border-color: var(--accent-border);
          box-shadow: 0 0 0 3px var(--accent-bg);
        }

        .search-btn {
          padding: 14px 28px;
          border-radius: 10px;
          border: none;
          background: var(--accent);
          color: #fff;
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          white-space: nowrap;
        }

        .search-btn:hover {
          opacity: 0.9;
        }

        .search-btn:active {
          transform: scale(0.98);
        }

        .search-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .repo-details {
          width: 100%;
          max-width: 520px;
          margin-top: 32px;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--code-bg);
          text-align: left;
          position: relative;
        }

        .repo-details h2 {
          font-size: 16px;
          margin: 0 0 16px;
          color: var(--text-h);
        }

        .repo-details dl {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .repo-details-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .repo-details-row dt {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text);
        }

        .repo-details-row dd {
          margin: 0;
          font-size: 15px;
          color: var(--text-h);
        }

        .repo-meta {
          display: flex;
          gap: 20px;
          margin-top: 4px;
        }

        .repo-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 15px;
          color: var(--text-h);
        }

        .repo-meta-item span {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text);
        }

        .issues-list {
          width: 100%;
          max-width: 520px;
          margin-top: 16px;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--code-bg);
          text-align: left;
          position: relative;
        }

        .issues-list h2 {
          font-size: 16px;
          margin: 0 0 16px;
          color: var(--text-h);
        }

        .issues-empty {
          margin: 0;
          font-size: 15px;
          color: var(--text);
        }

        .issues-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-item {
          padding: 14px 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .issue-title {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-h);
          line-height: 1.4;
        }

        .issue-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .issue-state {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 3px 8px;
          border-radius: 999px;
        }

        .issue-state.open {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
        }

        .issue-state.closed {
          color: var(--text);
          background: var(--social-bg);
        }

        .issue-link {
          font-size: 14px;
          color: var(--accent);
          text-decoration: none;
        }

        .issue-link:hover {
          text-decoration: underline;
        }

        .explain-btn {
          align-self: flex-start;
          margin-top: 4px;
          padding: 8px 14px;
          border-radius: 8px;
          border: 1px solid var(--accent-border);
          background: var(--accent-bg);
          color: var(--accent);
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .explain-btn:hover:not(:disabled) {
          opacity: 0.85;
        }

        .explain-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .issue-explanation {
          margin: 0;
          padding: 12px;
          border-radius: 8px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-border);
          font-size: 14px;
          line-height: 1.55;
          color: var(--text-h);
          white-space: pre-wrap;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border-top: 1px solid var(--border);
        }

        .feature-card {
          background: var(--bg);
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--accent-bg);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-card h2 {
          margin: 0;
        }

        .feature-card p {
          color: var(--text);
          font-size: 15px;
          line-height: 1.55;
        }

        @media (max-width: 1024px) {
          .navbar {
            padding: 16px 20px;
          }

          .nav-links {
            display: none;
          }

          .hero {
            padding: 48px 20px 56px;
          }

          .hero h1 {
            font-size: 34px;
            letter-spacing: -1px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .search-form {
            flex-direction: column;
          }

          .repo-details {
            margin-top: 24px;
            padding: 20px;
          }

          .issues-list {
            margin-top: 12px;
            padding: 20px;
          }

          .repo-meta {
            flex-direction: column;
            gap: 12px;
          }

          .features {
            grid-template-columns: 1fr;
          }

          .feature-card {
            padding: 28px 20px;
            text-align: center;
            align-items: center;
          }
        }
      `}</style>

      <div className="landing">
        <nav className="navbar">
          <div className="logo">
            <span className="logo-icon" aria-hidden="true">
              OS
            </span>
            OpenSource AI
          </div>
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#search">Search</a>
            </li>
          </ul>
        </nav>

        <section className="hero" id="search">
          <span className="hero-badge">Powered by AI</span>
          <h1>AI Open Source Contributor Assistant</h1>
          <p className="hero-subtitle">
            Discover repositories, analyze issues, and get AI-powered explanations
            to help you contribute confidently to open source projects.
          </p>
          <SearchBar
  query={query}
  onQueryChange={setQuery}
  onSubmit={handleSearch}
/>

          <RepositoryCard
  name={repositoryName}
  description={description}
  stars={stars}
  language={language}
/>

{issues !== null && (
  <article className="issues-list">
    <h2>Issues</h2>
    <div className="issue-filters">
      <button
        className={issueFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
        onClick={() => handleFilterChange('all')}
      >
        All Issues
      </button>
      <button
        className={issueFilter === 'good first issue' ? 'filter-btn active' : 'filter-btn'}
        onClick={() => handleFilterChange('good first issue')}
      >
        Good First Issue
      </button>
      <button
        className={issueFilter === 'help wanted' ? 'filter-btn active' : 'filter-btn'}
        onClick={() => handleFilterChange('help wanted')}
      >
        Help Wanted
      </button>
    </div>
    {issues.length === 0 ? (
      <p className="issues-empty">No issues found</p>
    ) : (
      <IssueList
        issues={issues}
        issueExplanations={issueExplanations}
        explainingUrl={explainingUrl}
        onExplain={explainIssue}
      />
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
