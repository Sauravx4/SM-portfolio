function itemRow(label, onDelete) {
  const row = document.createElement("div");
  row.className = "admin-item";
  row.innerHTML = `<span>${label}</span><button type="button" class="btn btn-secondary">Delete</button>`;
  row.querySelector("button").addEventListener("click", onDelete);
  return row;
}

function renderProjectList() {
  const container = document.getElementById("project-list");
  const projects = window.PortfolioStore.getProjects();
  container.innerHTML = "";
  projects.forEach((project, idx) => {
    container.appendChild(
      itemRow(`${idx + 1}. ${project.title}`, () => {
        const updated = window.PortfolioStore.getProjects().filter((x) => x.id !== project.id);
        window.PortfolioStore.saveProjects(updated);
        renderProjectList();
      })
    );
  });
}

function renderBlogList() {
  const container = document.getElementById("blog-list");
  const posts = window.PortfolioStore.getBlogs();
  container.innerHTML = "";
  posts.forEach((post, idx) => {
    container.appendChild(
      itemRow(`${idx + 1}. ${post.title}`, () => {
        const updated = window.PortfolioStore.getBlogs().filter((x) => x.id !== post.id);
        window.PortfolioStore.saveBlogs(updated);
        renderBlogList();
      })
    );
  });
}

document.getElementById("project-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);

  const project = {
    id: crypto.randomUUID(),
    title: data.get("title").toString().trim(),
    description: data.get("description").toString().trim(),
    tech: data.get("tech").toString().split(",").map((t) => t.trim()).filter(Boolean),
    image: data.get("image").toString().trim(),
    demo: data.get("demo").toString().trim(),
    source: data.get("source").toString().trim()
  };

  const updated = [project, ...window.PortfolioStore.getProjects()];
  window.PortfolioStore.saveProjects(updated);
  event.currentTarget.reset();
  renderProjectList();
});

document.getElementById("blog-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);

  const post = {
    id: crypto.randomUUID(),
    title: data.get("title").toString().trim(),
    date: data.get("date").toString().trim(),
    excerpt: data.get("excerpt").toString().trim()
  };

  const updated = [post, ...window.PortfolioStore.getBlogs()];
  window.PortfolioStore.saveBlogs(updated);
  event.currentTarget.reset();
  renderBlogList();
});

document.getElementById("reset-data").addEventListener("click", () => {
  window.PortfolioStore.reset();
  renderProjectList();
  renderBlogList();
});

renderProjectList();
renderBlogList();
