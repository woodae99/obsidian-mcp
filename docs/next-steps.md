# Next steps

Use this when resuming work on the link-aware Obsidian MCP workflow.

## Current status

- MCP `move_note` delegates to `obsidian-link-extension` by default for link-aware file moves.
- MCP `manage_folder rename` and `manage_folder move` delegate to the same route for link-aware folder operations.
- MCP `manage_folder create/delete` use filesystem operations and return structured metadata/warnings.
- Tool descriptions in `src/index.ts` have been updated for `move_note`, `manage_folder`, and `auto_backlink_vault`.
- Documentation has been updated in `README.md`, `AGENTS.md`, `.env.example`, `CHANGELOG.md`, and `docs/link-aware-moves.md`.

## Verified checks

- `npm run build` passes.
- Live MCP harnesses verified:
  - link-aware note move dry-run
  - missing-plugin safe failure
  - explicit unsafe fallback branch
  - folder rename/move via Obsidian Core
  - structured `manage_folder` responses
  - link-kind behavior across wiki and Markdown links

## Companion plugin state

The companion plugin lives in the test vault, not this repository:

```text
/mnt/c/Users/colin/Dev/obsidian-link-extension/.obsidian/plugins/obsidian-link-extension
```

Current route/version:

```text
version: 0.3.0
primary route: /links/move-v3
compat route: /links/update-v4
```

It accepts `TFile` and `TFolder`, delegates to `app.fileManager.renameFile()`, and returns metadata including `sourceType`, `moved`, `oldStillExists`, `scannedVault:false`, and `renamePromiseSettled`.

## Suggested next work

1. Add committed automated tests or fixtures for the MCP behavior currently covered by temporary live harnesses.
2. Decide whether to vendor/package the companion `obsidian-link-extension` plugin or keep it as a separate test-vault plugin.
3. Add optional `dryRun` support to `manage_folder rename/move` if callers need preview semantics.
4. Consider a future content-enrichment redesign/rename for `auto_backlink_vault`, possibly with Omnisearch-assisted candidate selection.
5. If deeper REST API certainty is needed, inspect upstream Local REST API source/changelog or ask the maintainers whether native link-aware rename/move endpoints are planned.
