# n8n Node Documentation Cache

This directory is the offline mirror of the official **n8n-io/n8n-docs**
repository, organised per node and language. It is populated automatically
by the API server's `nodeDocs.service` + `nodeDocsPipeline.service`.

## Layout

```
docs/
├── README.md                      ← you are here
├── en/
│   └── <safe-node-key>.md         ← English markdown (post-processed)
├── ar/
│   └── <safe-node-key>.md         ← Arabic translation (lazy / bulk)
├── _assets/
│   └── <safe-node-key>/           ← every image referenced by the doc,
│       ├── oauth-screenshot.png      downloaded once and served by the
│       └── …                         API at /api/catalog/docs/assets/…
└── _meta/
    ├── _repo-tree.json            ← cached n8n-docs git tree (one shot
    │                                  vs hundreds of contents-API calls)
    └── <safe-node-key>.json       ← per-node manifest:
                                      { sourceUrl, frontmatter, siblings,
                                        assets, fetchedAt }
```

`<safe-node-key>` is the node type with `/` → `__` and `@` → `_at_`
(see `safeNodeKey()` in `nodeDocsPipeline.service.ts`). Example:

| nodeType                                  | safe key                                  |
| ----------------------------------------- | ----------------------------------------- |
| `n8n-nodes-base.slack`                    | `n8n-nodes-base.slack`                    |
| `@n8n/n8n-nodes-langchain.agent`          | `_at_n8n__n8n-nodes-langchain.agent`      |

## What the pipeline does

For every node the API server:

1. Resolves the source `.md` file inside `n8n-io/n8n-docs` from the node's
   `primaryDocsUrl`, trying both `…/<slug>.md` and `…/<slug>/index.md`.
2. Extracts and **preserves** the YAML frontmatter as a generated header
   (`# Title` + `> description`) injected into the output.
3. Resolves MkDocs `--8<--` snippet includes against the cached repo tree
   so they never silently disappear.
4. When the source is `…/index.md`, walks the directory in the cached
   repo tree and appends every sibling `.md` (operations, credentials,
   common-issues, node-parameters, …) under proper `## Heading` sections.
5. Converts MkDocs admonitions (`/// note | … ///`) to standard
   blockquotes that `react-markdown` understands.
6. Replaces MkDocs widget shortcodes (`[[ templatesWidget(…) ]]`,
   `[[ schemaUiWidget(…) ]]`) with friendly links to the live docs site
   instead of erasing them.
7. Rewrites every relative `*.md` link to its `https://docs.n8n.io/…/`
   equivalent so the links remain navigable.
8. Discovers every image reference (markdown + HTML), downloads each one
   into `_assets/<node>/` and rewrites the URL to `/api/catalog/docs/
   assets/<node>/<file>` so the browser can render it without hitting
   GitHub on every page load.
9. Writes a per-node manifest to `_meta/<node>.json`.
10. Saves the final markdown to `en/<node>.md` and updates the
    `node_docs` table in the database. Translations are written to
    `ar/<node>.md` lazily.

## Resilience

- The repo tree is cached **in memory + on disk** (TTL 6h). If GitHub is
  temporarily unreachable, the on-disk cache is used.
- `hydrateDocsFromLocalFiles()` re-imports every `*.md` from `en/` and
  `ar/` into the database on boot, so a `drizzle push` reset never costs
  you a re-translation.
- Setting the `GITHUB_TOKEN` environment variable raises the GitHub API
  limit from 60 → 5000 req/h. The pipeline still works without one
  (uses raw.githubusercontent.com, which has no rate limit).
