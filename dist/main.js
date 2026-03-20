import { initRouter, register } from "./router.js";
import { renderHome } from "./home.js";
import { renderSearch } from "./search.js";
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
const app = document.getElementById("app");
register("/", () => renderHome(app));
register("/search", () => renderSearch(app));
initRouter();
