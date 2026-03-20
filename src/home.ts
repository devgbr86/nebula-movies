import { navigate } from "./router.js";

export function renderHome(app: HTMLElement): void {
  app.innerHTML = `
    <div class="home-wrap">
      <div class="home-nav-section">
        <p class="home-section-label">Movie Database</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-search">🔍 Search</button>
        </div>
        <p>Search by title, type, genre, year, and country.<br>
Movie database powered by OMDb API technology.
        </p>
      </div>
    </div>
  `;

  document.getElementById("btn-search")!.addEventListener("click", () => navigate("/search"));
}