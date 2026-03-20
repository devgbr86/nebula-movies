// ─── State ────────────────────────────────────────────────
const routes = {};
// ─── Public API ───────────────────────────────────────────
export function register(path, handler) {
    routes[path] = handler;
}
export function navigate(path) {
    location.hash = path;
}
// ─── Internal ─────────────────────────────────────────────
function resolve() {
    const hash = location.hash.replace("#", "") || "/";
    const clean = hash.length > 1 ? hash.replace(/\/$/, "") : hash;
    const handler = routes[clean] ?? routes["/"];
    handler?.();
    updateActiveNav(clean);
}
function updateActiveNav(path) {
    document.querySelectorAll(".main-nav a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === path);
    });
}
export function initRouter() {
    document.addEventListener("click", e => {
        const target = e.target.closest("[data-link]");
        if (!target)
            return;
        e.preventDefault();
        navigate(target.getAttribute("href") ?? "/");
    });
    window.addEventListener("hashchange", resolve);
    resolve();
}
