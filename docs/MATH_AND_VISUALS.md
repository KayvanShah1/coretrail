# Equations and diagnostic diagrams

CoreTrail uses Jekyll/Kramdown. LaTeX is rendered by the opt-in KaTeX client script. On a lesson containing equations, set `math: true` in the front matter, then insert repository-authored equations through the Liquid include:

```liquid
Inline: {% include math.html tex="P(y=1\mid x)=\sigma(w^\top x)" %}

{% capture equation %}
\operatorname{Recall@k}=\frac{\text{relevant in top }k}{\text{all relevant}}
{% endcapture %}
{% include math.html tex=equation block=true %}
```

The include escapes its input and preserves a readable LaTeX fallback if KaTeX cannot load. It uses Jekyll’s [normalize_whitespace filter](https://jekyllrb.com/docs/liquid/filters/) to keep the generated HTML on one line so that an inline expression remains inside its surrounding Markdown paragraph; template indentation and blank lines must not become code blocks. Preserve TeX row breaks as `\\` inside captured expressions. Display equations scroll horizontally when necessary. Use equation includes for mathematical definitions and worked arithmetic. Keep executable SQL and language expressions in code formatting. No mathematical rendering is applied to ordinary code fences. Use the include instead of automatic `$` delimiter detection; SQL and prose frequently contain literal dollar signs. Rendering is limited to repository-authored expressions with `trust: false`.

Browser verification discovers equation pages across all published collections. It matches every source include to a rendered equation, verifies inline placement and requires KaTeX plus MathML for every expression on desktop and mobile. Rendering only some of a page's formulas is a failure.

Use `{% include diagram.html ... %}` for process flows. Always provide a textual fallback and readable title. Prefer a diagram when direction, branching, or feedback changes the explanation. A diagnostic layout can be reused by defining an entry in `app/_data/diagnostics.json` and including `{% include diagnostic-map.html id="point-in-time" %}`. Its content remains accessible without JavaScript.

Do not turn comparisons that are clearer as tables into decorative flowcharts.

## Native diagrams

Use `{% include block-diagram.html id="warehouse-methods" %}` for authored responsibility, execution or physical-layout diagrams. Define the content in `app/_data/block_diagrams.json` and set `block_diagrams: true` in the lesson. Use the existing theme colors, typeface and rounded panels. Text stays at reading size; resize the layout rather than scaling text into an image.

Declare both desktop and compact grid positions, preserving branch meaning. Every connector names a source and destination. The renderer measures the HTML panels after layout and anchors its arrows to their edges. A return route uses an outside rail, and a control route is dashed. Inspect both themes, narrow columns and all arrow endpoints.

The Parquet example uses nested HTML regions for file, row group, column chunk and page. Before/after data examples use native tables with one coherent scenario, meaningful keys, change dates, changed values and the resulting query or report. Source records and output rows must agree.

## Static reference figures

Use `{% include figure.html id="query-stages" %}` for an official image whose details support the explanation and whose reuse terms allow redistribution. Keep source bytes unchanged under `app/assets/img/site/<subject>/<chapter>/<topic>/`. Its registry entry supplies dimensions, caption, alt text, source and license.

Images fit the column by default and retain a full-size link plus keyboard-accessible enlargement. Preserve official source colors across themes. Use Mermaid ER diagrams for schemas and Mermaid workflows where branching or event order is the relationship to inspect. See [image sources and reuse](IMAGE_SOURCES.md) for the current inventory.
