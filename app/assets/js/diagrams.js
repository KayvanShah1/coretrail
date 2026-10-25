// Load the pinned renderer only on pages that actually contain diagrams.
const figures = [...document.querySelectorAll('.diagram')].map((figure) => ({
  figure,
  source: figure.querySelector('.diagram-source').content.textContent.trim(),
  canvas: figure.querySelector('.diagram-canvas'),
  fallback: figure.querySelector('.diagram-fallback'),
  hint: figure.querySelector('.diagram-scroll-hint'),
  state: '',
}));

if (figures.length) {
  try {
    const [{ default: mermaid }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs'),
      document.fonts.ready,
    ]);
    let serial = 0;
    let rendering = false;
    let pending = false;

    async function renderDiagrams() {
      pending = true;
      if (rendering) return;
      rendering = true;
      try {
        while (pending) {
          pending = false;
          const theme = document.documentElement.dataset.theme || 'dark';
          const styles = getComputedStyle(document.documentElement);
          const color = (name) => styles.getPropertyValue(name).trim();
          mermaid.initialize({
            startOnLoad: false,
            // Sources are repository-authored. Enable their ordinary href links;
            // diagrams contain no callbacks or reader-supplied markup.
            securityLevel: 'loose',
            theme: 'base',
            fontFamily: 'DM Sans, sans-serif',
            themeVariables: {
              darkMode: theme === 'dark',
              fontSize: '15px',
              primaryColor: color('--surface'),
              primaryTextColor: color('--text'),
              primaryBorderColor: color('--route-line'),
              lineColor: color('--accent'),
              background: color('--bg'),
            },
            flowchart: { htmlLabels: false, curve: 'linear', padding: 12, rankSpacing: 28 },
          });
          for (const item of figures) {
            let direction = item.figure.clientWidth < 700 ? 'TB' : 'LR';
            const state = `${theme}:${item.figure.clientWidth}`;
            if (item.state === state) continue;
            const source = () =>
              item.source.replace(/^flowchart\s+(LR|TB)\b/, `flowchart ${direction}`);
            try {
              let result = await mermaid.render(`diagram-${++serial}`, source());
              const naturalWidth = new DOMParser()
                .parseFromString(result.svg, 'text/html')
                .querySelector('svg').viewBox.baseVal.width;
              const padding = getComputedStyle(item.figure);
              const availableWidth =
                item.figure.clientWidth -
                parseFloat(padding.paddingLeft) -
                parseFloat(padding.paddingRight) -
                12;
              // Long pipelines should turn vertically rather than shrink their
              // labels to an unreadable size, even on a desktop viewport.
              if (direction === 'LR' && naturalWidth > availableWidth * 1.1) {
                direction = 'TB';
                result = await mermaid.render(`diagram-${++serial}`, source());
              }
              const { svg, bindFunctions } = result;
              item.canvas.innerHTML = svg;
              const graphic = item.canvas.querySelector('svg');
              graphic.setAttribute('role', 'group');
              graphic.setAttribute('aria-label', item.figure.getAttribute('aria-label'));
              item.canvas.querySelectorAll('a').forEach((link) => {
                link.setAttribute(
                  'href',
                  link.getAttribute('xlink:href') || link.getAttribute('href'),
                );
                link.setAttribute('role', 'link');
                link.setAttribute('tabindex', '0');
                link.setAttribute('aria-label', link.textContent.trim());
              });
              bindFunctions?.(item.canvas);
              item.canvas.hidden = false;
              item.fallback.hidden = true;
              // Preserve readable labels when a branched graph cannot fit the column.
              // The canvas scrolls within the page instead of shrinking the whole SVG.
              const minimumWidth = Math.ceil(graphic.viewBox.baseVal.width * 0.85);
              graphic.style.minWidth = minimumWidth + 'px';
              // A narrow vertical flow should not grow to the full article width.
              graphic.style.maxWidth = Math.ceil(graphic.viewBox.baseVal.width) + 'px';
              const scrollable = item.canvas.scrollWidth > item.canvas.clientWidth + 2;
              item.canvas.dataset.scrollable = String(scrollable);
              item.canvas.setAttribute('role', 'region');
              item.canvas.setAttribute(
                'aria-label',
                item.figure.getAttribute('aria-label') +
                  (scrollable ? '. Scroll horizontally to view the complete diagram.' : ''),
              );
              item.canvas.tabIndex = scrollable ? 0 : -1;
              item.hint.hidden = !scrollable;
              item.figure.dataset.direction = direction;
              item.state = state;
            } catch {
              item.canvas.hidden = true;
              item.fallback.hidden = false;
            }
          }
        }
      } finally {
        rendering = false;
      }
    }

    await renderDiagrams();
    new MutationObserver(renderDiagrams).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const resize = new ResizeObserver(renderDiagrams);
    figures.forEach(({ figure }) => resize.observe(figure));
  } catch {
    // The text version, including every lesson link, remains usable offline.
  }
}
