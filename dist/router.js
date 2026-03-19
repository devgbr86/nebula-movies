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
    var _a;
    const hash = location.hash.replace("#", "") || "/";
    const clean = hash.length > 1 ? hash.replace(/\/$/, "") : hash;
    const handler = (_a = routes[clean]) !== null && _a !== void 0 ? _a : routes["/"];
    handler === null || handler === void 0 ? void 0 : handler();
    updateActiveNav(clean);
}
function updateActiveNav(path) {
    document.querySelectorAll(".main-nav a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === path);
    });
}
export function initRouter() {
    document.addEventListener("click", e => {
        var _a;
        const target = e.target.closest("[data-link]");
        if (!target)
            return;
        e.preventDefault();
        navigate((_a = target.getAttribute("href")) !== null && _a !== void 0 ? _a : "/");
    });
    window.addEventListener("hashchange", resolve);
    resolve();
}
