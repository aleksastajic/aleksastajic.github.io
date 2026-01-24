// Profile info
const profile = {
  displayName: "Aleksa Stajić",
  tagline: "Backend & full-stack engineer — Java, Spring Boot, systems & APIs.",
  bio: "I design and implement reliable backend systems with a focus on data integrity, idempotent operations, and clean APIs.",
  githubUrl: "https://github.com/aleksastajic",
  linkedinUrl: "https://www.linkedin.com/in/aleksastajic",
  email: "stajic1210@gmail.com",
};

// Projects to show
const reposToShow = [
  "aleksastajic/lite-erp-backend",
  "aleksastajic/spring-react-task-manager",
  "aleksastajic/webhook-processor",
  "aleksastajic/banking-ledger-api"
];

// Optional GitHub token for higher rate limits. Don't commit tokens.
const GITHUB_TOKEN = "";

// UI wiring
const setIf = (id, fn) => { const el = document.getElementById(id); if (el) fn(el); };
setIf('hero-name', el => el.textContent = profile.displayName);
setIf('hero-tagline', el => el.textContent = profile.tagline);
setIf('hero-bio', el => el.textContent = profile.bio);
setIf('github-link', el => el.href = profile.githubUrl);
setIf('link-linkedin', el => el.href = profile.linkedinUrl);
setIf('profile-github', el => el.href = profile.githubUrl);
setIf('contact-email', el => el.href = `mailto:${profile.email}`);
setIf('download-resume', el => el.href = "/resume.pdf");
setIf('footer-year', el => el.textContent = new Date().getFullYear());
setIf('footer-name', el => el.textContent = profile.displayName);

// GitHub API helper
async function githubFetch(path) {
  // Include topics in the response
  const headers = { 'Accept': 'application/vnd.github.mercy-preview+json, application/vnd.github.v3+json' };
  if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  try {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (!res.ok) {
      console.warn('GitHub API request failed', path, res.status);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('GitHub fetch error', err);
    return null;
  }
}

// Render projects (cache + skeletons)
const grid = document.getElementById('projects-grid');
const CACHE_KEY = 'gh_repos_cache_v1';
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function showSkeletons(count = reposToShow.length) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'card skeleton';
    s.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem">
        <div style="width:48px;height:48px;border-radius:8px;background:rgba(255,255,255,0.04)"></div>
        <div style="flex:1">
          <div style="height:14px;background:rgba(255,255,255,0.04);margin-bottom:8px;border-radius:6px;width:60%"></div>
          <div style="height:10px;background:rgba(255,255,255,0.03);border-radius:6px;width:40%"></div>
        </div>
      </div>
    `;
    grid.appendChild(s);
  }
}

async function renderRepos() {
  showSkeletons();

  // Prefer a local `projects.json` (generated at build time) to avoid runtime API calls
  try {
    const staticRes = await fetch('/projects.json', { cache: 'no-cache' });
    if (staticRes.ok) {
      const staticData = await staticRes.json();
      if (Array.isArray(staticData) && staticData.length) {
        window.__repos = staticData;
        return displayRepos(staticData);
      }
    }
  } catch (e) {
    // ignore and fall back to live GitHub API
  }

  // Try localStorage cache
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        window.__repos = parsed.data;
        return displayRepos(parsed.data);
      }
    }
  } catch (err) { /* ignore parse errors */ }

  const promises = reposToShow.map(slug => githubFetch(`/repos/${slug}`));
  const results = await Promise.all(promises);

  const repos = results
    .map((r, i) => {
      if (!r) return null;
      return {
        slug: reposToShow[i],
        name: r.name,
        description: r.description || "",
        html_url: r.html_url,
        language: r.language || "Unknown",
        stargazers_count: r.stargazers_count || 0,
        homepage: r.homepage || "",
        owner: r.owner ? { login: r.owner.login, avatar: r.owner.avatar_url, url: r.owner.html_url } : null,
        pushed_at: r.pushed_at || null,
        topics: Array.isArray(r.topics) ? r.topics : []
      };
    })
    .filter(Boolean);

  // cache the result in localStorage
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: repos })); } catch (e) { /* ignore */ }

  window.__repos = repos;
  displayRepos(repos);
}

function displayRepos(repos) {
  grid.innerHTML = "";
  if (!repos.length) {
    grid.innerHTML = `<p class="muted">No projects found. Check repo names in <code>script.js</code>.</p>`;
    return;
  }

  function timeAgo(iso){
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const sec = Math.floor(diff/1000);
    const min = Math.floor(sec/60);
    const hr = Math.floor(min/60);
    const day = Math.floor(hr/24);
    const month = Math.floor(day/30);
    const year = Math.floor(day/365);
    if (year>0) return `${year} year${year>1?'s':''} ago`;
    if (month>0) return `${month} month${month>1?'s':''} ago`;
    if (day>0) return `${day} day${day>1?'s':''} ago`;
    if (hr>0) return `${hr} hour${hr>1?'s':''} ago`;
    if (min>0) return `${min} minute${min>1?'s':''} ago`;
    return `${sec} second${sec>1?'s':''} ago`;
  }

  repos.forEach(r => {
    const card = document.createElement('div');
    card.className = 'card';
    const avatar = r.owner && r.owner.avatar ? `<img class="repo-avatar" src="${r.owner.avatar}" alt="${escapeHtml(r.owner.login)} avatar" width="48" height="48"/>` : `<div class="avatar-fallback">${escapeHtml((r.name||'')[0])}</div>`;

    // Limit topics shown to at most 5; show a +N badge if there are more
    let topicsHtml = '';
    if (r.topics && r.topics.length) {
      const shown = r.topics.slice(0,5);
      let inner = shown.map(t => `<span class="topic">${escapeHtml(t)}</span>`).join('');
      if (r.topics.length > 5) inner += `<span class="topic">+${r.topics.length - 5}</span>`;
      topicsHtml = `<div class="topics">${inner}</div>`;
    }

    card.innerHTML = `
      <div style="display:flex;gap:0.8rem;align-items:center">
        ${avatar}
        <div style="flex:1">
          <h3 style="margin:0;">${escapeHtml(r.name)} <span class="badge">${escapeHtml(r.language)}</span></h3>
          <p style="margin:0.35rem 0;color:var(--muted);font-size:0.95rem">${escapeHtml(r.description)}</p>
          ${topicsHtml}
          <div class="meta">
            <a class="badge" href="${r.html_url}" target="_blank" rel="noopener noreferrer">Repo</a>
            ${r.homepage ? `<a class="badge" href="${r.homepage}" target="_blank" rel="noopener noreferrer">Live</a>` : ''}
            ${r.pushed_at ? `<span style="margin-left:auto;color:var(--muted);font-size:0.9rem">Updated ${timeAgo(r.pushed_at)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(s){
  return String(s || '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

renderRepos().catch(err => {
  console.error('Failed to load repos', err);
  grid.innerHTML = `<p class="muted">Failed to fetch projects from GitHub. Check console for details.</p>`;
});

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

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAuraBackground); else initAuraBackground();
