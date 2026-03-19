import { initRouter, register, navigate } from "./router.js";
import { renderSearch } from "./search.js";
// ─── Constants ────────────────────────────────────────────
const API_KEY = "trilogy";
const BASE = "https://www.omdbapi.com/";
// Only confirmed sci-fi IMDb IDs
const RANDOM_POOL = [
    "tt0816692", // Interstellar
    "tt0133093", // The Matrix
    "tt1375666", // Inception
    "tt0076759", // Star Wars: A New Hope
    "tt0062622", // 2001: A Space Odyssey
    "tt0083658", // Blade Runner
    "tt1856101", // Blade Runner 2049
    "tt1483013", // Oblivion
    "tt1798709", // Her
    "tt0470752", // Ex Machina
    "tt2543164", // Arrival
    "tt1454468", // Gravity
    "tt0093058", // RoboCop
    "tt0088763", // Back to the Future
    "tt0119116", // The Fifth Element
    "tt0091949", // Aliens
    "tt0100802", // Total Recall
    "tt0118929", // Contact
    "tt0181689", // Minority Report
    "tt1136608", // District 9
    "tt3659388", // The Martian
    "tt0756683", // Children of Men
    "tt0910970", // WALL-E
    "tt0375679", // replaced -> Sunshine
    "tt0478970", // Sunshine (Danny Boyle)
    "tt0395555", // replaced -> Moon
    "tt1182345", // Moon (2009)
    "tt0103064", // Terminator 2
    "tt0172495", // Gladiator (replace) -> Dune
    "tt1160419", // Dune (2021)
];
// ─── Modal ────────────────────────────────────────────────
export function field(label, value) {
    if (!value || value === "N/A")
        return "";
    return `<div class="detail-block">
    <span class="detail-label">${label}</span>
    <p class="detail-value">${value}</p>
  </div>`;
}
export function openModal(movie) {
    var _a, _b;
    let overlay = document.getElementById("movie-modal-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "movie-modal-overlay";
        overlay.className = "movie-modal-overlay";
        document.body.appendChild(overlay);
        overlay.addEventListener("click", e => {
            if (e.target === overlay)
                closeModal();
        });
    }
    const ratings = (_b = (_a = movie.Ratings) === null || _a === void 0 ? void 0 : _a.map(r => `
    <div class="rating-chip">
      <span class="rating-source">${r.Source.replace("Internet Movie Database", "IMDb")}</span>
      <span class="rating-value">${r.Value}</span>
    </div>`).join("")) !== null && _b !== void 0 ? _b : "";
    const poster = movie.Poster && movie.Poster !== "N/A"
        ? `<div class="movie-modal-poster"><img src="${movie.Poster}" alt="${movie.Title} poster"></div>`
        : `<div class="movie-modal-poster"><div class="movie-modal-poster-placeholder">No poster</div></div>`;
    overlay.innerHTML = `
    <div class="movie-modal">
      <div class="movie-modal-header">
        <span class="movie-modal-title">${movie.Title}</span>
        <button class="movie-modal-close" id="modal-close-btn">&#x2715;</button>
      </div>
      <div class="movie-modal-meta">${movie.Year} &middot; ${movie.Runtime} &middot; ${movie.Rated} &middot; ${movie.Country}</div>
      <div class="movie-modal-body">
        ${poster}
        <div class="movie-modal-info">
          ${field("Plot", movie.Plot)}
          ${field("Director", movie.Director)}
          ${field("Cast", movie.Actors)}
          ${field("Genre", movie.Genre)}
          ${movie.Awards && movie.Awards !== "N/A" ? field("Awards", movie.Awards) : ""}
          ${movie.BoxOffice && movie.BoxOffice !== "N/A" ? field("Box Office", movie.BoxOffice) : ""}
          ${ratings ? `<div class="detail-block">
            <span class="detail-label">Ratings</span>
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
export function closeModal() {
    const overlay = document.getElementById("movie-modal-overlay");
    if (!overlay)
        return;
    overlay.classList.remove("open");
    document.removeEventListener("keydown", onEscKey);
}
function onEscKey(e) {
    if (e.key === "Escape")
        closeModal();
}
// ─── Home ─────────────────────────────────────────────────
async function loadRandomMovie(app) {
    var _a;
    const heroMovie = app.querySelector(".hero-movie");
    if (!heroMovie)
        return;
    // Shuffle pool and try until we get a confirmed sci-fi
    const shuffled = [...RANDOM_POOL].sort(() => Math.random() - 0.5);
    for (const id of shuffled) {
        const res = await fetch(`${BASE}?i=${id}&apikey=${API_KEY}&plot=full`);
        const m = await res.json();
        if (m.Response !== "True")
            continue;
        if (!((_a = m.Genre) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("sci-fi")))
            continue;
        const poster = m.Poster && m.Poster !== "N/A"
            ? `<img class="hero-poster" src="${m.Poster}" alt="${m.Title}">`
            : `<div class="hero-poster-placeholder"></div>`;
        const rating = m.imdbRating && m.imdbRating !== "N/A" ? `&#9733; ${m.imdbRating} IMDb` : "";
        heroMovie.innerHTML = `
      ${poster}
      <div class="hero-info">
        <div class="hero-meta">${m.Year} &middot; ${m.Runtime} &middot; ${m.Genre}</div>
        <h2 class="hero-title">${m.Title}</h2>
        ${rating ? `<div class="hero-rating">${rating}</div>` : ""}
        <p class="hero-plot">${m.Plot !== "N/A" ? m.Plot : ""}</p>
        <div class="hero-actions">
          <button class="btn-hero-detail" id="btn-hero-detail">View details</button>
          <button class="btn-hero-random" id="btn-hero-random">Another film</button>
          <button class="btn-hero-search" id="btn-hero-search">Search films</button>
        </div>
      </div>
    `;
        heroMovie.querySelector("#btn-hero-detail")
            .addEventListener("click", () => openModal(m));
        heroMovie.querySelector("#btn-hero-random")
            .addEventListener("click", () => loadRandomMovie(app));
        heroMovie.querySelector("#btn-hero-search")
            .addEventListener("click", () => navigate("/search"));
        return; // found a valid sci-fi, stop
    }
}
function renderHome(app) {
    app.innerHTML = `
    <div class="home-hero">
      <p class="home-label">Random film</p>
      <div class="hero-movie">
        <div class="hero-loading">Loading...</div>
      </div>
    </div>
  `;
    loadRandomMovie(app);
}
// ─── Boot ─────────────────────────────────────────────────
const app = document.getElementById("app");
register("/", () => renderHome(app));
register("/search", () => renderSearch(app));
initRouter();
