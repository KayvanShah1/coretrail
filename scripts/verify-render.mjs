import { createServer } from 'node:http';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, relative, sep } from 'node:path';
import { chromium } from 'playwright';
import YAML from 'yaml';

const root = resolve('_site');
const evidence = resolve('test-results/browser-qa');
const cases = [
  {
    name: 'point-in-time',
    route: '/coretrail/ml/features/point-in-time-features/',
    text: 'availability leakage',
    math: true,
    diagnostic: true,
  },
  {
    name: 'feature-stores',
    route: '/coretrail/ml/features/feature-stores/',
    text: 'Offline and online feature stores',
    mermaid: true,
  },
  {
    name: 'transformers',
    route: '/coretrail/ai-engineering/inference/transformers-embeddings-adaptation/',
    text: 'Transformer attention',
    math: true,
  },
  {
    name: 'agent-protocols',
    route: '/coretrail/ai-engineering/agents/mcp-a2a-orchestration/',
    text: 'Model Context Protocol',
    mermaid: true,
  },
  {
    name: 'evaluation',
    route: '/coretrail/ai-engineering/evaluation/golden-datasets-contamination/',
    text: 'Golden datasets',
    diagnostic: true,
  },
  {
    name: 'kubernetes-gpu',
    route: '/coretrail/infrastructure/kubernetes/gpu-scheduling-debugging/',
    text: 'GPU scheduling',
  },
  {
    name: 'distributed-query-diagram',
    route: '/coretrail/data-engineering/gcp/slots-shuffle-concurrency/',
    text: 'BigQuery slots',
    figures: 1,
  },
  {
    name: 'prefill-decode-diagram',
    route: '/coretrail/ai-engineering/inference/efficient-inference/',
    text: 'prefill',
    figures: 1,
  },
  {
    name: 'rag-diagram',
    route: '/coretrail/ai-engineering/retrieval/rag-search-at-scale/',
    text: 'From source documents',
    figures: 1,
    mermaid: true,
  },
  {
    name: 'kubernetes-image',
    route: '/coretrail/infrastructure/kubernetes/pods-nodes-deployments/',
    text: 'Pods, nodes',
    figures: 1,
    mermaid: true,
  },
  {
    name: 'ai-subject-map',
    route: '/coretrail/ai-engineering/',
    text: 'AI Engineering',
    mermaid: true,
  },
  {
    name: 'infra-subject-map',
    route: '/coretrail/infrastructure/',
    text: 'Infrastructure',
    mermaid: true,
  },
  {
    name: 'forecast-metrics',
    route: '/coretrail/ml/fundamentals/regression-forecasting-metrics/',
    text: 'time-series forecasting',
    math: true,
    mermaid: true,
  },
  {
    name: 'model-selection',
    route: '/coretrail/ml/fundamentals/model-selection-error-analysis/',
    text: 'Model selection',
    math: true,
  },
  {
    name: 'neural-training',
    route: '/coretrail/ml/fundamentals/deep-learning-training/',
    text: 'Neural-network',
    math: true,
  },
  {
    name: 'structured-rag',
    route: '/coretrail/ai-engineering/retrieval/structured-multimodal-content/',
    text: 'tables, images, code',
    mermaid: true,
  },
  {
    name: 'graphrag',
    route: '/coretrail/ai-engineering/retrieval/query-planning-graphrag/',
    text: 'GraphRAG',
    mermaid: true,
  },
  {
    name: 'agent-judges',
    route: '/coretrail/ai-engineering/evaluation/agent-trajectories-judges/',
    text: 'Agent trajectory',
    mermaid: true,
  },
  {
    name: 'agent-security',
    route: '/coretrail/ai-engineering/agents/trust-policy-boundaries/',
    text: 'Prompt injection',
    mermaid: true,
  },
  {
    name: 'spark-aqe',
    route: '/coretrail/data-engineering/processing/spark-partitions-aqe/',
    text: 'Spark SQL plans',
    mermaid: true,
  },
  {
    name: 'stream-retries',
    route: '/coretrail/data-engineering/reliability/stream-delivery-replay/',
    text: 'Streaming acknowledgments',
    mermaid: true,
  },
  {
    name: 'orchestration-flow',
    route: '/coretrail/data-engineering/orchestration/airflow-composer-dbt/',
    text: 'backfills',
    mermaid: true,
  },
  {
    name: 'cloud-network',
    route: '/coretrail/infrastructure/cloud/identity-network-data-path/',
    text: 'Cloud identity',
    mermaid: true,
  },
  {
    name: 'ranking-metrics',
    route: '/coretrail/ai-engineering/retrieval/vector-search-ranking/',
    text: 'retrieval metrics',
    math: true,
    mermaid: true,
  },
  {
    name: 'embeddings-capacity',
    route: '/coretrail/ai-engineering/retrieval/vector-model-capacity/',
    text: 'Embedding dimensions',
    math: true,
  },
  {
    name: 'incremental-chunk-updates',
    route: '/coretrail/ai-engineering/retrieval/document-chunks-incremental-updates/',
    text: 'Incremental update lifecycle',
    mermaid: true,
  },
  {
    name: 'index-migration',
    route: '/coretrail/ai-engineering/retrieval/embedding-index-migrations/',
    text: 'Embedding versions',
    mermaid: true,
  },
  {
    name: 'agent-context',
    figures: 1,
    route: '/coretrail/ai-engineering/agents/shared-context-handoffs/',
    text: 'Shared agent context',
    mermaid: false,
  },
  {
    name: 'etl-path',
    route: '/coretrail/data-engineering/foundations/etl-elt-and-pipelines/',
    text: 'ETL',
    mermaid: true,
  },
  {
    name: 'schema-evolution',
    route: '/coretrail/data-engineering/processing/streaming-schema-evolution/',
    text: 'Schema evolution',
    mermaid: true,
  },
  {
    name: 'backpressure',
    route: '/coretrail/ai-engineering/production/traffic-backpressure/',
    text: 'backpressure',
    mermaid: true,
  },
  {
    name: 'token-flow',
    route: '/coretrail/ai-engineering/inference/how-inference-works/',
    text: 'inference',
    mermaid: true,
  },
  {
    name: 'data-formats',
    route: '/coretrail/data-engineering/storage/file-formats-table-formats/',
    text: 'Parquet',
  },
  {
    name: 'dagster-argo',
    route: '/coretrail/data-engineering/orchestration/dagster-argo-workload-control/',
    text: 'Dagster',
    mermaid: true,
  },
  {
    name: 'tokenization',
    route: '/coretrail/ai-engineering/inference/tokenizers-decoding-sampling/',
    text: 'Tokenization',
    math: true,
  },
];
cases.push(
  {
    name: 'model-lifecycle',
    route: '/coretrail/ml/operations/model-lifecycle-monitoring/',
    text: 'Experiment tracking, model registries and release provenance',
    mermaid: true,
  },
  {
    name: 'rag-architecture',
    route: '/coretrail/ai-engineering/retrieval/rag-search-at-scale/',
    text: 'Source preparation and online evidence use',
    mermaid: true,
  },
  {
    name: 'evidence-survival',
    route: '/coretrail/ai-engineering/evaluation/evidence-survival-oracle-tests/',
    text: 'Evidence survival exposes loss at each stage',
    math: true,
    mermaid: true,
  },
  {
    name: 'nlp-fundamentals',
    route: '/coretrail/ai-engineering/inference/nlp-representations-preprocessing/',
    text: 'Entity linking',
  },
  {
    name: 'gcp-decisions',
    route: '/coretrail/infrastructure/cloud/gcp-service-decisions/',
    text: 'The shortest deadline controls an attempt',
    mermaid: true,
  },
  {
    name: 'linear-pca-clustering',
    route: '/coretrail/ml/fundamentals/linear-models-pca-clustering/',
    text: 'Principal component analysis',
    math: true,
  },
);
cases.push(
  {
    name: 'de-modelling-models-keys-relationships',
    relationshipLabels: true,
    route: '/coretrail/data-engineering/modelling/models-keys-relationships/',
    text: 'Data models, keys and relationship cardinality',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-modelling-dimensional-facts-schemas',
    relationshipLabels: true,
    route: '/coretrail/data-engineering/modelling/dimensional-facts-schemas/',
    text: 'Dimensional modelling, star schemas and fact grain',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-modelling-scd-temporal-history',
    scd: true,
    figures: 2,
    route: '/coretrail/data-engineering/modelling/scd-temporal-history/',
    text: 'Slowly changing dimensions and temporal history',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-modelling-transactions-acid-consistency',
    route: '/coretrail/data-engineering/modelling/transactions-acid-consistency/',
    text: 'ACID, transactional workloads and cross-system consistency',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-architecture-warehouse-integration-patterns',
    relationshipLabels: true,
    figures: 1,
    route: '/coretrail/data-engineering/architecture/warehouse-integration-patterns/',
    text: 'Kimball, Inmon, Data Vault and hybrid warehouse design',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-architecture-lambda-kappa-medallion',
    figures: 3,
    route: '/coretrail/data-engineering/architecture/lambda-kappa-medallion/',
    text: 'Lambda, Kappa, medallion and hybrid processing',
    mermaid: false,
    math: false,
  },
  {
    name: 'de-storage-delta-iceberg-hudi-operations',
    figures: 1,
    route: '/coretrail/data-engineering/storage/delta-iceberg-hudi-operations/',
    text: 'Delta Lake, Iceberg and Hudi: selection and operations',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-foundations-capacity-estimation',
    route: '/coretrail/data-engineering/foundations/capacity-estimation/',
    text: 'Data capacity and back-of-the-envelope calculations',
    mermaid: false,
    math: true,
  },
  {
    name: 'de-foundations-pipeline-run-lifecycle',
    route: '/coretrail/data-engineering/foundations/pipeline-run-lifecycle/',
    text: 'Pipeline fundamentals: contracts, checkpoints and publication',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-reliability-recovery-replay-backfills',
    route: '/coretrail/data-engineering/reliability/recovery-replay-backfills/',
    text: 'Resumable pipelines, replay, backfills and safe recovery',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-reliability-metadata-lineage-tools',
    route: '/coretrail/data-engineering/reliability/metadata-lineage-tools/',
    text: 'Pipeline metadata, lineage and tracking tools',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-reliability-diagnosis-symptoms-evidence',
    route: '/coretrail/data-engineering/reliability/diagnosis-symptoms-evidence/',
    text: 'Diagnosing data failures from symptoms and evidence',
    mermaid: true,
    math: false,
  },
);
cases.push(
  {
    name: 'de-modelling-overview',
    route: '/coretrail/data-engineering/modelling/overview/',
    text: 'Data modelling and transactions',
  },
  {
    name: 'de-architecture-overview',
    route: '/coretrail/data-engineering/architecture/overview/',
    text: 'Warehouse and processing architectures',
  },
  { name: 'de-subject-navigation', route: '/coretrail/data-engineering/', text: 'Data modelling' },
);
cases.push(
  {
    name: 'lake-warehouse-design',
    figures: 1,
    route: '/coretrail/data-engineering/architecture/lake-warehouse-design/',
    text: 'Data lake and Delta Lake design',
    mermaid: false,
  },
  {
    name: 'lake-physical-layout',
    figures: 2,
    route: '/coretrail/data-engineering/storage/partitioning-file-sizing/',
    text: 'Lake partitioning, clustering',
    mermaid: true,
  },
  {
    name: 'storage-workload-selection',
    route: '/coretrail/data-engineering/storage/workload-storage-selection/',
    text: 'Choosing storage from data shape',
  },
  {
    name: 'lakehouse-query-plans',
    figures: 1,
    route: '/coretrail/data-engineering/processing/query-plans-pruning/',
    text: 'Lakehouse query plans',
  },
  {
    name: 'transformation-selection',
    route: '/coretrail/data-engineering/orchestration/transformation-tool-selection/',
    text: 'Choosing a data transformation tool',
  },
  {
    name: 'obt-modelling',
    route: '/coretrail/data-engineering/modelling/one-big-table-feature-data/',
    text: 'One Big Table',
  },
  {
    name: 'evaluation-canonical-overview',
    route: '/coretrail/ai-engineering/evaluation/overview/',
    text: 'Choose the test by the failure',
  },
  {
    name: 'model-startup-lifecycle',
    route: '/coretrail/ai-engineering/deployment/startup-lifecycle/',
    text: 'From container start to ready replica',
    mermaid: true,
  },
  {
    name: 'llm-autoscaling',
    route: '/coretrail/ai-engineering/production/autoscaling/',
    text: 'Autoscaling LLM inference',
    mermaid: true,
  },
  {
    name: 'dimensional-sql',
    route: '/coretrail/sql/design/dimensional-modeling/',
    text: 'Resolving dimension versions',
  },
  {
    name: 'pipeline-release-validation',
    route: '/coretrail/data-engineering/reliability/quality-incidents-and-cicd/',
    text: 'Data pipeline CI/CD',
  },
  {
    name: 'streaming-time-semantics',
    route: '/coretrail/data-engineering/processing/spark-beam-and-time/',
    text: 'Event time, processing time and watermarks',
  },
  {
    name: 'storage-chapter-layout',
    route: '/coretrail/data-engineering/storage/overview/',
    text: 'Lake partitioning',
  },
  {
    name: 'transformation-chapter-navigation',
    route: '/coretrail/data-engineering/orchestration/overview/',
    text: 'Choosing a data transformation tool',
  },
  {
    name: 'bigquery-canonical-navigation',
    route: '/coretrail/data-engineering/gcp/overview/',
    text: 'BigQuery slots',
  },
);
cases.push(
  {
    name: 'ml-deployment',
    route: '/coretrail/ml/serving/model-deployment-serving/',
    text: 'From trained model to prediction service',
  },
  {
    name: 'ml-multi-model',
    route: '/coretrail/ml/serving/multi-model-serving/',
    text: 'Multi-model serving, grouping and memory capacity',
  },
  {
    name: 'ml-drift-types',
    route: '/coretrail/ml/operations/drift-detection/',
    text: 'Data drift, concept drift and training-serving skew',
  },
  {
    name: 'ml-retraining-policy',
    route: '/coretrail/ml/operations/retraining-triggers/',
    text: 'Retraining triggers, evaluation gates and rollback',
  },
  {
    name: 'evidence-properties',
    route:
      '/coretrail/infrastructure/observability/observability-explainability-traceability-auditability/',
    text: 'Observability, explainability, traceability and auditability',
  },
  {
    name: 'ai-prompt-context',
    route: '/coretrail/ai-engineering/production/prompt-context-caching/',
    text: 'Prompt releases, context budgets and application caching',
  },
  {
    name: 'ai-adaptation-choice',
    route: '/coretrail/ai-engineering/inference/adaptation-strategy/',
    text: 'Choosing prompting, RAG, SFT and preference tuning',
  },
  {
    name: 'ai-streaming-voice',
    route: '/coretrail/ai-engineering/production/streaming-voice-agents/',
    text: 'Streaming voice agents, turn-taking and recovery',
  },
);
// Match every authored expression to its rendered DOM node. A page can render its
// display equations while Markdown silently corrupts inline include output.
const config = YAML.parse(await readFile('_config.yml', 'utf8'));
for (const [id, collection] of Object.entries(config.collections)) {
  if (!collection.output) continue;
  const directory = resolve(config.source, config.collections_dir, '_' + id);
  const files = await readdir(directory, { recursive: true });
  for (const file of files.filter((name) => name.endsWith('.md'))) {
    const source = (await readFile(resolve(directory, file), 'utf8')).replaceAll('\r\n', '\n');
    const front = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!front) continue;
    const metadata = YAML.parse(front[1]);
    const body = front[2].replace(/^([`~]{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '');
    const expressions = [...body.matchAll(/{%\s*include math\.html\b([\s\S]*?)%}/g)];
    const blockExpressions = [...body.matchAll(/{%\s*include block-diagram\.html\b/g)];
    const figureExpressions = [...body.matchAll(/{%\s*include figure\.html\b/g)];
    if (expressions.length && metadata.math !== true)
      throw new Error('Missing math: true in ' + file);
    const lessonPath = relative(directory, resolve(directory, file))
      .replaceAll('\\', '/')
      .replace(/\.md$/, '');
    const route =
      config.baseurl + (metadata.permalink || collection.permalink.replace(':path', lessonPath));
    let test = cases.find((item) => item.route === route);
    if (!expressions.length && !blockExpressions.length && !figureExpressions.length && !test)
      continue;
    if (!test) {
      test = {
        name: 'math-' + id + '-' + lessonPath.replaceAll('/', '-'),
        route,
        text: metadata.title,
      };
      cases.push(test);
    }
    test.mermaid = metadata.mermaid === true;
    Object.assign(test, {
      math: expressions.length > 0,
      blocks: blockExpressions.length,
      figures: figureExpressions.length,
      formulaCount: expressions.length,
      inlineFormulaCount: expressions.filter((match) => !/\bblock\s*=\s*true\b/.test(match[1]))
        .length,
    });
  }
}

for (const test of cases) if (test.scd) test.figures = 0;

const types = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};
const server = createServer(async (request, response) => {
  try {
    let name = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (!name.startsWith('/coretrail/')) {
      response.writeHead(404).end();
      return;
    }
    name = name.slice('/coretrail'.length);
    if (name.endsWith('/')) name += 'index.html';
    if (!extname(name)) name += '/index.html';
    const target = resolve(root, '.' + name);
    if (!target.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(target);
    response.writeHead(200, {
      'Content-Type': types[extname(target)] || 'application/octet-stream',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
const origin = 'http://127.0.0.1:' + server.address().port;
await mkdir(evidence, { recursive: true });
let browser;
const outcomes = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const test of cases) {
    for (const v of [
      { label: 'desktop', width: 1280, height: 850 },
      { label: 'mobile', width: 390, height: 844 },
      { label: 'tablet', width: 820, height: 1000 },
    ]) {
      if (v.label === 'tablet' && !test.figures && !test.blocks && !test.scd) continue;
      const page = await browser.newPage({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: 1,
        isMobile: v.label === 'mobile',
        hasTouch: v.label === 'mobile',
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push('JS: ' + e.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push('Console: ' + msg.text());
      });
      const resp = await page.goto(origin + test.route, { waitUntil: 'domcontentloaded' });
      if (resp?.status() !== 200) errors.push('HTTP ' + String(resp?.status()));
      const title = await page.title();
      if (!title.includes('CoreTrail')) errors.push('Unexpected title ' + title);
      const content = await page.locator('main').innerText();
      if (!content.toLowerCase().includes(test.text.toLowerCase())) {
        errors.push('Text missing: ' + test.text);
      }
      if (test.math) {
        const count = await page.locator('.math-expression').count();
        if (count !== test.formulaCount) {
          errors.push('Expected ' + test.formulaCount + ' equations, found ' + count);
        } else {
          try {
            await page.waitForFunction(
              () =>
                [...document.querySelectorAll('.math-expression')].every(
                  (element) =>
                    element.querySelector('.katex math') &&
                    !element.querySelector('.math-fallback, .katex-error'),
                ),
              null,
              { timeout: 20000 },
            );
          } catch {
            errors.push('KaTeX did not render every equation');
          }
        }
        const inline = await page.locator('.math-inline').evaluateAll((elements) => ({
          count: elements.length,
          broken: elements.some(
            (element) =>
              element.tagName !== 'SPAN' || !element.closest('p, li, td, th, h1, h2, h3'),
          ),
        }));
        if (inline.count !== test.inlineFormulaCount || inline.broken)
          errors.push('Inline equation escaped its text context');
        if (/math-expression|math-source|math-fallback/.test(content))
          errors.push('Math HTML escaped into visible prose');
      }
      if (test.diagnostic && (await page.locator('.diagnostic-step').count()) < 3) {
        errors.push('Diagnostic steps missing');
      }
      if (test.mermaid) {
        try {
          await page.waitForFunction(
            () =>
              [...document.querySelectorAll('.diagram-canvas')].length > 0 &&
              [...document.querySelectorAll('.diagram-canvas')].every(
                (e) => !e.hidden && e.querySelector('svg'),
              ),
            null,
            { timeout: 20000 },
          );
        } catch {
          errors.push('Mermaid did not render');
        }
      }
      if (test.mermaid) {
        const unreadable = await page
          .locator('.diagram-canvas > svg')
          .evaluateAll(
            (graphics) =>
              graphics.filter(
                (graphic) =>
                  graphic.getBoundingClientRect().width / graphic.viewBox.baseVal.width < 0.8,
              ).length,
          );
        if (unreadable) errors.push('Diagram labels scaled below readable size');
      }
      if (test.relationshipLabels) {
        const labels = await page
          .locator('.diagram-canvas .edgeLabel text')
          .evaluateAll((nodes) => {
            const rgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
            const luminance = (value) =>
              rgb(value)
                .map((channel) => {
                  const s = channel / 255;
                  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
                })
                .reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
            return nodes
              .filter((label) =>
                label
                  .closest('.diagram')
                  .querySelector('.diagram-source')
                  .content.textContent.trim()
                  .startsWith('erDiagram'),
              )
              .map((label) => {
                const parent = label.closest('.edgeLabel');
                const background = parent.querySelector('rect');
                const foreground = luminance(getComputedStyle(label).fill);
                const backdrop = luminance(
                  background
                    ? getComputedStyle(background).fill
                    : getComputedStyle(label.closest('.diagram')).backgroundColor,
                );
                return {
                  text: label.textContent.trim(),
                  contrast:
                    (Math.max(foreground, backdrop) + 0.05) /
                    (Math.min(foreground, backdrop) + 0.05),
                };
              });
          });
        if (
          !labels.length ||
          labels.some(
            (label) => !label.text || !Number.isFinite(label.contrast) || label.contrast < 4.5,
          )
        ) {
          errors.push(
            'ER relationship labels missing or below 4.5:1 contrast: ' + JSON.stringify(labels),
          );
        }
      }
      if (test.blocks) {
        await page.waitForFunction(() =>
          [...document.querySelectorAll('.block-graph')].every(
            (graph) => graph.dataset.connected === 'true',
          ),
        );
        const blockCount = await page.locator('.block-diagram').count();
        if (blockCount !== test.blocks) errors.push('Wrong number of native diagrams');
        const blockIssues = await page.locator('.block-graph').evaluateAll((graphs) => {
          const issues = [];
          for (const graph of graphs) {
            for (const label of graph.querySelectorAll('.block-edge-label'))
              if (getComputedStyle(label).stroke !== 'none')
                issues.push('Icon stroke leaked into connector label');
            const frame = graph.getBoundingClientRect();
            const nodes = [...graph.querySelectorAll('[data-block-node]')];
            const boxes = nodes.map((node) => {
              const r = node.getBoundingClientRect();
              if (
                node.scrollWidth > node.clientWidth + 1 ||
                parseFloat(getComputedStyle(node).fontSize) < 14
              )
                issues.push('Clipped or small node: ' + node.dataset.blockNode);
              return {
                id: node.dataset.blockNode,
                left: r.left - frame.left + 3,
                right: r.right - frame.left - 3,
                top: r.top - frame.top + 3,
                bottom: r.bottom - frame.top - 3,
              };
            });
            const paths = [...graph.querySelectorAll('.block-edge')];
            if (paths.length !== JSON.parse(graph.querySelector('.block-links').textContent).length)
              issues.push('Missing connectors');
            for (const path of paths) {
              const points = JSON.parse(path.dataset.points);
              let length = 0;
              for (let i = 1; i < points.length; i++) {
                const a = points[i - 1],
                  b = points[i];
                length += Math.hypot(a[0] - b[0], a[1] - b[1]);
                for (const box of boxes.filter(
                  (box) => box.id !== path.dataset.from && box.id !== path.dataset.to,
                )) {
                  const horizontal =
                    Math.abs(a[1] - b[1]) < 0.1 &&
                    a[1] > box.top &&
                    a[1] < box.bottom &&
                    Math.max(a[0], b[0]) > box.left &&
                    Math.min(a[0], b[0]) < box.right;
                  const vertical =
                    Math.abs(a[0] - b[0]) < 0.1 &&
                    a[0] > box.left &&
                    a[0] < box.right &&
                    Math.max(a[1], b[1]) > box.top &&
                    Math.min(a[1], b[1]) < box.bottom;
                  if (horizontal || vertical)
                    issues.push(
                      'Connector crosses ' +
                        box.id +
                        ': ' +
                        path.dataset.from +
                        ' to ' +
                        path.dataset.to,
                    );
                }
              }
              if (length < 12) issues.push('Connector too short');
              if (
                points.some(
                  (p) => p[0] < 0 || p[0] > frame.width || p[1] < 0 || p[1] > frame.height,
                )
              )
                issues.push('Connector leaves diagram');
            }
          }
          return issues;
        });
        errors.push(...blockIssues);
      }
      if (test.scd) {
        const rows = await page
          .locator('article.prose tr')
          .evaluateAll((rows) =>
            rows.map((row) =>
              [...row.querySelectorAll('td')].map((cell) => cell.textContent.trim()).join('|'),
            ),
          );
        for (const expected of [
          '101|C42|Asha Rao|South',
          '101|West|1 Jan 2026|1 July 2026|Closed',
          '205|South|1 July 2026|NULL|Current',
          'S01|15 June 2026|100|101|West',
          'S02|10 July 2026|150|205|South',
          '101|C42|20',
          'S01|101|9001|100',
        ]) {
          if (!rows.includes(expected)) errors.push('SCD worked example missing: ' + expected);
        }
      }
      const imageFigures = page.locator('.reference-figure');
      if (test.figures && (await imageFigures.count()) !== test.figures) {
        errors.push(
          'Expected ' + test.figures + ' static figures, found ' + (await imageFigures.count()),
        );
      }
      for (const figure of await imageFigures.all()) {
        await figure.scrollIntoViewIfNeeded();
        const img = figure.locator('img');
        try {
          await img.evaluate((image) => image.decode());
        } catch {
          errors.push('Image failed to decode: ' + (await img.getAttribute('src')));
        }
        const zoom = figure.getByRole('checkbox', { name: 'Enlarge image' });
        await zoom.check();
        const imageState = await img.evaluate((image) => ({
          loaded: image.complete && image.naturalWidth > 0,
          alt: image.alt,
          width: image.getBoundingClientRect().width,
          region: image.closest('.reference-figure-image').clientWidth,
        }));
        if (!imageState.loaded || !imageState.alt) errors.push('Image missing pixels or alt text');
        if ((await figure.locator('figcaption').innerText()).trim().length < 40)
          errors.push('Image explanation missing');
        if (
          !(await figure.locator('.reference-figure-hint a').getAttribute('href'))?.startsWith(
            '/coretrail/assets/img/site/',
          )
        )
          errors.push('Full-size link missing local base URL');
        const region = figure.locator('[role="region"]');
        if (imageState.width > imageState.region + 2) {
          await region.focus();
          await region.press('ArrowRight');
          try {
            await page.waitForFunction(() => document.activeElement?.scrollLeft > 0, null, {
              timeout: 3000,
            });
          } catch {
            errors.push('Image cannot be scrolled with the keyboard');
          }
        }
        await zoom.uncheck();
        const overviewFits = await img.evaluate(
          (image) =>
            image.getBoundingClientRect().width <=
            image.closest('.reference-figure-image').clientWidth + 1,
        );
        if (!overviewFits) errors.push('Image overview is clipped before enlargement');
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const sizes = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      if (sizes.scroll > sizes.viewport + 2) {
        errors.push('Horizontal overflow: ' + sizes.scroll + ' > ' + sizes.viewport);
      }
      await page.screenshot({
        path: resolve(evidence, test.name + '-' + v.label + '.png'),
        fullPage: true,
      });
      if (test.figures || test.blocks || test.scd) {
        const nativeBefore = await page
          .locator('.block-node, .parquet-file, .scd-change, .scd-change-value')
          .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor));
        const currentTheme = await page.getAttribute('html', 'data-theme');
        await page
          .getByRole('button', {
            name: 'Switch to ' + (currentTheme === 'dark' ? 'light' : 'dark') + ' mode',
          })
          .first()
          .click();
        const nextTheme = await page.getAttribute('html', 'data-theme');
        if (nextTheme === currentTheme) errors.push('Theme toggle did not change the theme');
        const filteredImages = await page
          .locator('.reference-figure-image img')
          .evaluateAll((images) =>
            images.some((image) => {
              const style = getComputedStyle(image);
              return (
                style.filter !== 'none' || Number(style.opacity) !== 1 || image.naturalWidth === 0
              );
            }),
          );
        if (filteredImages) errors.push('Theme changed source image colors or lost pixels');
        const nativeAfter = await page
          .locator('.block-node, .parquet-file, .scd-change, .scd-change-value')
          .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).backgroundColor));
        if (nativeBefore.length && nativeAfter.some((color, i) => color === nativeBefore[i]))
          errors.push('Native diagram or SCD surface did not follow the theme');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: resolve(evidence, test.name + '-' + v.label + '-' + nextTheme + '.png'),
          fullPage: true,
        });
      }
      outcomes.push({ name: test.name, viewport: v.label, route: test.route, errors, sizes });
      await page.close();
    }
  }
  const diagramPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await diagramPage.goto(origin + '/coretrail/ai-engineering/retrieval/rag-search-at-scale/');
  const scrollRegion = diagramPage.locator('.diagram-canvas[data-scrollable="true"]').first();
  await scrollRegion.waitFor({ state: 'visible' });
  await scrollRegion.focus();
  await scrollRegion.press('ArrowRight');
  await diagramPage.waitForFunction(() => document.activeElement?.scrollLeft > 0);
  outcomes.push({ name: 'mobile-diagram-keyboard-scroll', errors: [] });
  await diagramPage.close();

  const page = await browser.newPage();
  await page.goto(origin + cases[0].route);
  const next = page.locator('.lesson-pagination a.next');
  if ((await next.count()) === 0) throw new Error('Missing Next lesson navigation');
  await next.click();
  const navigated = new URL(page.url()).pathname;
  if (navigated === cases[0].route || !navigated.startsWith('/coretrail/ml/')) {
    throw new Error('Next lesson navigation did not reach ML route: ' + navigated);
  }
  outcomes.push({ name: 'lesson-navigation', route: navigated, errors: [] });
  await page.close();
} finally {
  await browser?.close();
  await new Promise((close) => server.close(close));
}
await writeFile(resolve(evidence, 'results.json'), JSON.stringify(outcomes, null, 2));
for (const item of outcomes) {
  console.log(
    item.name +
      ' ' +
      (item.viewport || '') +
      ': ' +
      (item.errors.length ? item.errors.join('; ') : 'PASS'),
  );
}
const failures = outcomes.filter((x) => x.errors.length);
if (failures.length) throw new Error(String(failures.length) + ' rendered-page checks failed');
