const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const storedTheme = localStorage.getItem("theme");

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  themeMeta.setAttribute("content", theme === "dark" ? "#071821" : "#f7f0df");
}

applyTheme(storedTheme || "dark");

themeButton.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);
});

const filterButtons = [...document.querySelectorAll(".filter-button")];
const postRows = [...document.querySelectorAll(".post-row")];
const emptyState = document.querySelector(".empty-state");

function filterPosts({ kind = "all", query = "" } = {}) {
  let visible = 0;
  const normalizedQuery = query.trim().toLowerCase();

  postRows.forEach((post) => {
    const matchesKind = kind === "all" || post.dataset.kind === kind;
    const searchableText = `${post.dataset.search} ${post.textContent}`.toLowerCase();
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    const shouldShow = matchesKind && matchesQuery;
    post.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  emptyState.hidden = visible !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filterPosts({ kind: button.dataset.filter });
  });
});

const searchDialog = document.querySelector(".search-dialog");
const searchTrigger = document.querySelector(".search-trigger");
const searchInput = searchDialog?.querySelector("input");

function openSearch() {
  if (!searchDialog || !searchInput) return;
  if (!searchDialog.open) searchDialog.showModal();
  requestAnimationFrame(() => searchInput.focus());
}

function closeSearch() {
  if (!searchDialog || !searchInput) return;
  searchDialog.close();
  searchInput.value = "";
  filterButtons.forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
  filterPosts();
}

searchTrigger?.addEventListener("click", openSearch);
searchDialog?.addEventListener("close", closeSearch);
searchDialog?.addEventListener("click", (event) => {
  if (event.target === searchDialog) closeSearch();
});
searchInput?.addEventListener("input", () => {
  filterButtons.forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
  filterPosts({ query: searchInput.value });
});

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    openSearch();
  }
});

const navLinks = [...document.querySelectorAll(".main-nav a")];
const observedSections = [...document.querySelectorAll("#featured, #write-ups, #researches, #about")];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const active = entries.find((entry) => entry.isIntersecting);
    if (!active) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${active.target.id}`));
  },
  { rootMargin: "-20% 0px -65%", threshold: 0 }
);

observedSections.forEach((section) => sectionObserver.observe(section));

const articleTocLinks = [...document.querySelectorAll(".article-toc a[href^='#']")];
const articleSections = articleTocLinks
  .map((link) => document.querySelector(link.hash))
  .filter(Boolean);

function updateArticleToc() {
  if (!articleSections.length) return;

  const readingLine = Math.min(220, window.innerHeight * 0.3);
  let currentSection = articleSections[0];

  articleSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= readingLine) currentSection = section;
  });

  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    currentSection = articleSections.at(-1);
  }

  articleTocLinks.forEach((link) => {
    const isCurrent = link.hash === `#${currentSection.id}`;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

let articleTocFrame;
function queueArticleTocUpdate() {
  if (articleTocFrame) return;
  articleTocFrame = requestAnimationFrame(() => {
    updateArticleToc();
    articleTocFrame = null;
  });
}

if (articleSections.length) {
  updateArticleToc();
  window.addEventListener("scroll", queueArticleTocUpdate, { passive: true });
  window.addEventListener("resize", queueArticleTocUpdate);
}
