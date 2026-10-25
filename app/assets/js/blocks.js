// Connect the actual HTML panels, including after wrapping, font loading and resize.
const ns = 'http://www.w3.org/2000/svg';
let sequence = 0;
const svgNode = (tag, attrs) => {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};
const port = (box, side, gap) => {
  if (side === 'left') return [box.left - gap, box.top + box.height / 2];
  if (side === 'right') return [box.right + gap, box.top + box.height / 2];
  if (side === 'top') return [box.left + box.width / 2, box.top - gap];
  return [box.left + box.width / 2, box.bottom + gap];
};
for (const graph of document.querySelectorAll('.block-graph')) {
  const svg = graph.querySelector('.block-edges');
  const links = JSON.parse(graph.querySelector('.block-links').textContent);
  const markerId = 'block-arrow-' + ++sequence;
  const draw = () => {
    const frame = graph.getBoundingClientRect();
    const compact = getComputedStyle(graph).getPropertyValue('--compact').trim() === '1';
    const boxes = new Map(
      [...graph.querySelectorAll('[data-block-node]')].map((node) => {
        const r = node.getBoundingClientRect();
        return [
          node.dataset.blockNode,
          {
            left: r.left - frame.left,
            right: r.right - frame.left,
            top: r.top - frame.top,
            bottom: r.bottom - frame.top,
            width: r.width,
            height: r.height,
          },
        ];
      }),
    );
    const defs = svgNode('defs', {});
    for (const control of [false, true]) {
      const marker = svgNode('marker', {
        id: markerId + (control ? '-control' : ''),
        markerWidth: 7,
        markerHeight: 7,
        refX: 6,
        refY: 3.5,
        orient: 'auto',
        markerUnits: 'userSpaceOnUse',
      });
      marker.append(
        svgNode('path', {
          d: 'M0,0 L7,3.5 L0,7 Z',
          fill: control ? 'var(--muted)' : 'var(--accent)',
        }),
      );
      defs.append(marker);
    }
    svg.replaceChildren(defs);
    svg.setAttribute('viewBox', '0 0 ' + frame.width + ' ' + frame.height);
    for (const link of links) {
      const edge = compact ? { ...link, ...link.compact } : link;
      const from = boxes.get(edge.from),
        to = boxes.get(edge.to);
      if (!from || !to) continue;
      const across = Math.abs(from.top - to.top) < 2;
      const fromSide = edge.from_side || edge.via || (across ? 'right' : 'bottom');
      const toSide = edge.to_side || edge.via || (across ? 'left' : 'top');
      const a = port(from, fromSide, 5),
        b = port(to, toSide, 8);
      let points;
      if (edge.via === 'left' || edge.via === 'right') {
        const rail =
          edge.via === 'left'
            ? Math.max(7, Math.min(from.left, to.left) - 16)
            : Math.min(frame.width - 7, Math.max(from.right, to.right) + 16);
        points = [a, [rail, a[1]], [rail, b[1]], b];
      } else if (fromSide === 'right' || fromSide === 'left') {
        const mid = (a[0] + b[0]) / 2;
        points = [a, [mid, a[1]], [mid, b[1]], b];
      } else {
        const mid = (a[1] + b[1]) / 2;
        points = [a, [a[0], mid], [b[0], mid], b];
      }
      const path = svgNode('path', {
        d: points.map((p, i) => (i ? 'L' : 'M') + p.join(',')).join(' '),
        class: 'block-edge' + (edge.control ? ' block-edge--control' : ''),
        'marker-end': 'url(#' + markerId + (edge.control ? '-control' : '') + ')',
        'data-from': edge.from,
        'data-to': edge.to,
        'data-points': JSON.stringify(points),
      });
      svg.append(path);
      if (edge.label && !edge.via) {
        let longest = { length: 0, x: 0, y: 0 };
        for (let i = 1; i < points.length; i++) {
          const length = Math.hypot(
            points[i][0] - points[i - 1][0],
            points[i][1] - points[i - 1][1],
          );
          if (length > longest.length)
            longest = {
              length,
              x: (points[i][0] + points[i - 1][0]) / 2,
              y: (points[i][1] + points[i - 1][1]) / 2,
            };
        }
        const label = svgNode('text', {
          x: longest.x,
          y: longest.y + 4,
          'text-anchor': 'middle',
          class: 'block-edge-label',
        });
        label.textContent = edge.label;
        svg.append(label);
        const r = label.getBBox();
        svg.insertBefore(
          svgNode('rect', {
            x: r.x - 5,
            y: r.y - 2,
            width: r.width + 10,
            height: r.height + 4,
            rx: 3,
            class: 'block-edge-label-bg',
          }),
          label,
        );
      }
    }
    graph.dataset.connected = 'true';
  };
  new ResizeObserver(draw).observe(graph);
  document.fonts.ready.then(draw);
}
