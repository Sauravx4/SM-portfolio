const FALLBACK_DATA = {
  brand: {
    name: "sauravcodease",
    logoUrl: "assets/logo.png"
  },
  projects: [
    {
      id: "local-p1",
      title: "InsightFlow Analytics Dashboard",
      description: "A metrics-focused SaaS dashboard with custom data visualizations and role-based reporting.",
      tech: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      demo: "#",
      source: "#"
    }
  ],
  blogs: [
    {
      id: "local-b1",
      title: "Designing Interfaces That Earn User Trust",
      date: "March 11, 2026",
      excerpt: "Practical UX heuristics and visual clarity principles to make products feel reliable and intuitive."
    }
  ]
};

const STORAGE_KEY = "portfolio_content_local";
const CONTENT_FILE = "content.json";
const dataState = { ...FALLBACK_DATA };

async function fetchPublishedContent() {
  try {
    const response = await fetch(`${CONTENT_FILE}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Published content unavailable");
    const payload = await response.json();
    if (!Array.isArray(payload.projects) || !Array.isArray(payload.blogs)) throw new Error("Invalid content format");
    payload.brand = payload.brand || FALLBACK_DATA.brand;
    return payload;
  } catch {
    return null;
  }
}

function loadLocalDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.blogs)) return null;
    parsed.brand = parsed.brand || FALLBACK_DATA.brand;
    return parsed;
  } catch {
    return null;
  }
}

function saveLocalDraft(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function initData() {
  const published = await fetchPublishedContent();
  const localDraft = loadLocalDraft();
  Object.assign(dataState, published || localDraft || FALLBACK_DATA);
}

function headerTemplate(activePage) {
  const links = [["Home", "index.html"], ["Projects", "projects.html"], ["Blog", "blog.html"], ["Contact", "contact.html"]];

  return `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="Go to home page">
          <img class="logo logo-img" src="${dataState.brand.logoUrl}" alt="${dataState.brand.name} logo" loading="lazy" />
          <span>${dataState.brand.name}</span>
        </a>
        <nav aria-label="Primary navigation" class="nav-links">
          ${links.map(([label, href]) => `<a class="${label === activePage ? "active" : ""}" href="${href}">${label}</a>`).join("")}
        </nav>
      </div>
    </header>
  `;
}

function footerTemplate() {
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <small>© ${new Date().getFullYear()} Saurav Mourya. Crafted with precision.</small>
        <nav aria-label="Social links" class="socials">
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:hello@saurav.dev">Email</a>
          <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
          <a href="admin.html">Admin</a>
        </nav>
      </div>
    </footer>
  `;
}

function projectCard(project) {
  return `<article class="card reveal"><img class="thumb" src="${project.image}" alt="${project.title} preview image" loading="lazy"><div class="card-body"><h3>${project.title}</h3><p class="muted">${project.description}</p><div class="tech-stack">${project.tech.map((item) => `<span class="tag">${item}</span>`).join("")}</div><div class="links-row"><a class="btn btn-secondary" href="${project.demo}" target="_blank" rel="noreferrer">Live Demo</a><a class="btn btn-secondary" href="${project.source}" target="_blank" rel="noreferrer">Source Code</a></div></div></article>`;
}

function blogCard(post) {
  return `<article class="card reveal"><div class="card-body"><p class="blog-meta">${post.date}</p><h3>${post.title}</h3><p class="muted">${post.excerpt}</p><a class="btn btn-secondary" href="#">Read More</a></div></article>`;
}

function initSharedLayout(activePage) {
  document.body.insertAdjacentHTML("afterbegin", headerTemplate(activePage));
  document.body.insertAdjacentHTML("beforeend", footerTemplate());
  document.body.insertAdjacentHTML("beforeend", '<button class="fab" aria-label="Get in touch" title="Get in Touch" onclick="location.href=\'contact.html\'">✉</button>');
}

function renderProjects(selector, limit = dataState.projects.length) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = dataState.projects.slice(0, limit).map(projectCard).join("");
}

function renderBlog(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = dataState.blogs.map(blogCard).join("");
}

function renderProjectPublisher(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  const projects = dataState.projects;
  const doubled = [...projects, ...projects];
  target.innerHTML = doubled.map((project) => `
    <article class="publisher-item">
      <img src="${project.image}" alt="${project.title} thumbnail" loading="lazy" />
      <div class="publisher-caption">${project.title}</div>
    </article>
  `).join("");
}

function initRevealAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

async function initPortfolioPage({ activePage, projectSelector, projectLimit, blogSelector, publisherSelector }) {
  await initData();
  initSharedLayout(activePage);
  if (projectSelector) renderProjects(projectSelector, projectLimit);
  if (blogSelector) renderBlog(blogSelector);
  if (publisherSelector) renderProjectPublisher(publisherSelector);
  initRevealAnimation();
}

window.PortfolioStore = {
  getData: () => JSON.parse(JSON.stringify(dataState)),
  setData: (payload) => {
    dataState.projects = payload.projects;
    dataState.blogs = payload.blogs;
    saveLocalDraft(dataState);
  },
  resetDraft: () => localStorage.removeItem(STORAGE_KEY)
};
