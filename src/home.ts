import { navigate } from "./router.js";

// ─── Page render ──────────────────────────────────────────
export function renderHome(app: HTMLElement): void {
  app.innerHTML = `
    <div class="home-wrap">

      <div class="home-nav-section">
        <p class="home-section-label">Search</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-search-scifi">Search Sci-Fi</button>
          <button class="home-nav-btn" id="btn-search-terror">Search Terror</button>
        </div>
      </div>

      <div class="home-nav-section">
        <p class="home-section-label">Top 10</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-top-scifi">Top 10 Sci-Fi</button>
          <button class="home-nav-btn" id="btn-top-terror">Top 10 Terror</button>
        </div>
      </div>

      <div class="home-nav-section">
        <p class="home-section-label">Latest</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-latest-scifi">Latest Sci-Fi</button>
          <button class="home-nav-btn" id="btn-latest-terror">Latest Terror</button>
        </div>
      </div>

    </div>
  `;

  document.getElementById("btn-search-scifi")!
    .addEventListener("click", () => navigate("/search/scifi"));

  document.getElementById("btn-search-terror")!
    .addEventListener("click", () => navigate("/search/terror"));

  document.getElementById("btn-top-scifi")!
    .addEventListener("click", () => navigate("/category/top/scifi"));

  document.getElementById("btn-top-terror")!
    .addEventListener("click", () => navigate("/category/top/terror"));

  document.getElementById("btn-latest-scifi")!
    .addEventListener("click", () => navigate("/category/latest/scifi"));

  document.getElementById("btn-latest-terror")!
    .addEventListener("click", () => navigate("/category/latest/terror"));
}