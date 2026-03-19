// ─── Types ────────────────────────────────────────────────
type RouteHandler = () => void;

// ─── State ────────────────────────────────────────────────
const routes: Record<string, RouteHandler> = {};

// ─── Public API ───────────────────────────────────────────
export function register(path: string, handler: RouteHandler): void {
  routes[path] = handler;
}

export function navigate(path: string): void {
  location.hash = path;
}

// ─── Internal ─────────────────────────────────────────────
function resolve(): void {
  const hash    = location.hash.replace("#", "") || "/";
  const clean   = hash.length > 1 ? hash.replace(/\/$/, "") : hash;
  const handler = routes[clean] ?? routes["/"];
  handler?.();
  updateActiveNav(clean);
}

function updateActiveNav(path: string): void {
  document.querySelectorAll<HTMLAnchorElement>(".main-nav a").forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === path);
  });
}

export function initRouter(): void {
  document.addEventListener("click", e => {
    const target = (e.target as Element).closest<HTMLElement>("[data-link]");
    if (!target) return;
    e.preventDefault();
    navigate(target.getAttribute("href") ?? "/");
  });

  window.addEventListener("hashchange", resolve);
  resolve();
}