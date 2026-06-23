type SearchBarProps = {
    query: string
    onQueryChange: (value: string) => void
    onSubmit: (e: React.FormEvent) => void
  }
  
  function SearchBar({ query, onQueryChange, onSubmit }: SearchBarProps) {
    return (
      <form onSubmit={onSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Enter repository (e.g. facebook/react)"
          className="search-input"
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
    )
  }
  
  export default SearchBar