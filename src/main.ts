import { initRouter, register } from "./router.js";
import { renderHome }           from "./home.js";
import { renderSearch }         from "./search.js";
import { renderCategory }       from "./category.js";
import { buildDetailHTML }      from "./detail.js";

export type OMDbMovie = { imdbID: string; Title: string };

export type OMDbSearchResponse = {
  Search?:       OMDbMovie[];
  totalResults?: string;
  Response:      string;
  Error?:        string;
};

export type OMDbDetail = {
  Title:      string;
  Year:       string;
  Rated:      string;
  Runtime:    string;
  Genre:      string;
  Director:   string;
  Actors:     string;
  Plot:       string;
  Country:    string;
  Awards:     string;
  BoxOffice?: string;
  imdbRating: string;
  Poster?:    string;
  Ratings:    Array<{ Source: string; Value: string }>;
  Response:   string;
};

export function openModal(movie: OMDbDetail): void {
  let overlay = document.getElementById("movie-modal-overlay") as HTMLDivElement | null;

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id        = "movie-modal-overlay";
    overlay.className = "movie-modal-overlay";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal();
    });
  }

  overlay.innerHTML = buildDetailHTML(movie);
  document.getElementById("modal-close-btn")!.addEventListener("click", closeModal);
  requestAnimationFrame(() => overlay!.classList.add("open"));
  document.addEventListener("keydown", onEscKey);
}

export function closeModal(): void {
  const overlay = document.getElementById("movie-modal-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.removeEventListener("keydown", onEscKey);
}

function onEscKey(e: KeyboardEvent): void {
  if (e.key === "Escape") closeModal();
}

// ─── Boot ─────────────────────────────────────────────────
const app = document.getElementById("app") as HTMLElement;

register("/",                          () => renderHome(app));

register("/search/scifi",              () => renderSearch(app, "scifi"));
register("/search/fantasy",            () => renderSearch(app, "fantasy"));
register("/search/horror",             () => renderSearch(app, "horror"));
register("/search/western",            () => renderSearch(app, "western"));
register("/search/comedy",             () => renderSearch(app, "comedy"));
register("/search/war",                () => renderSearch(app, "war"));
register("/search/crime",              () => renderSearch(app, "crime"));
register("/search/drama",              () => renderSearch(app, "drama"));
register("/search/biography",          () => renderSearch(app, "biography"));
register("/search/animation",          () => renderSearch(app, "animation"));

register("/category/top/scifi",        () => renderCategory(app, "top",    "scifi"));
register("/category/top/fantasy",      () => renderCategory(app, "top",    "fantasy"));
register("/category/top/horror",       () => renderCategory(app, "top",    "horror"));
register("/category/top/western",      () => renderCategory(app, "top",    "western"));
register("/category/top/comedy",       () => renderCategory(app, "top",    "comedy"));
register("/category/top/war",          () => renderCategory(app, "top",    "war"));
register("/category/top/crime",        () => renderCategory(app, "top",    "crime"));
register("/category/top/drama",        () => renderCategory(app, "top",    "drama"));
register("/category/top/biography",    () => renderCategory(app, "top",    "biography"));
register("/category/top/animation",    () => renderCategory(app, "top",    "animation"));

register("/category/latest/scifi",     () => renderCategory(app, "latest", "scifi"));
register("/category/latest/fantasy",   () => renderCategory(app, "latest", "fantasy"));
register("/category/latest/horror",    () => renderCategory(app, "latest", "horror"));
register("/category/latest/western",   () => renderCategory(app, "latest", "western"));
register("/category/latest/comedy",    () => renderCategory(app, "latest", "comedy"));
register("/category/latest/war",       () => renderCategory(app, "latest", "war"));
register("/category/latest/crime",     () => renderCategory(app, "latest", "crime"));
register("/category/latest/drama",     () => renderCategory(app, "latest", "drama"));
register("/category/latest/biography", () => renderCategory(app, "latest", "biography"));
register("/category/latest/animation", () => renderCategory(app, "latest", "animation"));

initRouter();