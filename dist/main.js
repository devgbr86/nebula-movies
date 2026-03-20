import { initRouter, register } from "./router.js";
import { renderHome } from "./home.js";
import { renderSearch } from "./search.js";
import { renderCategory } from "./category.js";
import { buildDetailHTML } from "./detail.js";
export function openModal(movie) {
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
    overlay.innerHTML = buildDetailHTML(movie);
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
// ─── Boot ─────────────────────────────────────────────────
const app = document.getElementById("app");
register("/", () => renderHome(app));
register("/search/scifi", () => renderSearch(app, "scifi"));
register("/search/horror", () => renderSearch(app, "horror"));
register("/search/western", () => renderSearch(app, "western"));
register("/search/comedy", () => renderSearch(app, "comedy"));
register("/search/war", () => renderSearch(app, "war"));
register("/search/crime", () => renderSearch(app, "crime"));
register("/search/drama", () => renderSearch(app, "drama"));
register("/category/top/scifi", () => renderCategory(app, "top", "scifi"));
register("/category/top/horror", () => renderCategory(app, "top", "horror"));
register("/category/top/western", () => renderCategory(app, "top", "western"));
register("/category/top/comedy", () => renderCategory(app, "top", "comedy"));
register("/category/top/war", () => renderCategory(app, "top", "war"));
register("/category/top/crime", () => renderCategory(app, "top", "crime"));
register("/category/top/drama", () => renderCategory(app, "top", "drama"));
register("/category/latest/scifi", () => renderCategory(app, "latest", "scifi"));
register("/category/latest/horror", () => renderCategory(app, "latest", "horror"));
register("/category/latest/western", () => renderCategory(app, "latest", "western"));
register("/category/latest/comedy", () => renderCategory(app, "latest", "comedy"));
register("/category/latest/war", () => renderCategory(app, "latest", "war"));
register("/category/latest/crime", () => renderCategory(app, "latest", "crime"));
register("/category/latest/drama", () => renderCategory(app, "latest", "drama"));
initRouter();
