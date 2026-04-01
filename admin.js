const ADMIN_PASSWORD = "Saurav@2026Secure";
let editingBlogId = null;
let editingProjectId = null;

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

function createActionButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-secondary";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

function itemRow(label, actions) {
  const row = document.createElement("div");
  row.className = "admin-item";
  const title = document.createElement("span");
  title.textContent = label;
  const actionWrap = document.createElement("div");
  actionWrap.className = "admin-item-actions";
  actions.forEach((action) => actionWrap.appendChild(action));
  row.append(title, actionWrap);
  return row;
}


function fillProjectForm(project) {
  const form = document.getElementById("project-form");
  form.elements.title.value = project.title;
  form.elements.description.value = project.description;
  form.elements.tech.value = Array.isArray(project.tech) ? project.tech.join(", ") : "";
  form.elements.image.value = project.image || "";
  form.elements.demo.value = project.demo || "";
  form.elements.source.value = project.source || "";
  editingProjectId = project.id;
  document.getElementById("project-submit-btn").textContent = "Update Project";
}

function resetProjectForm() {
  const form = document.getElementById("project-form");
  form.reset();
  editingProjectId = null;
  document.getElementById("project-submit-btn").textContent = "Add Project";
}

function renderProjectList() {
  const container = document.getElementById("project-list");
  const projects = getWorkingData().projects;
  container.innerHTML = "";
  projects.forEach((project, idx) => {
    container.appendChild(itemRow(`${idx + 1}. ${project.title}`, [
      createActionButton("Edit", () => fillProjectForm(project)),
      createActionButton("Delete", () => {
        const data = getWorkingData();
        data.projects = data.projects.filter((x) => x.id !== project.id);
        saveWorkingData(data);
        if (editingProjectId === project.id) resetProjectForm();
        renderProjectList();
      })
    ]));
  });
}

function fillBlogForm(post) {
  const form = document.getElementById("blog-form");
  form.elements.title.value = post.title;
  form.elements.date.value = post.date;
  form.elements.image.value = post.image || "";
  form.elements.excerpt.value = post.excerpt;
  form.elements.content.value = post.content || post.excerpt;
  editingBlogId = post.id;
  document.getElementById("blog-submit-btn").textContent = "Update Post";
}

function resetBlogForm() {
  const form = document.getElementById("blog-form");
  form.reset();
  editingBlogId = null;
  document.getElementById("blog-submit-btn").textContent = "Add Post";
}

function renderBlogList() {
  const container = document.getElementById("blog-list");
  const posts = getWorkingData().blogs;
  container.innerHTML = "";
  posts.forEach((post, idx) => {
    container.appendChild(itemRow(`${idx + 1}. ${post.title}`, [
      createActionButton("Edit", () => fillBlogForm(post)),
      createActionButton("Delete", () => {
        const data = getWorkingData();
        data.blogs = data.blogs.filter((x) => x.id !== post.id);
        saveWorkingData(data);
        if (editingBlogId === post.id) resetBlogForm();
        renderBlogList();
      })
    ]));
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
    id: editingProjectId || crypto.randomUUID(),
    title: formData.get("title").toString().trim(),
    description: formData.get("description").toString().trim(),
    tech: formData.get("tech").toString().split(",").map((t) => t.trim()).filter(Boolean),
    image: formData.get("image").toString().trim(),
    demo: formData.get("demo").toString().trim(),
    source: formData.get("source").toString().trim()
  };

  const data = getWorkingData();
  if (editingProjectId) {
    data.projects = data.projects.map((item) => (item.id === editingProjectId ? project : item));
  } else {
    data.projects = [project, ...data.projects];
  }
  saveWorkingData(data);
  resetProjectForm();
  renderProjectList();
});

document.getElementById("blog-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  const post = {
    id: editingBlogId || crypto.randomUUID(),
    title: formData.get("title").toString().trim(),
    date: formData.get("date").toString().trim(),
    image: formData.get("image").toString().trim(),
    excerpt: formData.get("excerpt").toString().trim(),
    content: formData.get("content").toString().trim()
  };

  const data = getWorkingData();
  if (editingBlogId) {
    data.blogs = data.blogs.map((item) => (item.id === editingBlogId ? post : item));
  } else {
    data.blogs = [post, ...data.blogs];
  }

  saveWorkingData(data);
  resetBlogForm();
  renderBlogList();
});

document.getElementById("reset-data").addEventListener("click", () => {
  window.PortfolioStore.resetDraft();
  location.reload();
});

document.getElementById("publish-btn").addEventListener("click", publishToGitHub);

showAdmin(false);
