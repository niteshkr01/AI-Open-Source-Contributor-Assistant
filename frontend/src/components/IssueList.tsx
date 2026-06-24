type Issue = {
    title: string
    state: string
    html_url?: string
    url: string
    body?: string
  }
  
  type IssueListProps = {
    issues: Issue[] | null
    issueExplanations: Record<string, string>
    explainingUrl: string | null
    onExplain: (url: string, title: string) => void
  }
  
  function IssueList({ issues, issueExplanations, explainingUrl, onExplain }: IssueListProps) {
    if (!issues) return null
  
    return (
      <ul className="issues-items">
        {issues.map((issue) => (
          <li key={issue.url} className="issue-item">
            <p className="issue-title">{issue.title}</p>
            <div className="issue-meta">
              <span className={`issue-state ${issue.state}`}>{issue.state}</span>
              <a href={issue.html_url || issue.url} target="_blank" rel="noopener noreferrer" className="issue-link">
                View Issue
              </a>
              <button onClick={() => onExplain(issue.url, issue.title)}>
                {explainingUrl === issue.url ? 'Explaining...' : 'Explain Issue'}
              </button>
            </div>
            {issueExplanations[issue.url] && (
              <p className="issue-explanation">{issueExplanations[issue.url]}</p>
            )}
          </li>
        ))}
      </ul>
    )
  }
  
  export default IssueList