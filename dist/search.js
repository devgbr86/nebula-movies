import { openModal, closeModal } from "./main.js";
// ─── Constants ────────────────────────────────────────────
const API_KEY = "trilogy";
const BASE = "https://www.omdbapi.com/";
const SEED_TERMS = ["space", "alien", "robot", "future", "star", "mars", "cyber", "time machine"];
const LATEST_SEED_TERMS = ["sci-fi", "space", "alien", "robot", "future"];
const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
// ─── State ────────────────────────────────────────────────
let currentSelectedLi = null;
let top10Loaded = false;
let latestLoaded = false;
// ─── Helpers ──────────────────────────────────────────────
function setStatus(msg, isError) {
    const el = document.getElementById("status-msg");
    el.textContent = msg;
    el.className = isError ? "error" : "";
}
function showOnlyRank(which) {
    const top10Col = document.getElementById("top10-col");
    const latestCol = document.getElementById("latest-col");
    const btnTop10 = document.getElementById("btn-top10");
    const btnLatest = document.getElementById("btn-latest");
    top10Col.style.display = which === "top10" || which === "search" ? "" : "none";
    latestCol.style.display = which === "latest" ? "" : "none";
    btnTop10.classList.toggle("active", which === "top10");
    btnLatest.classList.toggle("active", which === "latest");
}
function field(label, value) {
    if (!value || value === "N/A")
        return "";
    return `<div class="detail-block">
    <span class="detail-label">${label}</span>
    <p class="detail-value">${value}</p>
  </div>`;
}
function renderMovieLi(movie, listEl) {
    const li = document.createElement("li");
    const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? ` &middot; &#9733; ${movie.imdbRating}` : "";
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
// ─── Top 10 ───────────────────────────────────────────────
export async function loadTopScifi() {
    const resultsEl = document.getElementById("results");
    const resultCountEl = document.getElementById("result-count");
    if (top10Loaded) {
        showOnlyRank("top10");
        return;
    }
    showOnlyRank("top10");
    setStatus("Loading top Sci-Fi films...", false);
    resultsEl.innerHTML = "";
    resultCountEl.textContent = "";
    try {
        const searchResults = await Promise.all(SEED_TERMS.map(term => fetch(`${BASE}?s=${encodeURIComponent(term)}&type=movie&apikey=${API_KEY}&page=1`)
            .then(r => r.json())));
        const seenIds = new Set();
        const allMovies = [];
        for (const data of searchResults) {
            if (data.Search) {
                for (const m of data.Search) {
                    if (!seenIds.has(m.imdbID)) {
                        seenIds.add(m.imdbID);
                        allMovies.push(m);
                    }
                }
            }
        }
        const details = await Promise.all(allMovies.map(m => fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())));
        const top10 = details
            .filter(d => {
            var _a;
            return d.Response === "True" &&
                ((_a = d.Genre) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("sci-fi")) &&
                d.imdbRating && d.imdbRating !== "N/A";
        })
            .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
            .slice(0, 10);
        setStatus("", false);
        if (!top10.length) {
            resultsEl.innerHTML = `<li class="empty-state">No results found.</li>`;
            return;
        }
        resultCountEl.textContent = `Top ${top10.length} · highest rated`;
        top10.forEach(m => renderMovieLi(m, resultsEl));
        top10Loaded = true;
    }
    catch (err) {
        console.error(err);
        setStatus("Connection error.", true);
    }
}
// ─── Latest ───────────────────────────────────────────────
export async function loadLatestScifi() {
    const latestListEl = document.getElementById("latest-results");
    const latestCountEl = document.getElementById("latest-count");
    if (latestLoaded) {
        showOnlyRank("latest");
        return;
    }
    showOnlyRank("latest");
    latestListEl.innerHTML = `<li class="empty-state">Loading recent releases...</li>`;
    latestCountEl.textContent = "";
    setStatus("Loading recent releases...", false);
    try {
        const queries = [];
        for (const year of RECENT_YEARS) {
            for (const term of LATEST_SEED_TERMS) {
                queries.push(fetch(`${BASE}?s=${encodeURIComponent(term)}&type=movie&y=${year}&apikey=${API_KEY}&page=1`)
                    .then(r => r.json()));
            }
        }
        const searchResults = await Promise.all(queries);
        const seenIds = new Set();
        const allMovies = [];
        for (const data of searchResults) {
            if (data.Search) {
                for (const m of data.Search) {
                    if (!seenIds.has(m.imdbID)) {
                        seenIds.add(m.imdbID);
                        allMovies.push(m);
                    }
                }
            }
        }
        const details = await Promise.all(allMovies.map(m => fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())));
        const latest10 = details
            .filter(d => {
            var _a;
            return d.Response === "True" &&
                ((_a = d.Genre) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("sci-fi")) &&
                d.Year && parseInt(d.Year) >= CURRENT_YEAR - 2 && parseInt(d.Year) <= CURRENT_YEAR;
        })
            .sort((a, b) => {
            const yearDiff = parseInt(b.Year) - parseInt(a.Year);
            if (yearDiff !== 0)
                return yearDiff;
            return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
        })
            .slice(0, 10);
        setStatus("", false);
        if (!latest10.length) {
            latestListEl.innerHTML = `<li class="empty-state">No recent releases found.</li>`;
            return;
        }
        latestCountEl.textContent = `Latest ${latest10.length} · most recent`;
        latest10.forEach(m => renderMovieLi(m, latestListEl));
        latestLoaded = true;
    }
    catch (err) {
        console.error(err);
        setStatus("Connection error.", true);
    }
}
// ─── Search ───────────────────────────────────────────────
export async function searchMovies(query) {
    var _a;
    const decadeFilter = document.getElementById("decade-filter");
    const resultsEl = document.getElementById("results");
    const resultCountEl = document.getElementById("result-count");
    const startYear = decadeFilter.value ? parseInt(decadeFilter.value) : null;
    const endYear = startYear ? startYear + 9 : null;
    setStatus("Searching...", false);
    resultsEl.innerHTML = "";
    resultCountEl.textContent = "";
    showOnlyRank("search");
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
        const scifi = details.filter(d => {
            var _a;
            if (d.Response !== "True")
                return false;
            if (!((_a = d.Genre) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("sci-fi")))
                return false;
            if (startYear && endYear) {
                const y = parseInt(d.Year);
                if (isNaN(y) || y < startYear || y > endYear)
                    return false;
            }
            return true;
        });
        if (!scifi.length) {
            setStatus("No Sci-Fi films found for that term.", true);
            resultsEl.innerHTML = `<li class="empty-state">No Sci-Fi results.</li>`;
            resultCountEl.textContent = "";
            return;
        }
        setStatus("", false);
        resultCountEl.textContent = `${scifi.length} film${scifi.length !== 1 ? "s" : ""}`;
        scifi.forEach(m => renderMovieLi(m, resultsEl));
        top10Loaded = false;
    }
    catch (err) {
        console.error(err);
        setStatus("Connection error.", true);
    }
}
// ─── Page render ──────────────────────────────────────────
export function renderSearch(app) {
    app.innerHTML = `
    <div class="search-area">
      <h2>Search Sci-Fi films</h2>
      <div class="search-row">
        <input id="search" type="text" placeholder="e.g. space, robot, future, blade runner..." autocomplete="off" />
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
      <div class="rank-btns">
        <button class="btn-rank" id="btn-top10">&#9733; Top 10 Best of All Time</button>
        <button class="btn-rank" id="btn-latest">Latest Films</button>
      </div>
    </div>

    <div class="content">
      <div class="ranks-col">
        <div class="results-col" id="top10-col" style="display:none;">
          <div class="results-header">
            <h3></h3>
            <span id="result-count"></span>
          </div>
          <ul id="results"></ul>
        </div>
        <div class="results-col" id="latest-col" style="display:none;">
          <div class="results-header">
            <h3></h3>
            <span id="latest-count"></span>
          </div>
          <ul id="latest-results"></ul>
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
    const btnTop10 = document.getElementById("btn-top10");
    const btnLatest = document.getElementById("btn-latest");
    const closeBtn = document.getElementById("close-details");
    function doSearch() {
        const q = searchInput.value.trim();
        if (!q) {
            const statusEl = document.getElementById("status-msg");
            statusEl.textContent = "Enter a search term.";
            statusEl.className = "error";
            return;
        }
        searchMovies(q);
    }
    btnTop10.addEventListener("click", loadTopScifi);
    btnLatest.addEventListener("click", loadLatestScifi);
    btnSearch.addEventListener("click", doSearch);
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter")
        doSearch(); });
    closeBtn.addEventListener("click", () => {
        const detailsSection = document.getElementById("details-section");
        detailsSection.classList.add("hidden");
        closeModal();
    });
}
