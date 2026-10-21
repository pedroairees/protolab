import "./style.css";

const icons = {
  asterisk: '<path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"/>',
  "arrow-up-right": '<path d="M6 18 18 6M6 6h12v12"/>',
  "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  "arrow-down": '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20.8 13.2A9 9 0 0 1 10.8 3a9 9 0 1 0 10 10.2Z"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4m-4 0h8"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
  cube: '<path d="m12 2 10 5v10l-10 5-10-5V7Zm0 10L2 7m10 5 10-5M12 12v10M7 4.5l10 5"/>',
  message:
    '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M7 9h9m-9 5h6"/>',
};
document.querySelectorAll(".strip-star,.manifesto-plus").forEach((el) => {
  el.textContent = "";
  el.dataset.icon = "asterisk";
  el.setAttribute("aria-hidden", "true");
});
const icon = (name) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
document.querySelectorAll("[data-icon]").forEach((el) => {
  el.innerHTML = icon(el.dataset.icon);
});
document.getElementById("year").textContent = new Date().getFullYear();

const systemTheme = matchMedia("(prefers-color-scheme: dark)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let preference = "system";
try {
  preference = localStorage.getItem("protolab-theme") || "system";
} catch {
  /* Storage may be unavailable in private contexts. */
}
if (!["light", "dark", "system"].includes(preference)) preference = "system";
const themeTrigger = document.querySelector(".theme-trigger");
const themeOptions = document.getElementById("theme-options");
function applyTheme() {
  const theme =
    preference === "system"
      ? systemTheme.matches
        ? "dark"
        : "light"
      : preference;
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content =
    theme === "dark" ? "#10161e" : "#f8fafc";
  themeTrigger.innerHTML = icon(theme === "dark" ? "moon" : "sun");
  document
    .querySelectorAll("[data-theme-choice]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themeChoice === preference),
      ),
    );
}
function closeTheme(restoreFocus = false) {
  themeOptions.hidden = true;
  themeTrigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) themeTrigger.focus();
}
themeTrigger.addEventListener("click", () => {
  const opening = themeOptions.hidden;
  themeOptions.hidden = !opening;
  themeTrigger.setAttribute("aria-expanded", String(opening));
  if (opening) themeOptions.querySelector('[aria-pressed="true"]').focus();
});
document.querySelectorAll("[data-theme-choice]").forEach((button) =>
  button.addEventListener("click", () => {
    preference = button.dataset.themeChoice;
    try {
      localStorage.setItem("protolab-theme", preference);
    } catch {
      /* Theme still works for this visit. */
    }
    applyTheme();
    closeTheme(true);
  }),
);
systemTheme.addEventListener("change", applyTheme);
document.addEventListener("click", (event) => {
  if (!event.composedPath().includes(document.querySelector(".theme-control")))
    closeTheme();
});
document.addEventListener("focusin", (event) => {
  if (!event.composedPath().includes(document.querySelector(".theme-control")))
    closeTheme();
});
applyTheme();

const menuTrigger = document.querySelector(".menu-trigger");
const mobileNav = document.getElementById("mobile-nav");
function closeMenu(restoreFocus = false) {
  mobileNav.hidden = true;
  menuTrigger.setAttribute("aria-expanded", "false");
  menuTrigger.setAttribute("aria-label", "Abrir menu");
  menuTrigger.innerHTML = icon("menu");
  if (restoreFocus) menuTrigger.focus();
}
menuTrigger.addEventListener("click", () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuTrigger.setAttribute("aria-expanded", String(opening));
  menuTrigger.setAttribute(
    "aria-label",
    opening ? "Fechar menu" : "Abrir menu",
  );
  menuTrigger.innerHTML = icon(opening ? "close" : "menu");
});
mobileNav
  .querySelectorAll("a[href]")
  .forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("click", (event) => {
  if (!event.composedPath().includes(document.querySelector(".site-header")))
    closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!themeOptions.hidden) closeTheme(true);
    else if (!mobileNav.hidden) closeMenu(true);
  }
});
matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
}

// Local vector illustrations keep the page independent of external image services.
const svgStart = (id) =>
  `<svg viewBox="0 0 360 300" aria-hidden="true"><defs><linearGradient id="${id}-blue" x1="0" x2="1" y1="0" y2=".4"><stop stop-color="#065bbf"/><stop offset=".45" stop-color="#36b9ff"/><stop offset=".8" stop-color="#0789eb"/><stop offset="1" stop-color="#0756b9"/></linearGradient><linearGradient id="${id}-cream"><stop stop-color="#b7ab94"/><stop offset=".45" stop-color="#f8efdb"/><stop offset="1" stop-color="#cbbd9f"/></linearGradient><linearGradient id="${id}-gray"><stop stop-color="#536778"/><stop offset=".5" stop-color="#a7b5be"/><stop offset="1" stop-color="#415566"/></linearGradient><filter id="${id}-shadow"><feGaussianBlur stdDeviation="8"/></filter></defs><ellipse cx="185" cy="262" rx="100" ry="12" fill="#172c45" opacity=".13" filter="url(#${id}-shadow)"/>`;
function vaseShape(id, x, y, scale, fill) {
  let lines = "";
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const a = 75 + t * 130;
    lines += `<path d="M${a} 59C${a - 30} 112 ${a + 27} 172 ${a - 12} 250"/>`;
  }
  return `<g transform="translate(${x} ${y}) scale(${scale})"><defs><clipPath id="${id}-clip"><path d="M75 59Q140 37 205 59C175 120 228 174 193 250Q131 273 63 250C96 181 47 120 75 59Z"/></clipPath></defs><path d="M75 59Q140 37 205 59C175 120 228 174 193 250Q131 273 63 250C96 181 47 120 75 59Z" fill="url(#${fill})"/><g clip-path="url(#${id}-clip)" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="2">${lines}</g><ellipse cx="140" cy="59" rx="65" ry="13" fill="#0360a9"/><ellipse cx="140" cy="59" rx="55" ry="8" fill="#173c64"/><path d="M75 59q65 23 130 0" fill="none" stroke="#69d1ff" stroke-width="3"/></g>`;
}
document.querySelectorAll("[data-product]").forEach((el) => {
  const id = el.dataset.product;
  let content = "";
  if (id === "custom") {
    content = `<g transform="translate(49 24) rotate(-11 132 140)"><path d="M57 215V106a75 75 0 0 1 150 0v109h-40V106a35 35 0 0 0-70 0v109Z" fill="url(#custom-blue)"/>`;
    for (let i = 0; i < 15; i++)
      content += `<path d="M${60 + i * 2.4} 215V106a${72 - i * 2.4} ${72 - i * 2.4} 0 0 1 ${144 - i * 4.8} 0v109" fill="none" stroke="#88daff" stroke-opacity=".3" stroke-width=".9"/>`;
    content +=
      '<path d="m57 215 15 13h40l-15-13m70 0 15 13h40l-15-13" fill="#0759b6"/><path d="m207 106 15 13v109l-15-13Z" fill="#0364c7"/></g>';
  } else if (id === "ready") {
    content =
      vaseShape("small", 13, 92, 0.62, "ready-cream") +
      vaseShape("big", 100, -6, 1, "ready-cream");
  } else {
    content =
      '<g transform="translate(180 153) rotate(-23)"><path d="M-80-65h110l50 35v125H-30l-50-35Z" fill="#526879"/><path d="M-80-65h110l50 35H-30Z" fill="#b3c2cc"/><path d="M-30-30H80V95H-30Z" fill="url(#prototype-gray)"/><path d="M-80-65-30-30V95l-50-35Z" fill="#668294"/><ellipse cx="25" cy="31" rx="32" ry="38" fill="#314b60"/><ellipse cx="31" cy="33" rx="24" ry="31" fill="#b4c4ce"/><path d="M18-7c-30 1-35 62-8 73-39-5-40-66 8-73" fill="#1d3448"/><circle cx="-7" cy="-12" r="4" fill="#203a4c"/><circle cx="64" cy="-12" r="4" fill="#203a4c"/><circle cx="-7" cy="77" r="4" fill="#203a4c"/><circle cx="64" cy="77" r="4" fill="#203a4c"/>';
    for (let i = 0; i < 22; i++)
      content += `<path d="M-80 ${-59 + i * 5.5}l50 35" stroke="#b6c9d6" stroke-opacity=".25" stroke-width=".7"/>`;
    content +=
      '</g><path d="M61 214v24h35m184-161V53h-35" stroke="#728b9b" fill="none" stroke-width="1" stroke-dasharray="3 4"/>';
  }
  el.innerHTML = svgStart(id) + content + "</svg>";
});

// Load the 3D renderer separately so navigation and theme controls are immediately usable.
import("./sculpture.js")
  .then(({ createSculpture }) =>
    createSculpture(document.getElementById("sculpture"), reducedMotion),
  )
  .catch(() => {
    // The local SVG remains visible when WebGL is unavailable.
  });
