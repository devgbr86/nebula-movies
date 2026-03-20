import { openModal } from "./main.js";
import type { OMDbDetail, OMDbSearchResponse } from "./main.js";

const API_KEY = "trilogy";
const BASE    = "https://www.omdbapi.com/";

const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

const GENRE_CONFIG: Record<string, { label: string; apiTerm: string; seeds: string[] }> = {
  scifi: {
    label:   "Sci-Fi",
    apiTerm: "sci-fi",
    seeds:   ["space", "alien", "robot", "future", "star", "mars", "cyber", "time machine"],
  },
  horror: {
    label:   "Horror",
    apiTerm: "horror",
    seeds:   ["horror", "ghost", "monster", "demon", "haunted", "vampire", "zombie", "witch"],
  },
  western: {
    label:   "Western",
    apiTerm: "western",
    seeds:   ["western", "cowboy", "outlaw", "sheriff", "frontier", "gunfighter", "saloon", "wild west"],
  },
  comedy: {
    label:   "Comedy",
    apiTerm: "comedy",
    seeds:   ["comedy", "funny", "humor", "laugh", "sitcom", "parody", "romantic comedy", "slapstick"],
  },
  war: {
    label:   "War",
    apiTerm: "war",
    seeds:   ["war", "military", "soldier", "battle", "army", "combat", "navy", "marines"],
  },
  crime: {
    label:   "Crime",
    apiTerm: "crime",
    seeds:   ["crime", "mafia", "gangster", "heist", "murder", "detective", "mob", "drug"],
  },
  drama: {
    label:   "Drama",
    apiTerm: "drama",
    seeds:   ["drama", "family", "life", "love", "loss", "redemption", "struggle", "true story"],
  },
};

let currentSelectedLi: HTMLLIElement | null = null;

function setStatus(msg: string, isError: boolean): void {
  const el = document.getElementById("cat-status") as HTMLDivElement | null;
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

async function fetchDetails(ids: string[]): Promise<OMDbDetail[]> {
  return Promise.all(
    ids.map(id =>
      fetch(`${BASE}?i=${id}&apikey=${API_KEY}&plot=full`).then(r => r.json() as Promise<OMDbDetail>)
    )
  );
}

async function collectIds(queries: Promise<OMDbSearchResponse>[]): Promise<string[]> {
  const results = await Promise.all(queries);
  const seenIds = new Set<string>();
  const ids: string[] = [];
  for (const data of results) {
    if (data.Search) {
      for (const m of data.Search) {
        if (!seenIds.has(m.imdbID)) { seenIds.add(m.imdbID); ids.push(m.imdbID); }
      }
    }
  }
  return ids;
}

async function loadTop(genre: string, listEl: HTMLUListElement, countEl: HTMLSpanElement): Promise<void> {
  const config = GENRE_CONFIG[genre];
  if (!config) return;

  setStatus(`Loading top ${config.label} films...`, false);
  listEl.innerHTML = "";

  try {
    const queries = config.seeds.map(term =>
      fetch(`${BASE}?s=${encodeURIComponent(term)}&type=movie&apikey=${API_KEY}&page=1`)
        .then(r => r.json() as Promise<OMDbSearchResponse>)
    );

    const ids     = await collectIds(queries);
    const details = await fetchDetails(ids);

    const top10 = details
      .filter(d =>
        d.Response === "True" &&
        d.Genre?.toLowerCase().includes(config.apiTerm) &&
        d.imdbRating && d.imdbRating !== "N/A"
      )
      .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
      .slice(0, 10);

    setStatus("", false);

    if (!top10.length) {
      listEl.innerHTML = `<li class="empty-state">No results found.</li>`;
      return;
    }

    countEl.textContent = `Top ${top10.length} · highest rated`;
    top10.forEach(m => renderMovieLi(m, listEl));

  } catch (err) {
    console.error(err);
    setStatus("Connection error.", true);
  }
}

async function loadLatest(genre: string, listEl: HTMLUListElement, countEl: HTMLSpanElement): Promise<void> {
  const config = GENRE_CONFIG[genre];
  if (!config) return;

  setStatus(`Loading latest ${config.label} films...`, false);
  listEl.innerHTML = `<li class="empty-state"></li>`;

  try {
    const queries: Promise<OMDbSearchResponse>[] = [];
    for (const year of RECENT_YEARS) {
      for (const term of config.seeds) {
        queries.push(
          fetch(`${BASE}?s=${encodeURIComponent(term)}&type=movie&y=${year}&apikey=${API_KEY}&page=1`)
            .then(r => r.json() as Promise<OMDbSearchResponse>)
        );
      }
    }

    const ids     = await collectIds(queries);
    const details = await fetchDetails(ids);

    const latest10 = details
      .filter(d =>
        d.Response === "True" &&
        d.Genre?.toLowerCase().includes(config.apiTerm) &&
        d.Year &&
        parseInt(d.Year) >= CURRENT_YEAR - 2 &&
        parseInt(d.Year) <= CURRENT_YEAR
      )
      .sort((a, b) => {
        const yearDiff = parseInt(b.Year) - parseInt(a.Year);
        if (yearDiff !== 0) return yearDiff;
        return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
      })
      .slice(0, 10);

    setStatus("", false);

    if (!latest10.length) {
      listEl.innerHTML = `<li class="empty-state">No recent releases found.</li>`;
      return;
    }

    countEl.textContent = `Latest ${latest10.length} · most recent`;
    latest10.forEach(m => renderMovieLi(m, listEl));

  } catch (err) {
    console.error(err);
    setStatus("Connection error.", true);
  }
}

export function renderCategory(app: HTMLElement, mode: "top" | "latest", genre: string): void {
  const config    = GENRE_CONFIG[genre] ?? { label: genre, apiTerm: genre, seeds: [] };
  const modeLabel = mode === "top" ? "Top 10" : "Latest";

  currentSelectedLi = null;

  app.innerHTML = `
    <div class="search-area">
      <h2>${modeLabel} ${config.label}</h2>
      <div id="cat-status"></div>
    </div>

    <div class="content">
      <div class="ranks-col">
        <div class="results-col">
          <div class="results-header">
            <h3></h3>
            <span id="cat-count"></span>
          </div>
          <ul id="cat-results"></ul>
        </div>
      </div>

      <div id="details-section" class="details-panel hidden">
        <div class="details-placeholder">Select a film to view details.</div>
        <button id="close-details">&#x2715;</button>
        <div id="movie-details"></div>
      </div>
    </div>
  `;

  const listEl   = document.getElementById("cat-results") as HTMLUListElement;
  const countEl  = document.getElementById("cat-count")   as HTMLSpanElement;
  const closeBtn = document.getElementById("close-details") as HTMLButtonElement;

  closeBtn.addEventListener("click", () => {
    (document.getElementById("details-section") as HTMLDivElement).classList.add("hidden");
  });

  if (mode === "top") {
    loadTop(genre, listEl, countEl);
  } else {
    loadLatest(genre, listEl, countEl);
  }
}