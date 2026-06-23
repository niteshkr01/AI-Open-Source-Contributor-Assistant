export async function fetchRepository(query: string) {
    const response = await fetch(`https://api.github.com/repos/${query}`)
    if (response.status === 404) return null
    const data = await response.json()
    return {
      name: data.name,
      description: data.description,
      stars: data.stargazers_count,
      language: data.language,
    }
  }
  
  export async function fetchIssues(query: string, label?: string) {
    const url = label
      ? `https://api.github.com/repos/${query}/issues?labels=${label}&state=open`
      : `https://api.github.com/repos/${query}/issues`
    const response = await fetch(url)
    const data = await response.json()
    return data
  }