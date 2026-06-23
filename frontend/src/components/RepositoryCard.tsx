type RepositoryCardProps = {
    name: string
    description: string
    stars: number
    language: string
  }
  
  function RepositoryCard({ name, description, stars, language }: RepositoryCardProps) {
    return (
      <article className="repo-card">
        <h2>Repository Details</h2>
        <div className="repo-details">
          <div className="repo-detail">
            <span className="repo-label">Repository Name</span>
            <span className="repo-value">{name}</span>
          </div>
          <div className="repo-detail">
            <span className="repo-label">Description</span>
            <span className="repo-value">{description}</span>
          </div>
          <div className="repo-detail">
            <span className="repo-label">Stars</span>
            <span className="repo-value">{stars}</span>
          </div>
          <div className="repo-detail">
            <span className="repo-label">Language</span>
            <span className="repo-value">{language}</span>
          </div>
        </div>
      </article>
    )
  }
  
  export default RepositoryCard