# Link-aware moves and folder renames

This repository now supports link-preserving structural operations by delegating moves and renames to Obsidian Core through a companion Local REST API extension route.

## Flow

```text
move_note / manage_folder rename / manage_folder move
  → POST /links/move-v3 on obsidian-link-extension
  → app.fileManager.renameFile(TFile | TFolder, newPath)
  → Obsidian Core updates recognized links using its own settings and prompts
```

The MCP server intentionally does **not** scan all notes or manually rewrite links during structural operations. Real vaults can be large, and Obsidian already has an indexed link-update path.

## Configuration

Default route:

```text
/links/move-v3
```

Overrides:

```bash
OBSIDIAN_LINK_PLUGIN_MOVE_ROUTE=/links/move-v3
node build/index.js --link-plugin-move-route /links/move-v3
```

## Tool behavior

### `move_note`

- Defaults to `updateLinks: true`.
- Calls the configured link-extension route.
- Fails safely if the route is missing/unavailable.
- Raw filesystem fallback requires explicit `updateLinks:false` and `allowUnsafeFallback:true`.
- Supports `dryRun` through the plugin route.

### `manage_folder`

- `create`: filesystem operation; returns structured metadata.
- `rename`: link-aware Obsidian Core operation.
- `move`: link-aware Obsidian Core operation.
- `delete`: filesystem operation; returns a warning because links to deleted notes may break.

## Observed link behavior

Live tests showed Obsidian Core updated:

- Basename/path wikilinks
- Embeds
- Heading links
- Alias links
- Block links
- URL-encoded relative Markdown links

Live tests showed Obsidian Core did **not** update:

- Unencoded Markdown links with literal spaces, e.g. `[MD plain](../../Targets/Link Target.md)`
- Markdown links written as vault-root paths, e.g. `[MD vault](vault/.../Targets/Link%20Target.md)`

Treat this as native Obsidian behavior. The MCP server should not infer link settings or manually rewrite these during structural moves.

## REST API status

Current Obsidian Local REST API docs expose vault CRUD, active/periodic notes, search, commands, tags, open, and extension route support. No native link-aware file/folder rename/move endpoint was found, so the companion extension route remains necessary.
