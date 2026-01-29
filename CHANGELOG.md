# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- **Exclusion Settings Support**: Automatic loading of Obsidian's user-configured file exclusion patterns from `.obsidian/app.json`
  - Reads `userIgnoreFilters` array from Obsidian's app configuration
  - Built-in default exclusions for `.obsidian`, `.git`, and `.DS_Store`
  - Smart pattern matching supporting directory-level and file-level exclusions
- **Exclusion Awareness in Tools**:
  - `list_notes`: Respects exclusion patterns - excluded files/folders won't appear in listings
  - `search_vault`: Excludes files in excluded paths from search results
  - `read_note` & `read_multiple_notes`: Can still read excluded files directly (intentional flexibility)

### Implementation Details

- New function `loadExclusions()`: Safely loads exclusion patterns from `.obsidian/app.json` with fallback to defaults
- New function `isExcluded()`: Efficiently checks if a file path matches any exclusion pattern
- Supports both exact file matching and directory-based exclusions (with trailing slash)
- Pattern matching handles path separators correctly across platforms (Windows/Unix)

### How It Works

1. On server startup, the system reads `.obsidian/app.json` in the vault directory
2. If `userIgnoreFilters` array exists, those patterns are loaded
3. These patterns are combined with default exclusions
4. All vault operations (`list_notes`, `search_vault`) respect these exclusions
5. Direct file reads (`read_note`) can still access excluded files for flexibility

## Previous Versions

For previous version history, please see the main repository commit history.

### Version 1.7.0

- Added auto backlink generation feature (`auto_backlink_vault` tool)
- Added strategic insights analysis (`notes_insight` tool)
- Support for recursive file listing control

### Version 1.6.0

- Enhanced `update_note` tool with PATCH precision insertion
- Added heading-based insertion (before/after/append/prepend)
- Added block ID-based insertion with `^block-id` support
- PATCH API integration with filesystem fallback

### Version 1.5.0 and earlier

- Core note management tools
- Folder operations
- Full-text search
- Obsidian REST API integration
