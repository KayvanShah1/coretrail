# Search and AI discovery

CoreTrail publishes readable HTML, canonical URLs, page descriptions, a sitemap, and Schema.org metadata. The homepage describes the available interview revision content. Subject pages show which trails are available and which are planned.

## Crawler access

The current address is `https://kayvanshah1.github.io/coretrail/`. Crawlers read `https://kayvanshah1.github.io/robots.txt` for this host. That file belongs to the portfolio repository, `KayvanShah1/KayvanShah1.github.io`, at `public/robots.txt`.

The host file allows crawling and should list both the portfolio sitemap and `https://kayvanshah1.github.io/coretrail/sitemap.xml`. Its wildcard and OAI-SearchBot agents share the same rules. OAI-SearchBot handles ChatGPT search discovery. GPTBot controls training access independently; this change preserves the existing wildcard policy.

CoreTrail also generates a project-local `robots.txt`. On GitHub Pages it is served at `/coretrail/robots.txt`, so it cannot replace the host file. If the project moves to its own domain, update `_config.yml` and place this file at the domain root.

## After deployment

- Fetch the host robots file and CoreTrail sitemap to confirm both changes are live.
- Submit the CoreTrail sitemap in Google Search Console and Bing Webmaster Tools using verified access. Inspect the homepage, subject pages, and several lessons for indexing.
- Check hosting or firewall rules if legitimate search crawlers receive errors or challenges.
- Review indexed pages and incoming search traffic over time. Recommendations depend on the query, content relevance, and the search provider.

Community posts, project links, and references from relevant sites can help people discover the handbook. Describe the content actually available and link to a relevant lesson or subject. Planned trails should retain their status until their lessons are published.

## Validation

After `bundle exec jekyll build`, run `node scripts/check-discovery.mjs`. CI checks that sitemap entries resolve to built HTML with canonical URLs and valid structured data, excludes discovery files and the error page, and verifies the robots sitemap URL.

Crawler access and metadata make discovery possible. They do not guarantee indexing or recommendations. An `llms.txt` file is optional; Google documents that special AI text files are unnecessary for its AI search features.

References:

- [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)
- [Google AI features and website guidance](https://developers.google.com/search/docs/appearance/ai-features)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
