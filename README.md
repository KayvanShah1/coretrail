# CoreTrail

[![Build and publish CoreTrail](https://github.com/KayvanShah1/coretrail/actions/workflows/jekyll-gh-pages.yml/badge.svg)](https://github.com/KayvanShah1/coretrail/actions/workflows/jekyll-gh-pages.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-2ea44f?logo=github)](https://kayvanshah1.github.io/coretrail/)

> What interviews made me revisit.

A Jekyll handbook for technical interview revision across data, AI, machine learning, software engineering, and related topics, with light and dark themes.

**[Open CoreTrail →](https://kayvanshah1.github.io/coretrail/)**

## Screenshots

### Desktop: Home page (dark mode, 1440 px viewport)

[![CoreTrail desktop home page with Home, Subjects, Resources, and About navigation above the subject directory](app/assets/images/screenshots/desktop-home.png)](app/assets/images/screenshots/desktop-home.png)

### Mobile: SQL lesson (light mode)

<a href="app/assets/images/screenshots/mobile-lesson.png"><img src="app/assets/images/screenshots/mobile-lesson.png" alt="CoreTrail mobile Window frames lesson with the current header, page outline, and interactive frame explorer" width="390" /></a>

After visual changes, serve the site locally and recapture affected screenshots from `http://localhost:4000/coretrail/`. The desktop home image uses dark mode and a 2× device scale.

## Why I built it

A lot of my interview prep ended up inside ChatGPT.

One question turns into another and the same thread keeps running. Somewhere inside it is a good explanation I will probably need again. After enough chats, I was drowning in them.

I tried saving useful parts as Markdown too, but after a point that becomes another pile to organize and maintain. So I wanted one place where I could keep the parts worth coming back to.

```mermaid
flowchart LR
    A[Interview or work] --> B[Something feels rusty]
    B --> C[Revisit it]
    C --> D[Understand it better]
    D --> E[Keep what matters]
    E --> F[CoreTrail]
```

## Philosophy

This is mostly for things I have already learned once. I should be able to open a topic and quickly answer:

```mermaid
flowchart LR
    A[What is it?] --> B[When does it matter?]
    B --> C[What are the trade-offs?]
    C --> D[What usually goes wrong?]
    D --> E[Example]
```

If I need more depth, it should be there.
If I only need a reminder, I should not have to read a chapter.

## How I want to use it

Before an interview, I mostly use CoreTrail to skim things I already know but do not want to recall from scratch during the round.

After an interview, I usually come back to whatever made me hesitate, overthink, or realize I had a gap.

The same happens while building. If I run into something worth understanding properly, I would rather keep a useful note than have to rediscover it a few months later.

## What's here

SQL remains the most developed section. AI Engineering now includes an inference-to-production-serving trail, and Infrastructure & DevOps covers the reusable container, Kubernetes, scaling, and observability mechanics behind it.

CoreTrail is meant to grow across:

- Data Engineering
- Machine Learning
- AI Engineering
- Infrastructure & DevOps
- System Design
- DSA

The structure keeps the same idea: **fast recall first, depth when needed.**

### Included

- SQL currently has 83 topic pages across 15 chapters, plus chapter overviews.
- AI Engineering covers LLM inference, KV cache, continuous batching, inference engines, replicas/parallelism, deployment, autoscaling, failures, and serving observability.
- Infrastructure & DevOps covers containers, GPU access, Kubernetes workload/network/storage/health primitives, autoscaling layers, and telemetry.
- Machine Learning includes a bridge comparing conventional model serving with LLM serving.
- Expandable navigation, page outlines, and full-text search with Ctrl/Cmd K.
- Search metadata supports aliases, tools, keywords, and interview-style queries without rendering tag clutter; pages also emit DocSearch-friendly metadata and a sitemap.
- Ranked search results show highlighted matching passages; the sun/moon toggle remembers your theme.
- Copyable SQL, expandable answers, problem filters, and an interactive window-frame explorer.
- PostgreSQL-first examples with selected BigQuery/MySQL differences.
- A filterable practice directory links 12 questions from StrataScratch, LeetCode, and DataLemur to related lessons.
- Native PostgreSQL labs use 120,000 orders and 90,000 events to check index access, date predicates, and partition pruning.

## A note on AI

A lot of the revisiting now happens through ChatGPT.

The problem is that the good parts get buried very quickly. Threads just keep growing, topics get mixed together, and after a while even saving useful chats as Markdown stops being worth the effort.

**CoreTrail** is partly my answer to that.

I still use AI heavily to explore and question things. I just do not want the useful parts to live only inside old chats. Codex also helps me build and maintain the site. The notes themselves still come from the things I actually had to revisit.

## Stack

![Jekyll](https://img.shields.io/badge/Jekyll-CC0000?logo=jekyll&logoColor=white)
![Liquid](https://img.shields.io/badge/Liquid-67B8DE?logo=shopify&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?logo=markdown&logoColor=000)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

Jekyll + Liquid, Markdown, custom CSS, vanilla JavaScript, PostgreSQL/PGlite, Playwright, and GitHub Actions.

## Repository structure

```text
app/
  templates/          # Liquid layouts and reusable includes
  subjects/           # Subject content
    collections/      # Jekyll lesson collections (_sql, _ml, _ai, _infra)
    <subject>/index.md # Subject landing pages
  _data/              # Subject, chapter, and practice metadata
  _sass/              # Stylesheet partials
  assets/             # JavaScript, CSS entry point, images, and SQL fixtures
  index.html          # Site home
  search.json         # Generated local search index template
  sitemap.xml         # Crawlable published routes
  pages/404.html      # Not-found page, published at /404.html

docs/                 # Content coverage and validation notes
scripts/              # Content and SQL checks
tests/                # Search regression tests
_config.yml           # Jekyll configuration; source is app/
```

Subject landing pages live in `app/subjects/<subject>/index.md`. Published lessons live in `app/subjects/collections/_sql/`, `_ml/`, `_ai/`, and `_infra/`. Source locations are independent of public routes such as `/sql/windows/frames/` and `/ai-engineering/production/autoscaling/`.

## Run locally

With Docker Desktop running, start the site with:

```sh
docker compose up --build
```

Open [localhost:4000](http://localhost:4000/coretrail/). Compose mounts `app/` and `_config.yml`; changes to pages, styles, and scripts rebuild the site and refresh the browser. Restart the service after changing `_config.yml`. Stop it with `docker compose down`.

To preview the production image, build and run the static site with:

```sh
docker compose up --build production
```

Open [localhost:8080](http://localhost:8080/coretrail/). This image is built with `Dockerfile.prod` and serves the generated site through Nginx. It does not rebuild when source files change; run the command again with `--build` after edits. Stop it with `docker compose --profile production down`. The default `docker compose up --build` continues to use `Dockerfile.dev` for live development. GitHub Pages publishing still uses its existing workflow.

For a local Ruby installation, use Ruby 3.3 with Bundler:

```sh
bundle install
bundle exec jekyll serve --baseurl /coretrail
```

Open [localhost:4000 →](http://localhost:4000/coretrail/)

Run the check with:

```sh
npm ci
npm test
```

Performance-plan checks use PostgreSQL:

```sh
npm run test:plans
```

See [CONTRIBUTING.md](CONTRIBUTING.md) to add a lesson, [CONTENT_COVERAGE.md](docs/CONTENT_COVERAGE.md) for the content map, and [VALIDATION.md](docs/VALIDATION.md) for check scope.

## Deployment

GitHub Actions builds pull requests and pushes to main or site/**. Only successful main-branch builds deploy. Feature builds upload a site-preview artifact for review. Push and pull-request triggers skip changes limited to `docs/**`, `README.md`, `CONTRIBUTING.md`, and `LICENSE`. Lesson Markdown still triggers checks and builds; manual workflow runs remain available.

## Direction

I do not want CoreTrail to become a dump of everything I have ever learned.
I want it to stay useful when I need to get something back into my head quickly.

```mermaid
flowchart LR
    A[Learn] --> B[Use]
    B --> C[Forget parts]
    C --> D[Need it again]
    D --> E[Revisit]
    E --> B
```

---

© 2026 Kayvan Shah. All rights reserved. Built with Codex.
