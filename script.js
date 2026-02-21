const featuredProjects = [
  {
    name: "Webhook Processor",
    description: "Reliable webhook processing with validation, deduplication, and retries.",
    tags: ["Python", "APIs", "Reliability"],
    repoUrl: "https://github.com/aleksastajic/webhook-processor",
    readmeUrl: "https://github.com/aleksastajic/webhook-processor#readme"
  },
  {
    name: "Lite ERP Backend",
    description: "Backend for products, orders, and inventory with an audit trail.",
    tags: ["Java", "Spring Boot", "PostgreSQL"],
    repoUrl: "https://github.com/aleksastajic/lite-erp-backend",
    readmeUrl: "https://github.com/aleksastajic/lite-erp-backend#readme"
  },
  {
    name: "Task Manager",
    description: "Task management app with a Spring Boot API and React UI.",
    tags: ["Java", "React", "Full Stack"],
    repoUrl: "https://github.com/aleksastajic/spring-react-task-manager",
    readmeUrl: "https://github.com/aleksastajic/spring-react-task-manager#readme"
  }
];

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderFeaturedProjects() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  grid.innerHTML = "";

  featuredProjects.forEach(project => {
    const card = document.createElement("article");
    card.className = "card";

    const tags = project.tags
      .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("");

    card.innerHTML = `
      <h3>${escapeHtml(project.name)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <div class="project-tags">${tags}</div>
      <div class="meta">
        <a class="badge" href="${project.repoUrl}" target="_blank" rel="noopener noreferrer">Repo</a>
        <a class="badge" href="${project.readmeUrl}" target="_blank" rel="noopener noreferrer">README / Demo</a>
      </div>
    `;

    grid.appendChild(card);
  });
}

function initFooterYear() {
  const year = document.getElementById("footer-year");
  if (year) year.textContent = new Date().getFullYear();
}

// Aura background: inject soft blobs (CSS does the animation)
function initAuraBackground(){
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // remove previous aura if present
  const prev = document.getElementById('aura-bg'); if (prev) prev.remove();

  const container = document.createElement('div');
  container.id = 'aura-bg';
  container.setAttribute('aria-hidden', 'true');

  // create 4 blobs; CSS handles their float animation
  const blobs = [];
  for (let i=1;i<=4;i++){
    const b = document.createElement('div');
    b.className = `aura-blob b${i}`;
    container.appendChild(b);
    blobs.push(b);
  }

  document.body.appendChild(container);

  // Blobs rely on CSS float animations; cursor-follow was disabled to ensure consistent animation across browsers
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    renderFeaturedProjects();
    initFooterYear();
    initAuraBackground();
  });
} else {
  renderFeaturedProjects();
  initFooterYear();
  initAuraBackground();
}
