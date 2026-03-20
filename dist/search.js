import { openModal, closeModal } from "./main.js";
const API_KEY = "trilogy";
const BASE = "https://www.omdbapi.com/";
const GENRE_CONFIG = {
    scifi: { label: "Sci-Fi", apiTerm: "sci-fi" },
    horror: { label: "Horror", apiTerm: "horror" },
    western: { label: "Western", apiTerm: "western" },
    comedy: { label: "Comedy", apiTerm: "comedy" },
    war: { label: "War", apiTerm: "war" },
    crime: { label: "Crime", apiTerm: "crime" },
    drama: { label: "Drama", apiTerm: "drama" },
};
let currentSelectedLi = null;
function setStatus(msg, isError) {
    const el = document.getElementById("status-msg");
    if (!el)
        return;
    el.textContent = msg;
    el.className = isError ? "error" : "";
}
function renderMovieLi(movie, listEl) {
    const li = document.createElement("li");
    const rating = movie.imdbRating && movie.imdbRating !== "N/A"
        ? ` &middot; &#9733; ${movie.imdbRating}` : "";
    li.innerHTML = `
    <div class="movie-title">${movie.Title}</div>
    <div class="movie-meta">${movie.Year} &middot; ${movie.Runtime}${rating}</div>
  `;
    li.addEventListener("click", () => {
        currentSelectedLi === null || currentSelectedLi === void 0 ? void 0 : currentSelectedLi.classList.remove("active");
        li.classList.add("active");
        currentSelectedLi = li;
        openModal(movie);
    });
    listEl.appendChild(li);
}
async function searchMovies(query, genreFilter) {
    var _a, _b, _c;
    const decadeFilter = document.getElementById("decade-filter");
    const resultsEl = document.getElementById("results");
    const resultCountEl = document.getElementById("result-count");
    const startYear = (decadeFilter === null || decadeFilter === void 0 ? void 0 : decadeFilter.value) ? parseInt(decadeFilter.value) : null;
    const endYear = startYear ? startYear + 9 : null;
    setStatus("Searching...", false);
    resultsEl.innerHTML = "";
    resultCountEl.textContent = "";
    try {
        const yearList = [];
        if (startYear && endYear) {
            for (let y = startYear; y <= endYear; y++)
                yearList.push(y);
        }
        else {
            yearList.push(null);
        }
        const seenIds = new Set();
        const allMovies = [];
        const firstPageResults = await Promise.all(yearList.map(y => {
            const yearParam = y ? `&y=${y}` : "";
            return fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=1${yearParam}`)
                .then(r => r.json());
        }));
        for (const data1 of firstPageResults) {
            if (!data1.Search)
                continue;
            for (const m of data1.Search) {
                if (!seenIds.has(m.imdbID)) {
                    seenIds.add(m.imdbID);
                    allMovies.push(m);
                }
            }
            const total = Math.min(parseInt((_a = data1.totalResults) !== null && _a !== void 0 ? _a : "0"), 50);
            const pages = Math.ceil(total / 10);
            if (pages > 1) {
                const extras = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=${i + 2}`)
                    .then(r => r.json())));
                for (const p of extras) {
                    if (p.Search) {
                        for (const m of p.Search) {
                            if (!seenIds.has(m.imdbID)) {
                                seenIds.add(m.imdbID);
                                allMovies.push(m);
                            }
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
        setStatus(`Filtering ${allMovies.length} results...`, false);
        const details = await Promise.all(allMovies.map(m => fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())));
        const filtered = details.filter((d) => {
            var _a;
            if (d.Response !== "True")
                return false;
            if (!((_a = d.Genre) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(genreFilter)))
                return false;
            if (startYear && endYear) {
                const y = parseInt(d.Year);
                if (isNaN(y) || y < startYear || y > endYear)
                    return false;
            }
            return true;
        });
        if (!filtered.length) {
            setStatus(`No ${(_c = (_b = GENRE_CONFIG[genreFilter]) === null || _b === void 0 ? void 0 : _b.label) !== null && _c !== void 0 ? _c : genreFilter} films found for that term.`, true);
            resultsEl.innerHTML = `<li class="empty-state">No results.</li>`;
            resultCountEl.textContent = "";
            return;
        }
        setStatus("", false);
        resultCountEl.textContent = `${filtered.length} film${filtered.length !== 1 ? "s" : ""}`;
        filtered.forEach((m) => renderMovieLi(m, resultsEl));
    }
    catch (err) {
        console.error(err);
        setStatus("Connection error.", true);
    }
}
export function renderSearch(app, genre) {
    var _a;
    const config = (_a = GENRE_CONFIG[genre]) !== null && _a !== void 0 ? _a : { label: genre, apiTerm: genre };
    const genreFilter = config.apiTerm;
    currentSelectedLi = null;
    app.innerHTML = `
    <div class="search-area">
      <h2>Search ${config.label} films</h2>
      <div class="search-row">
        <input id="search" type="text"
          placeholder="e.g. space, zombie, cowboy, soldier, mafia, love..."
          autocomplete="off" />
        <select id="decade-filter">
          <option value="">All years</option>
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
            <h3>${config.label}</h3>
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
    const searchInput = document.getElementById("search");
    const btnSearch = document.getElementById("btn-search");
    const closeBtn = document.getElementById("close-details");
    function doSearch() {
        const q = searchInput.value.trim();
        if (!q) {
            const statusEl = document.getElementById("status-msg");
            statusEl.textContent = "Enter a search term.";
            statusEl.className = "error";
            return;
        }
        searchMovies(q, genreFilter);
    }
    btnSearch.addEventListener("click", doSearch);
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter")
        doSearch(); });
    closeBtn.addEventListener("click", () => {
        document.getElementById("details-section").classList.add("hidden");
        closeModal();
    });
}
