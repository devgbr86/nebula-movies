import { navigate } from "./router.js";
export function renderHome(app) {
    app.innerHTML = `
    <div class="home-wrap">

      <div class="home-nav-section">
        <p class="home-section-label">🔍Search</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-search-scifi">Search Sci-Fi</button>
          <button class="home-nav-btn" id="btn-search-horror">Search Horror</button>
          <button class="home-nav-btn" id="btn-search-western">Search Western</button>
          <button class="home-nav-btn" id="btn-search-comedy">Search Comedy</button>
          <button class="home-nav-btn" id="btn-search-war">Search War</button>
          <button class="home-nav-btn" id="btn-search-crime">Search Crime</button>
          <button class="home-nav-btn" id="btn-search-drama">Search Drama</button>
        </div>
      </div>

      <div class="home-nav-section">
        <p class="home-section-label">⭐Top 10</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-top-scifi">Top 10 Sci-Fi</button>
          <button class="home-nav-btn" id="btn-top-horror">Top 10 Horror</button>
          <button class="home-nav-btn" id="btn-top-western">Top 10 Western</button>
          <button class="home-nav-btn" id="btn-top-comedy">Top 10 Comedy</button>
          <button class="home-nav-btn" id="btn-top-war">Top 10 War</button>
          <button class="home-nav-btn" id="btn-top-crime">Top 10 Crime</button>
          <button class="home-nav-btn" id="btn-top-drama">Top 10 Drama</button>
        </div>
      </div>

      <div class="home-nav-section">
        <p class="home-section-label">🔔Latest</p>
        <div class="home-nav-grid">
          <button class="home-nav-btn" id="btn-latest-scifi">Latest Sci-Fi</button>
          <button class="home-nav-btn" id="btn-latest-horror">Latest Horror</button>
          <button class="home-nav-btn" id="btn-latest-western">Latest Western</button>
          <button class="home-nav-btn" id="btn-latest-comedy">Latest Comedy</button>
          <button class="home-nav-btn" id="btn-latest-war">Latest War</button>
          <button class="home-nav-btn" id="btn-latest-crime">Latest Crime</button>
          <button class="home-nav-btn" id="btn-latest-drama">Latest Drama</button>
        </div>
      </div>

    </div>
  `;
    document.getElementById("btn-search-scifi").addEventListener("click", () => navigate("/search/scifi"));
    document.getElementById("btn-search-horror").addEventListener("click", () => navigate("/search/horror"));
    document.getElementById("btn-search-western").addEventListener("click", () => navigate("/search/western"));
    document.getElementById("btn-search-comedy").addEventListener("click", () => navigate("/search/comedy"));
    document.getElementById("btn-search-war").addEventListener("click", () => navigate("/search/war"));
    document.getElementById("btn-search-crime").addEventListener("click", () => navigate("/search/crime"));
    document.getElementById("btn-search-drama").addEventListener("click", () => navigate("/search/drama"));
    document.getElementById("btn-top-scifi").addEventListener("click", () => navigate("/category/top/scifi"));
    document.getElementById("btn-top-horror").addEventListener("click", () => navigate("/category/top/horror"));
    document.getElementById("btn-top-western").addEventListener("click", () => navigate("/category/top/western"));
    document.getElementById("btn-top-comedy").addEventListener("click", () => navigate("/category/top/comedy"));
    document.getElementById("btn-top-war").addEventListener("click", () => navigate("/category/top/war"));
    document.getElementById("btn-top-crime").addEventListener("click", () => navigate("/category/top/crime"));
    document.getElementById("btn-top-drama").addEventListener("click", () => navigate("/category/top/drama"));
    document.getElementById("btn-latest-scifi").addEventListener("click", () => navigate("/category/latest/scifi"));
    document.getElementById("btn-latest-horror").addEventListener("click", () => navigate("/category/latest/horror"));
    document.getElementById("btn-latest-western").addEventListener("click", () => navigate("/category/latest/western"));
    document.getElementById("btn-latest-comedy").addEventListener("click", () => navigate("/category/latest/comedy"));
    document.getElementById("btn-latest-war").addEventListener("click", () => navigate("/category/latest/war"));
    document.getElementById("btn-latest-crime").addEventListener("click", () => navigate("/category/latest/crime"));
    document.getElementById("btn-latest-drama").addEventListener("click", () => navigate("/category/latest/drama"));
}
