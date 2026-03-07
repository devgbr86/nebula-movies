type OMDbMovie = {
  imdbID: string
  Title: string
}

type OMDbSearchResponse = {
  Search?: OMDbMovie[]
  totalResults?: string
  Response: string
  Error?: string
}

type OMDbDetail = {
  Title: string
  Year: string
  Rated: string
  Runtime: string
  Genre: string
  Director: string
  Actors: string
  Plot: string
  Country: string
  Awards: string
  BoxOffice?: string
  Ratings: Array<{ Source: string; Value: string }>
  Response: string
}

const searchInput    = document.getElementById("search")          as HTMLInputElement
const btnSearch      = document.getElementById("btn-search")      as HTMLButtonElement
const resultsEl      = document.getElementById("results")         as HTMLUListElement
const detailsSection = document.getElementById("details-section") as HTMLDivElement
const movieDetailsEl = document.getElementById("movie-details")   as HTMLDivElement
const closeBtn       = document.getElementById("close-details")   as HTMLButtonElement
const resultCountEl  = document.getElementById("result-count")    as HTMLSpanElement
const statusEl       = document.getElementById("status-msg")      as HTMLDivElement

const API_KEY = "trilogy"
const BASE    = "https://www.omdbapi.com/"

let currentSelectedLi: HTMLLIElement | null = null

async function searchMovies(query: string): Promise<void> {
  setStatus("Buscando...", false)
  resultsEl.innerHTML = ""
  resultCountEl.textContent = ""
  hideDetails()

  try {
    const res1 = await fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=1`)
    const data1: OMDbSearchResponse = await res1.json()

    if (data1.Response === "False" || !data1.Search) {
      setStatus(data1.Error ?? "Nenhum resultado encontrado.", true)
      resultsEl.innerHTML = `<li class="empty-state">Nenhum resultado.</li>`
      return
    }

    let allMovies: OMDbMovie[] = [...data1.Search]
    const total = Math.min(parseInt(data1.totalResults ?? "0"), 50)
    const pages = Math.ceil(total / 10)

    const extras = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) =>
        fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=${i + 2}`)
          .then(r => r.json() as Promise<OMDbSearchResponse>)
      )
    )
    for (const p of extras) if (p.Search) allMovies.push(...p.Search)

    setStatus(`Filtrando ${allMovies.length} resultados...`, false)

    const details = await Promise.all(
      allMovies.map(m =>
        fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json() as Promise<OMDbDetail>)
      )
    )

    const scifi = details.filter(d =>
      d.Response === "True" && d.Genre?.toLowerCase().includes("sci-fi")
    )

    if (scifi.length === 0) {
      setStatus("Nenhum filme Sci-Fi encontrado para esse termo.", true)
      resultsEl.innerHTML = `<li class="empty-state">Sem resultados Sci-Fi.</li>`
      resultCountEl.textContent = ""
      return
    }

    setStatus("", false)
    resultCountEl.textContent = `${scifi.length} filme${scifi.length !== 1 ? "s" : ""}`
    renderResults(scifi)

  } catch (err) {
    console.error(err)
    setStatus("Erro de conexão.", true)
  }
}

function renderResults(movies: OMDbDetail[]): void {
  resultsEl.innerHTML = ""
  movies.forEach(movie => {
    const li = document.createElement("li")
    li.innerHTML = `
      <div class="movie-title">${movie.Title}</div>
      <div class="movie-meta">${movie.Year} · ${movie.Runtime} · ${movie.Genre}</div>
    `
    li.addEventListener("click", () => {
      if (currentSelectedLi) currentSelectedLi.classList.remove("active")
      li.classList.add("active")
      currentSelectedLi = li
      displayDetails(movie)
    })
    resultsEl.appendChild(li)
  })
}

function field(label: string, value: string): string {
  if (!value || value === "N/A") return ""
  return `<div class="detail-block">
    <span class="detail-label">${label}</span>
    <p class="detail-value">${value}</p>
  </div>`
}

function displayDetails(movie: OMDbDetail): void {
  detailsSection.classList.remove("hidden")
  const placeholder = detailsSection.querySelector(".details-placeholder") as HTMLElement
  placeholder.style.display = "none"

  const ratings = movie.Ratings?.map(r => `
    <div class="rating-chip">
      <span class="rating-source">${r.Source.replace("Internet Movie Database", "IMDb")}</span>
      <span class="rating-value">${r.Value}</span>
    </div>`).join("") ?? ""

  movieDetailsEl.innerHTML = `
    <h3 class="detail-title">${movie.Title}</h3>
    <div class="detail-meta-row">${movie.Year} · ${movie.Runtime} · ${movie.Rated} · ${movie.Country}</div>
    ${field("Sinopse",   movie.Plot)}
    ${field("Diretor",   movie.Director)}
    ${field("Elenco",    movie.Actors)}
    ${field("Gênero",    movie.Genre)}
    ${movie.Awards !== "N/A" ? field("Prêmios", movie.Awards) : ""}
    ${movie.BoxOffice && movie.BoxOffice !== "N/A" ? field("Bilheteria", movie.BoxOffice) : ""}
    ${ratings ? `<div class="detail-block">
      <span class="detail-label">Avaliações</span>
      <div class="ratings-row">${ratings}</div>
    </div>` : ""}
  `
}

function hideDetails(): void {
  detailsSection.classList.add("hidden")
  const placeholder = detailsSection.querySelector(".details-placeholder") as HTMLElement
  placeholder.style.display = ""
  movieDetailsEl.innerHTML = ""
  if (currentSelectedLi) { currentSelectedLi.classList.remove("active"); currentSelectedLi = null }
}

function setStatus(msg: string, isError: boolean): void {
  statusEl.textContent = msg
  statusEl.className = isError ? "error" : ""
}

function doSearch(): void {
  const q = searchInput.value.trim()
  if (q) searchMovies(q)
}

btnSearch.addEventListener("click", doSearch)
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch() })
closeBtn.addEventListener("click", hideDetails)