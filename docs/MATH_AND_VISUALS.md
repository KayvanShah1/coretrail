# Equations and diagnostic diagrams

CoreTrail uses Jekyll/Kramdown. LaTeX is rendered by the opt-in KaTeX client script. On a lesson containing equations, set `math: true` in the front matter, then insert repository-authored equations through the Liquid include:

```liquid
Inline: {% include math.html tex="P(y=1\\mid x)=\\sigma(w^\\top x)" %}

{% capture equation %}
\\operatorname{Recall@k}=\\frac{\\text{relevant in top }k}{\\text{all relevant}}
{% endcapture %}
{% include math.html tex=equation block=true %}
```

The include escapes its input and preserves a readable LaTeX fallback if KaTeX cannot load. Display equations scroll horizontally when necessary. No mathematical rendering is applied to ordinary code fences. Use the include instead of automatic `$` delimiter detection; SQL and prose frequently contain literal dollar signs. Rendering is limited to repository-authored expressions with `trust: false`.

Use `{% include diagram.html ... %}` for process flows. Always provide a textual fallback and readable title. Prefer a diagram when direction, branching, or feedback changes the explanation. A diagnostic layout can be reused by defining an entry in `app/_data/diagnostics.json` and including `{% include diagnostic-map.html id="point-in-time" %}`. Its content remains accessible without JavaScript.

Do not turn comparisons that are clearer as tables into decorative flowcharts.

## Static figures

Use `{% include figure.html id="sales-star" %}` for a detailed schema, nested architecture, physical layout or official execution-plan image. Its definition in `app/_data/figures.json` supplies the local asset, dimensions, caption, alt text and attribution. Store images under `app/assets/img/site/<subject>/<chapter>/<topic>/`. See [image sources and reuse](IMAGE_SOURCES.md) for the current inventory and license evidence.

Static figures preserve their original colors. Their default view fits the column; an Enlarge image control enables keyboard scrolling, alongside a full-size link, and the explanation remains readable without JavaScript. They do not need `mermaid: true`. Retain that flag only when the page also contains a Mermaid process diagram.
