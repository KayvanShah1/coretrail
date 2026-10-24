import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';

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
    route: '/coretrail/ai-engineering/agents/shared-context-handoffs/',
    text: 'Shared agent context',
    mermaid: true,
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
    text: 'Model release uses data and evaluation gates',
    math: true,
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
    route: '/coretrail/data-engineering/architecture/warehouse-integration-patterns/',
    text: 'Kimball, Inmon, Data Vault and hybrid warehouse design',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-architecture-lambda-kappa-medallion',
    route: '/coretrail/data-engineering/architecture/lambda-kappa-medallion/',
    text: 'Lambda, Kappa, medallion and hybrid processing',
    mermaid: true,
    math: false,
  },
  {
    name: 'de-storage-delta-iceberg-hudi-operations',
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
    route: '/coretrail/data-engineering/architecture/lake-warehouse-design/',
    text: 'Data lake and Delta Lake design',
    mermaid: true,
  },
  {
    name: 'lake-physical-layout',
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
    ]) {
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
        try {
          await page.waitForFunction(
            () =>
              [...document.querySelectorAll('.math-expression')].length > 0 &&
              [...document.querySelectorAll('.math-expression')].every((e) =>
                e.querySelector('.katex'),
              ),
            null,
            { timeout: 20000 },
          );
        } catch {
          errors.push('KaTeX did not render');
        }
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
