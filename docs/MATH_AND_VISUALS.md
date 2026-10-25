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

Use `{% include figure.html id="warehouse-methods" %}` for a nested architecture, physical layout, before/after data example or official execution-plan image. Use Mermaid ER diagrams for schemas so tables, keys and cardinalities remain clear. Its definition in `app/_data/figures.json` supplies the local asset, dimensions, caption, alt text and attribution. Store images under `app/assets/img/site/<subject>/<chapter>/<topic>/`. See [image sources and reuse](IMAGE_SOURCES.md) for the current inventory and license evidence.

Static figures preserve their original colors. Their default view fits the column; an Enlarge image control enables keyboard scrolling at the full artwork width, alongside a full-size link, and the explanation remains readable without JavaScript. They do not need `mermaid: true`. Retain that flag only when the page also contains a Mermaid process diagram.

## Image quality at reading size

Use actual on-page dimensions to judge a figure. A large vector canvas can still produce unreadable text when reduced into the article column. Authored diagrams use large labels and a mobile composition selected through native picture/source markup. Preserve topology when rearranging a diagram: control lines stay distinct from data flow, and independent inputs stay independent.

The source and mobile label size declarations are checked against the rendered image width. Browser checks also inspect every authored SVG for clipped or overlapping text. Source artwork must have a full opaque background, self-contained resources and consistent arrowhead sizing. Reference screenshots retain their original colors and can be enlarged to native width.
