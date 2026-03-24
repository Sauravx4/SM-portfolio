const ADMIN_PASSWORD = "Saurav@2026Secure";

function showAdmin(isVisible) {
  document.getElementById("login-view").classList.toggle("hidden", isVisible);
  document.getElementById("admin-view").classList.toggle("hidden", !isVisible);
}

function getWorkingData() {
  return window.PortfolioStore.getData();
}

function saveWorkingData(payload) {
  window.PortfolioStore.setData(payload);
}

function itemRow(label, onDelete) {
  const row = document.createElement("div");
  row.className = "admin-item";
  row.innerHTML = `<span>${label}</span><button type="button" class="btn btn-secondary">Delete</button>`;
  row.querySelector("button").addEventListener("click", onDelete);
  return row;
}

function renderProjectList() {
  const container = document.getElementById("project-list");
  const projects = getWorkingData().projects;
  container.innerHTML = "";
  projects.forEach((project, idx) => {
    container.appendChild(itemRow(`${idx + 1}. ${project.title}`, () => {
      const data = getWorkingData();
      data.projects = data.projects.filter((x) => x.id !== project.id);
      saveWorkingData(data);
      renderProjectList();
    }));
  });
}

function renderBlogList() {
  const container = document.getElementById("blog-list");
  const posts = getWorkingData().blogs;
  container.innerHTML = "";
  posts.forEach((post, idx) => {
    container.appendChild(itemRow(`${idx + 1}. ${post.title}`, () => {
      const data = getWorkingData();
      data.blogs = data.blogs.filter((x) => x.id !== post.id);
      saveWorkingData(data);
      renderBlogList();
    }));
  });
}

async function publishToGitHub() {
  const form = document.getElementById("publish-form");
  const data = new FormData(form);
  const owner = data.get("owner").toString().trim();
  const repo = data.get("repo").toString().trim();
  const branch = data.get("branch").toString().trim();
  const token = data.get("token").toString().trim();
  const contentPath = "content.json";

  const metaResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${contentPath}?ref=${branch}`,
    { headers: { Authorization: `Bearer ${token}` } });

  if (!metaResponse.ok) {
    alert("Unable to fetch existing content.json. Check owner/repo/branch/token permissions.");
    return;
  }

  const meta = await metaResponse.json();
  const payload = getWorkingData();
  const body = {
    message: "Update portfolio content from admin dashboard",
    content: btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2)))),
    sha: meta.sha,
    branch
  };

  const putResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${contentPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!putResponse.ok) {
    alert("Publish failed. Please verify token has Contents: Read and Write permission.");
    return;
  }

  alert("Published successfully. GitHub Pages may take 1-2 minutes to refresh globally.");
}

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = document.getElementById("admin-password").value;
  if (value !== ADMIN_PASSWORD) {
    alert("Invalid password");
    return;
  }
  showAdmin(true);
  renderProjectList();
  renderBlogList();
});

document.getElementById("project-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const project = {
    id: crypto.randomUUID(),
    title: formData.get("title").toString().trim(),
    description: formData.get("description").toString().trim(),
    tech: formData.get("tech").toString().split(",").map((t) => t.trim()).filter(Boolean),
    image: formData.get("image").toString().trim(),
    demo: formData.get("demo").toString().trim(),
    source: formData.get("source").toString().trim()
  };

  const data = getWorkingData();
  data.projects = [project, ...data.projects];
  saveWorkingData(data);
  event.currentTarget.reset();
  renderProjectList();
});

document.getElementById("blog-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const post = {
    id: crypto.randomUUID(),
    title: formData.get("title").toString().trim(),
    date: formData.get("date").toString().trim(),
    excerpt: formData.get("excerpt").toString().trim()
  };

  const data = getWorkingData();
  data.blogs = [post, ...data.blogs];
  saveWorkingData(data);
  event.currentTarget.reset();
  renderBlogList();
});

document.getElementById("reset-data").addEventListener("click", () => {
  window.PortfolioStore.resetDraft();
  location.reload();
});

document.getElementById("publish-btn").addEventListener("click", publishToGitHub);

showAdmin(false);
