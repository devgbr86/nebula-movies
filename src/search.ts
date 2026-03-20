import { openModal, closeModal } from "./main.js";
import type { OMDbDetail, OMDbSearchResponse } from "./main.js";

const API_KEY = "trilogy";
const BASE    = "https://www.omdbapi.com/";

let currentSelectedLi: HTMLLIElement | null = null;

function setStatus(msg: string, isError: boolean): void {
  const el = document.getElementById("status-msg") as HTMLDivElement | null;
  if (!el) return;
  el.textContent = msg;
  el.className   = isError ? "error" : "";
}

function renderMovieLi(movie: OMDbDetail, listEl: HTMLUListElement): void {
  const li     = document.createElement("li");
  const rating = movie.imdbRating && movie.imdbRating !== "N/A"
    ? ` &middot; &#9733; ${movie.imdbRating}` : "";
  li.innerHTML = `
    <div class="movie-title">${movie.Title}</div>
    <div class="movie-meta">${movie.Year} &middot; ${movie.Runtime}${rating}</div>
  `;
  li.addEventListener("click", () => {
    currentSelectedLi?.classList.remove("active");
    li.classList.add("active");
    currentSelectedLi = li;
    openModal(movie);
  });
  listEl.appendChild(li);
}

async function searchMovies(query: string): Promise<void> {
  const decadeFilter  = document.getElementById("decade-filter")  as HTMLSelectElement | null;
  const resultsEl     = document.getElementById("results")        as HTMLUListElement;
  const resultCountEl = document.getElementById("result-count")   as HTMLSpanElement;

  const startYear = decadeFilter?.value ? parseInt(decadeFilter.value) : null;
  const endYear   = startYear ? startYear + 9 : null;

  setStatus("Searching...", false);
  resultsEl.innerHTML       = "";
  resultCountEl.textContent = "";

  try {
    const yearList: (number | null)[] = [];
    if (startYear && endYear) {
      for (let y = startYear; y <= endYear; y++) yearList.push(y);
    } else {
      yearList.push(null);
    }

    const seenIds   = new Set<string>();
    const allMovies: { imdbID: string; Title: string }[] = [];

    const firstPageResults = await Promise.all(
      yearList.map(y => {
        const yearParam = y ? `&y=${y}` : "";
        return fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=1${yearParam}`)
          .then(r => r.json() as Promise<OMDbSearchResponse>);
      })
    );

    for (const data1 of firstPageResults) {
      if (!data1.Search) continue;
      for (const m of data1.Search) {
        if (!seenIds.has(m.imdbID)) { seenIds.add(m.imdbID); allMovies.push(m); }
      }
      const total = Math.min(parseInt(data1.totalResults ?? "0"), 50);
      const pages = Math.ceil(total / 10);
      if (pages > 1) {
        const extras = await Promise.all(
          Array.from({ length: pages - 1 }, (_, i) =>
            fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=${i + 2}`)
              .then(r => r.json() as Promise<OMDbSearchResponse>)
          )
        );
        for (const p of extras) {
          if (p.Search) {
            for (const m of p.Search) {
              if (!seenIds.has(m.imdbID)) { seenIds.add(m.imdbID); allMovies.push(m); }
            }
          }
        }
      }
    }

    if (!allMovies.length) {
      setStatus("No results found.", true);
      resultsEl.innerHTML = `<li class="empty-state">No results.</li>`;
      return;
    }

    setStatus(`Loading details for ${allMovies.length} results...`, false);

    const details = await Promise.all(
      allMovies.map(m =>
        fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json() as Promise<OMDbDetail>)
      )
    );

    const results = details.filter(d => d.Response === "True");

    if (startYear && endYear) {
      const filtered = results.filter(d => {
        const y = parseInt(d.Year);
        return !isNaN(y) && y >= startYear && y <= endYear;
      });
      if (!filtered.length) {
        setStatus("No results found for that decade.", true);
        resultsEl.innerHTML       = `<li class="empty-state">No results.</li>`;
        resultCountEl.textContent = "";
        return;
      }
      setStatus("", false);
      resultCountEl.textContent = `${filtered.length} film${filtered.length !== 1 ? "s" : ""}`;
      filtered.forEach(m => renderMovieLi(m, resultsEl));
      return;
    }

    setStatus("", false);
    resultCountEl.textContent = `${results.length} film${results.length !== 1 ? "s" : ""}`;
    results.forEach(m => renderMovieLi(m, resultsEl));

  } catch (err) {
    console.error(err);
    setStatus("Connection error.", true);
  }
}

export function renderSearch(app: HTMLElement): void {
  currentSelectedLi = null;

  app.innerHTML = `
    <div class="search-area">
      <h2>Search database</h2>
      <div class="search-row">
        <input id="search" type="text"
          placeholder="e.g. Blade Runner, Godfather, Interstellar..."
          autocomplete="off" />
        <select id="decade-filter">
          <option value="">All years</option>
          <option value="1940">1940s</option>
          <option value="1950">1950s</option>
          <option value="1960">1960s</option>
          <option value="1970">1970s</option>
          <option value="1980">1980s</option>
          <option value="1990">1990s</option>
          <option value="2000">2000s</option>
          <option value="2010">2010s</option>
          <option value="2020">2020s</option>
        </select>
        <button class="btn-search" id="btn-search">Search</button>
      </div>
      <div id="status-msg"></div>
    </div>

    <div class="content">
      <div class="ranks-col">
        <div class="results-col" id="results-col">
          <div class="results-header">
            <h3>Results</h3>
            <span id="result-count"></span>
          </div>
          <ul id="results"></ul>
        </div>
      </div>

      <div id="details-section" class="details-panel hidden">
        <div class="details-placeholder">Select a film to view details.</div>
        <button id="close-details">&#x2715;</button>
        <div id="movie-details"></div>
      </div>
    </div>
  `;

  const searchInput = document.getElementById("search")        as HTMLInputElement;
  const btnSearch   = document.getElementById("btn-search")    as HTMLButtonElement;
  const closeBtn    = document.getElementById("close-details") as HTMLButtonElement;

  function doSearch(): void {
    const q = searchInput.value.trim();
    if (!q) {
      const statusEl = document.getElementById("status-msg") as HTMLDivElement;
      statusEl.textContent = "Enter a search term.";
      statusEl.className   = "error";
      return;
    }
    searchMovies(q);
  }

  btnSearch.addEventListener("click", doSearch);
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
  closeBtn.addEventListener("click", () => {
    (document.getElementById("details-section") as HTMLDivElement).classList.add("hidden");
    closeModal();
  });
}