const PROJECTS = [
  {
    title: "InsightFlow Analytics Dashboard",
    description: "A metrics-focused SaaS dashboard with custom data visualizations and role-based reporting.",
    tech: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    demo: "#",
    source: "#"
  },
  {
    title: "Nova Commerce Experience",
    description: "High-converting e-commerce interface optimized for performance, accessibility, and mobile-first UX.",
    tech: ["Next.js", "Tailwind", "Stripe", "Vercel"],
    image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
    demo: "#",
    source: "#"
  },
  {
    title: "BrandForge Design System",
    description: "Scalable design system with reusable components and documentation for cross-team consistency.",
    tech: ["Figma", "Storybook", "Vue", "SCSS"],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    demo: "#",
    source: "#"
  },
  {
    title: "Pulse Productivity Suite",
    description: "Productivity app integrating notes, goals, and team collaboration with realtime updates.",
    tech: ["React Native", "Firebase", "Cloud Functions"],
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80",
    demo: "#",
    source: "#"
  }
];

const BLOG_POSTS = [
  {
    title: "Designing Interfaces That Earn User Trust",
    date: "March 11, 2026",
    excerpt: "Practical UX heuristics and visual clarity principles to make products feel reliable and intuitive."
  },
  {
    title: "Performance Budgets for Modern Front-End Teams",
    date: "February 26, 2026",
    excerpt: "A framework for keeping websites fast with measurable budgets, CI checks, and asset discipline."
  },
  {
    title: "How I Structure Scalable Portfolio Projects",
    date: "January 19, 2026",
    excerpt: "My repeatable process for moving from concept to production-ready side projects with clean architecture."
  }
];

function headerTemplate(activePage) {
  const links = [
    ["Home", "index.html"],
    ["Projects", "projects.html"],
    ["Blog", "blog.html"],
    ["Contact", "contact.html"]
  ];

  return `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="Go to home page">
          <span class="logo">S</span>
          <span>Saurav Mourya</span>
        </a>
        <nav aria-label="Primary navigation" class="nav-links">
          ${links
            .map(([label, href]) => `<a class="${label === activePage ? "active" : ""}" href="${href}">${label}</a>`)
            .join("")}
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
        </nav>
      </div>
    </footer>
  `;
}

function projectCard(project) {
  return `
    <article class="card reveal">
      <img class="thumb" src="${project.image}" alt="${project.title} preview image" loading="lazy">
      <div class="card-body">
        <h3>${project.title}</h3>
        <p class="muted">${project.description}</p>
        <div class="tech-stack">
          ${project.tech.map((item) => `<span class="tag">${item}</span>`).join("")}
        </div>
        <div class="links-row">
          <a class="btn btn-secondary" href="${project.demo}" target="_blank" rel="noreferrer">Live Demo</a>
          <a class="btn btn-secondary" href="${project.source}" target="_blank" rel="noreferrer">Source Code</a>
        </div>
      </div>
    </article>
  `;
}

function blogCard(post) {
  return `
    <article class="card reveal">
      <div class="card-body">
        <p class="blog-meta">${post.date}</p>
        <h3>${post.title}</h3>
        <p class="muted">${post.excerpt}</p>
        <a class="btn btn-secondary" href="#">Read More</a>
      </div>
    </article>
  `;
}

function initSharedLayout(activePage) {
  document.body.insertAdjacentHTML("afterbegin", headerTemplate(activePage));
  document.body.insertAdjacentHTML("beforeend", footerTemplate());
  document.body.insertAdjacentHTML(
    "beforeend",
    '<button class="fab" aria-label="Get in touch" title="Get in Touch" onclick="location.href=\'contact.html\'">✉</button>'
  );
}

function renderProjects(selector, limit = PROJECTS.length) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = PROJECTS.slice(0, limit).map(projectCard).join("");
}

function renderBlog(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.innerHTML = BLOG_POSTS.map(blogCard).join("");
}

function initRevealAnimation() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initPortfolioPage({ activePage, projectSelector, projectLimit, blogSelector }) {
  initSharedLayout(activePage);
  if (projectSelector) renderProjects(projectSelector, projectLimit);
  if (blogSelector) renderBlog(blogSelector);
  initRevealAnimation();
}
