// Opt-in math rendering. Expressions are repository-authored and never evaluated.
// A readable text fallback remains if the remote renderer fails to load.
const formulas = [...document.querySelectorAll('.math-expression')];

if (formulas.length) {
  try {
    const { default: katex } = await import(
      'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs'
    );

    for (const element of formulas) {
      const tex = element.querySelector('.math-source')?.content.textContent?.trim();
      if (!tex) continue;

      const rendered = document.createElement('span');
      try {
        katex.render(tex, rendered, {
          displayMode: element.classList.contains('math-block'),
          output: 'htmlAndMathml',
          throwOnError: true,
          trust: false,
          strict: 'warn',
        });
        element.replaceChildren(...rendered.childNodes);
      } catch {
        // Keep the original escaped expression available to the reader.
      }
    }
  } catch {
    // CoreTrail still works if the CDN is unavailable.
  }
}
