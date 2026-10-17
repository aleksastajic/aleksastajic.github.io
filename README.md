# Aleksa Stajić - Portfolio

A lightweight, static portfolio for GitHub Pages. Built with semantic HTML, responsive CSS, and a small optional script to keep the footer year current. No build step, external fonts, or runtime dependencies.

## Local preview

From this directory, run `python -m http.server 8000` and open http://localhost:8000.

## Content

- `index.html`: profile, experience, curated projects, skills, and contact links. All content works without JavaScript.
- `styles.css`: dark theme, responsive layouts, and keyboard focus styles.
- `script.js`: optional footer year update.
- `cv/resume.pdf`: downloadable CV.
- `assets/favicon.svg`: site icon.
- `projects.json`: supplementary repository metadata, refreshed by `.github/workflows/generate_projects.yml`. The page does not fetch this file; edit the curated cards in `index.html` to update featured projects.

## Deployment

Serve the repository root through GitHub Pages. `.nojekyll` keeps the site as plain static files. All local asset paths are relative, so the site also works under a project subpath.
