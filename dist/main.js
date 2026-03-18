"use strict";

const searchInput    = document.getElementById("search");
const btnSearch      = document.getElementById("btn-search");
const resultsEl      = document.getElementById("results");
const detailsSection = document.getElementById("details-section");
const movieDetailsEl = document.getElementById("movie-details");
const closeBtn       = document.getElementById("close-details");
const resultCountEl  = document.getElementById("result-count");
const statusEl       = document.getElementById("status-msg");
const btnTop10       = document.getElementById("btn-top10");
const btnLatest      = document.getElementById("btn-latest");
const top10Col       = document.getElementById("top10-col");
const latestCol      = document.getElementById("latest-col");

const API_KEY = "trilogy";
const BASE    = "https://www.omdbapi.com/";

const decadeFilter = document.getElementById("decade-filter");

let currentSelectedLi = null;
let top10Loaded  = false;
let latestLoaded = false;

// ── MODAL ──────────────────────────────────────────────────────────────────

function openModal(movie) {
  let overlay = document.getElementById("movie-modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "movie-modal-overlay";
    overlay.className = "movie-modal-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  const ratings = movie.Ratings?.map(r => `
    <div class="rating-chip">
      <span class="rating-source">${r.Source.replace("Internet Movie Database", "IMDb")}</span>
      <span class="rating-value">${r.Value}</span>
    </div>`).join("") ?? "";

  const poster = movie.Poster && movie.Poster !== "N/A"
    ? `<div class="movie-modal-poster"><img src="${movie.Poster}" alt="Poster de ${movie.Title}"></div>`
    : `<div class="movie-modal-poster"><div class="movie-modal-poster-placeholder">Sem poster</div></div>`;

  overlay.innerHTML = `
    <div class="movie-modal">
      <div class="movie-modal-header">
        <span class="movie-modal-title">${movie.Title}</span>
        <button class="movie-modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="movie-modal-meta">${movie.Year} · ${movie.Runtime} · ${movie.Rated} · ${movie.Country}</div>
      <div class="movie-modal-body">
        ${poster}
        <div class="movie-modal-info">
          ${field("Sinopse",  movie.Plot)}
          ${field("Diretor",  movie.Director)}
          ${field("Elenco",   movie.Actors)}
          ${field("Gênero",   movie.Genre)}
          ${movie.Awards && movie.Awards !== "N/A" ? field("Prêmios", movie.Awards) : ""}
          ${movie.BoxOffice && movie.BoxOffice !== "N/A" ? field("Bilheteria", movie.BoxOffice) : ""}
          ${ratings ? `<div class="detail-block">
            <span class="detail-label">Avaliações</span>
            <div class="movie-modal-ratings">${ratings}</div>
          </div>` : ""}
        </div>
      </div>
    </div>
  `;

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);
  requestAnimationFrame(() => overlay.classList.add("open"));
  document.addEventListener("keydown", onEscKey);
}

function closeModal() {
  const overlay = document.getElementById("movie-modal-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.removeEventListener("keydown", onEscKey);
}

function onEscKey(e) {
  if (e.key === "Escape") closeModal();
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function showOnlyRank(which) {
  top10Col.style.display  = which === "top10" || which === "search" ? "" : "none";
  latestCol.style.display = which === "latest" ? "" : "none";
  btnTop10.classList.toggle("active",  which === "top10");
  btnLatest.classList.toggle("active", which === "latest");
}

// ── TOP 10 ─────────────────────────────────────────────────────────────────

const SEED_TERMS = ["space", "alien", "robot", "future", "star", "mars", "cyber", "time machine"];

async function loadTopScifi() {
  if (top10Loaded) { showOnlyRank("top10"); return; }

  showOnlyRank("top10");
  setStatus("Carregando top filmes Sci-Fi...", false);
  resultsEl.innerHTML = "";
  resultCountEl.textContent = "";

  try {
    const searchResults = await Promise.all(
      SEED_TERMS.map(term =>
        fetch(`${BASE}?s=${encodeURIComponent(term)}&type=movie&apikey=${API_KEY}&page=1`)
          .then(r => r.json())
      )
    );

    const seenIds = new Set();
    const allMovies = [];
    for (const data of searchResults) {
      if (data.Search) {
        for (const m of data.Search) {
          if (!seenIds.has(m.imdbID)) { seenIds.add(m.imdbID); allMovies.push(m); }
        }
      }
    }

    const details = await Promise.all(
      allMovies.map(m =>
        fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())
      )
    );

    const scifi = details.filter(d =>
      d.Response === "True" &&
      d.Genre?.toLowerCase().includes("sci-fi") &&
      d.imdbRating && d.imdbRating !== "N/A"
    );

    const top10 = scifi
      .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating))
      .slice(0, 10);

    setStatus("", false);

    if (top10.length === 0) {
      resultsEl.innerHTML = `<li class="empty-state">Nenhum resultado encontrado.</li>`;
      return;
    }

    resultCountEl.textContent = `Top ${top10.length} · melhores avaliados`;
    renderResults(top10);
    top10Loaded = true;

  } catch (err) {
    console.error(err);
    setStatus("Erro de conexão.", true);
  }
}

// ── LATEST 10 ──────────────────────────────────────────────────────────────

const LATEST_SEED_TERMS = ["sci-fi", "space", "alien", "robot", "future"];
const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

async function loadLatestScifi() {
  const latestListEl  = document.getElementById("latest-results");
  const latestCountEl = document.getElementById("latest-count");

  if (latestLoaded) { showOnlyRank("latest"); return; }

  showOnlyRank("latest");
  latestListEl.innerHTML = `<li class="empty-state">Carregando lançamentos...</li>`;
  latestCountEl.textContent = "";
  setStatus("Carregando lançamentos recentes...", false);

  try {
    const queries = [];
    for (const year of RECENT_YEARS) {
      for (const term of LATEST_SEED_TERMS) {
        queries.push(
          fetch(`${BASE}?s=${encodeURIComponent(term)}&type=movie&y=${year}&apikey=${API_KEY}&page=1`)
            .then(r => r.json())
        );
      }
    }

    const searchResults = await Promise.all(queries);

    const seenIds = new Set();
    const allMovies = [];
    for (const data of searchResults) {
      if (data.Search) {
        for (const m of data.Search) {
          if (!seenIds.has(m.imdbID)) { seenIds.add(m.imdbID); allMovies.push(m); }
        }
      }
    }

    const details = await Promise.all(
      allMovies.map(m =>
        fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())
      )
    );

    const scifi = details.filter(d =>
      d.Response === "True" &&
      d.Genre?.toLowerCase().includes("sci-fi") &&
      d.Year && parseInt(d.Year) >= CURRENT_YEAR - 2 && parseInt(d.Year) <= CURRENT_YEAR
    );

    const latest10 = scifi
      .sort((a, b) => {
        const yearDiff = parseInt(b.Year) - parseInt(a.Year);
        if (yearDiff !== 0) return yearDiff;
        return (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0);
      })
      .slice(0, 10);

    setStatus("", false);

    if (latest10.length === 0) {
      latestListEl.innerHTML = `<li class="empty-state">Nenhum lançamento recente encontrado.</li>`;
      return;
    }

    latestCountEl.textContent = `Últimos ${latest10.length} · mais recentes`;
    renderLatestResults(latest10);
    latestLoaded = true;

  } catch (err) {
    console.error(err);
    setStatus("Erro de conexão.", true);
  }
}

function renderLatestResults(movies) {
  const latestListEl = document.getElementById("latest-results");
  if (!latestListEl) return;
  latestListEl.innerHTML = "";
  movies.forEach(movie => {
    const li = document.createElement("li");
    const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? ` · ★ ${movie.imdbRating}` : "";
    li.innerHTML = `
      <div class="movie-title">${movie.Title}</div>
      <div class="movie-meta">${movie.Year} · ${movie.Runtime}${rating}</div>
    `;
    li.addEventListener("click", () => {
      if (currentSelectedLi) currentSelectedLi.classList.remove("active");
      li.classList.add("active");
      currentSelectedLi = li;
      openModal(movie);
    });
    latestListEl.appendChild(li);
  });
}

// ── SEARCH ─────────────────────────────────────────────────────────────────

async function searchMovies(query) {
  const startYear = decadeFilter.value ? parseInt(decadeFilter.value) : null;
  const endYear   = startYear ? startYear + 9 : null;

  setStatus("Buscando...", false);
  resultsEl.innerHTML = "";
  resultCountEl.textContent = "";
  hideDetails();
  showOnlyRank("search");

  try {
    const yearList = [];
    if (startYear && endYear) {
      for (let y = startYear; y <= endYear; y++) yearList.push(y);
    } else {
      yearList.push(null);
    }

    const seenIds = new Set();
    const allMovies = [];

    const firstPageResults = await Promise.all(
      yearList.map(y => {
        const yearParam = y ? `&y=${y}` : "";
        return fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=1${yearParam}`)
          .then(r => r.json());
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
              .then(r => r.json())
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

    if (allMovies.length === 0) {
      setStatus("Nenhum resultado encontrado.", true);
      resultsEl.innerHTML = `<li class="empty-state">Nenhum resultado.</li>`;
      return;
    }

    setStatus(`Filtrando ${allMovies.length} resultados...`, false);

    const details = await Promise.all(
      allMovies.map(m =>
        fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())
      )
    );

    const scifi = details.filter(d => {
      if (d.Response !== "True") return false;
      if (!d.Genre?.toLowerCase().includes("sci-fi")) return false;
      if (startYear && endYear) {
        const y = parseInt(d.Year);
        if (isNaN(y) || y < startYear || y > endYear) return false;
      }
      return true;
    });

    if (scifi.length === 0) {
      setStatus("Nenhum filme Sci-Fi encontrado para esse termo.", true);
      resultsEl.innerHTML = `<li class="empty-state">Sem resultados Sci-Fi.</li>`;
      resultCountEl.textContent = "";
      return;
    }

    setStatus("", false);
    resultCountEl.textContent = `${scifi.length} filme${scifi.length !== 1 ? "s" : ""}`;
    renderResults(scifi);
    top10Loaded = false;

  } catch (err) {
    console.error(err);
    setStatus("Erro de conexão.", true);
  }
}

// ── RENDER ─────────────────────────────────────────────────────────────────

function renderResults(movies) {
  resultsEl.innerHTML = "";
  movies.forEach(movie => {
    const li = document.createElement("li");
    const rating = movie.imdbRating && movie.imdbRating !== "N/A" ? ` · ★ ${movie.imdbRating}` : "";
    li.innerHTML = `
      <div class="movie-title">${movie.Title}</div>
      <div class="movie-meta">${movie.Year} · ${movie.Runtime}${rating}</div>
    `;
    li.addEventListener("click", () => {
      if (currentSelectedLi) currentSelectedLi.classList.remove("active");
      li.classList.add("active");
      currentSelectedLi = li;
      openModal(movie);
    });
    resultsEl.appendChild(li);
  });
}

function field(label, value) {
  if (!value || value === "N/A") return "";
  return `<div class="detail-block">
    <span class="detail-label">${label}</span>
    <p class="detail-value">${value}</p>
  </div>`;
}

function hideDetails() {
  detailsSection.classList.add("hidden");
  detailsSection.querySelector(".details-placeholder").style.display = "";
  movieDetailsEl.innerHTML = "";
  if (currentSelectedLi) { currentSelectedLi.classList.remove("active"); currentSelectedLi = null; }
}

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.className = isError ? "error" : "";
}

// ── EVENTS ─────────────────────────────────────────────────────────────────

function doSearch() {
  const q = searchInput.value.trim();
  if (!q) { setStatus("Digite um termo para pesquisar.", true); return; }
  searchMovies(q);
}

btnTop10.addEventListener("click",  loadTopScifi);
btnLatest.addEventListener("click", loadLatestScifi);
btnSearch.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
closeBtn.addEventListener("click", hideDetails);