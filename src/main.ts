import { initRouter, register } from "./router.js";
import { renderHome }           from "./home.js";
import { renderSearch }         from "./search.js";
import { renderCategory }       from "./category.js";
import { buildDetailHTML }      from "./detail.js";

// ─── Types ────────────────────────────────────────────────

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

// ─── Modal ────────────────────────────────────────────────
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

register("/",                    () => renderHome(app));
register("/search/scifi",        () => renderSearch(app, "scifi"));
register("/search/terror",       () => renderSearch(app, "terror"));
register("/category/top/scifi",  () => renderCategory(app, "top",    "scifi"));
register("/category/top/terror", () => renderCategory(app, "top",    "terror"));
register("/category/latest/scifi",  () => renderCategory(app, "latest", "scifi"));
register("/category/latest/terror", () => renderCategory(app, "latest", "terror"));

initRouter();