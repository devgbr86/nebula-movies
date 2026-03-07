"use strict";

const searchInput    = document.getElementById("search");
const btnSearch      = document.getElementById("btn-search");
const resultsEl      = document.getElementById("results");
const detailsSection = document.getElementById("details-section");
const movieDetailsEl = document.getElementById("movie-details");
const closeBtn       = document.getElementById("close-details");
const resultCountEl  = document.getElementById("result-count");
const statusEl       = document.getElementById("status-msg");

const API_KEY = "trilogy";
const BASE    = "https://www.omdbapi.com/";

let currentSelectedLi = null;

async function searchMovies(query) {
  if (!query.trim()) return;

  setStatus("Buscando...", "");
  resultsEl.innerHTML = "";
  resultCountEl.textContent = "";
  hideDetails();

  try {
    // Page 1
    const res1 = await fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=1`);
    const data1 = await res1.json();

    if (data1.Response === "False" || !data1.Search) {
      setStatus(data1.Error ?? "Nenhum resultado encontrado.", "error");
      resultsEl.innerHTML = `<li class="empty-state">Nenhum resultado.</li>`;
      return;
    }

    let allMovies = [...data1.Search];
    const total = Math.min(parseInt(data1.totalResults ?? "0"), 50);
    const pages = Math.ceil(total / 10);

    // Remaining pages in parallel
    const extras = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) =>
        fetch(`${BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=${i + 2}`)
          .then(r => r.json())
      )
    );
    for (const p of extras) if (p.Search) allMovies.push(...p.Search);

    setStatus(`Filtrando ${allMovies.length} resultados...`, "");

    // Fetch full details for all in parallel
    const details = await Promise.all(
      allMovies.map(m =>
        fetch(`${BASE}?i=${m.imdbID}&apikey=${API_KEY}&plot=full`).then(r => r.json())
      )
    );

    // Keep only Sci-Fi
    const scifi = details.filter(d =>
      d.Response === "True" && d.Genre?.toLowerCase().includes("sci-fi")
    );

    if (scifi.length === 0) {
      setStatus("Nenhum filme Sci-Fi encontrado para esse termo.", "error");
      resultsEl.innerHTML = `<li class="empty-state">Sem resultados Sci-Fi.</li>`;
      resultCountEl.textContent = "";
      return;
    }

    setStatus("", "");
    resultCountEl.textContent = `${scifi.length} filme${scifi.length !== 1 ? "s" : ""}`;
    renderResults(scifi);

  } catch (err) {
    console.error(err);
    setStatus("Erro de conexão.", "error");
  }
}

function renderResults(movies) {
  resultsEl.innerHTML = "";
  movies.forEach(movie => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="movie-title">${movie.Title}</div>
      <div class="movie-meta">${movie.Year} · ${movie.Runtime} · ${movie.Genre}</div>
    `;
    li.addEventListener("click", () => {
      if (currentSelectedLi) currentSelectedLi.classList.remove("active");
      li.classList.add("active");
      currentSelectedLi = li;
      displayDetails(movie);
    });
    resultsEl.appendChild(li);
  });
}

function displayDetails(movie) {
  detailsSection.classList.remove("hidden");
  detailsSection.querySelector(".details-placeholder").style.display = "none";

  const ratings = movie.Ratings?.map(r => `
    <div class="rating-chip">
      <span class="rating-source">${r.Source.replace("Internet Movie Database","IMDb")}</span>
      <span class="rating-value">${r.Value}</span>
    </div>`).join("") ?? "";

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
  `;
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

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = type === "error" ? "error" : "";
}

// Events
function doSearch() {
  const q = searchInput.value.trim();
  if (q) searchMovies(q);
}

btnSearch.addEventListener("click", doSearch);
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
closeBtn.addEventListener("click", hideDetails);