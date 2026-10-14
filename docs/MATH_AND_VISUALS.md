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
