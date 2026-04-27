# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian MCP (Model Context Protocol) server that enables AI models to interact with Obsidian knowledge bases. The server provides tools for reading, creating, updating, and deleting notes, as well as managing folder structures and searching vault content.

## Architecture

- **Main Server**: `src/index.ts` - Single-file TypeScript implementation using the MCP SDK
- **Core Class**: `ObsidianMcpServer` - Handles all MCP protocol operations and Obsidian API interactions
- **API Strategy**: Obsidian Local REST API for note CRUD/search; link-aware note/folder move operations delegate to Obsidian Core through the companion `obsidian-link-extension` route instead of raw filesystem fallback.
- **Transport**: Uses stdio transport for MCP communication
- **Environment Configuration**: Uses dotenv for API tokens and vault paths

## Development Commands

```bash
# Build the project
npm run build

# Run in development mode
npm run dev

# Start the server
npm start

# Run tests
npm test
```

## Key Components

### MCP Tools Available:
- `list_notes` - List all notes in vault (with optional folder filtering)
- `read_note` - Read specific note content  
- `create_note` - Create new notes
- `search_vault` - Smart search across vault (filename + content, all file types)
- `delete_note` - Delete notes
- `move_note` - Move/rename notes through Obsidian Core by default so inbound links are updated; unsafe filesystem fallback requires explicit opt-in
- `manage_folder` - Folder CRUD; rename/move use Obsidian Core through `obsidian-link-extension`, create/delete use filesystem operations with structured responses/warnings
- `update_note` - Update content in existing notes using targeted text replacements
- `read_multiple_notes` - Read content from multiple notes simultaneously
- `auto_backlink_vault` - Content-enrichment tool that links plain-text mentions; not used for structural move/rename link maintenance
- `notes_insight` - **NEW**: Generate strategic insights about a topic using TRILEMMA-PRINCIPLES framework with AI-powered content summarization

### Environment Variables:
- `OBSIDIAN_VAULT_PATH` - Path to the Obsidian vault
- `OBSIDIAN_API_TOKEN` - API token for Obsidian Local REST API plugin
- `OBSIDIAN_API_PORT` - Port for Obsidian API (default: 27123)
- `OBSIDIAN_LINK_PLUGIN_MOVE_ROUTE` - Link-aware move route exposed by `obsidian-link-extension` (default: `/links/move-v3`)

### Error Handling:
- Graceful fallback from Obsidian API to direct filesystem operations
- Proper MCP error responses with appropriate error codes
- Comprehensive logging for debugging

## Dependencies

- `@modelcontextprotocol/sdk` - Core MCP protocol implementation
- `axios` - HTTP client for Obsidian API calls
- `dotenv` - Environment variable management
- `typescript` and `ts-node` - TypeScript tooling

## Installation Methods

### 1. DXT Extension (One-click Installation) - Recommended
Simplest method for end users:
- Download `obsidian-mcp.dxt` file  
- Double-click to install, configure via GUI
- No manual JSON configuration required

### 2. NPM Package (Remote Installation)  
For Node.js users who want automatic updates:
- Uses npx for zero-installation deployment
- Always fetches latest version from NPM registry
- Configured via bash wrapper in MCP client

### 3. Local Deployment
For users needing offline usage or full control:
- **Global Installation**: npm install -g for system-wide access
- **Source Deployment**: Git clone + local build for customization
- **Docker Deployment**: Containerized deployment for isolation

## Configuration Parameters

All methods require these configuration values:
- `vault_path` / `OBSIDIAN_VAULT_PATH`: Path to Obsidian vault
- `api_token` / `OBSIDIAN_API_TOKEN`: Obsidian Local REST API plugin token
- `api_port` / `OBSIDIAN_API_PORT`: API port (default: 27123)

## Key Features

### Link-aware Structural Operations
- **Obsidian Core Delegation**: `move_note` and `manage_folder` rename/move call the configured `obsidian-link-extension` route, which invokes `app.fileManager.renameFile()` inside Obsidian.
- **Native Link Updates**: Obsidian Core handles recognized wikilinks/Markdown links according to its own settings and prompts; the MCP server does not scan/rewrite the vault for structural moves.
- **Safe Defaults**: Missing plugin route fails safely instead of silently falling back to raw filesystem moves. Raw note fallback requires explicit `updateLinks:false` and `allowUnsafeFallback:true`.
- **Structured Results**: Move/rename responses include mode, link update mode, scan status, and plugin response metadata such as `sourceType`, `moved`, and `renamePromiseSettled` when available.

### Robust Error Handling
- **Comprehensive Validation**: Checks source existence, destination conflicts, and exclusion rules.
- **Explicit Fallbacks**: Filesystem fallbacks are used for folder create/delete and explicit unsafe note moves only; link-preserving moves require the plugin route.

## Docker Support

The project includes Docker configuration (`Dockerfile` and `docker-compose.yml`) for containerized deployment with proper environment variable handling and volume mounting for vault access.

## Debugging

For troubleshooting DXT issues, detailed debug code is available in `debug-code.md`. The debug version adds extensive logging to:
- API request/response details
- File path resolution  
- Search matching logic
- Error handling flows

To enable debug mode:
1. Copy debug code from `debug-code.md` to appropriate locations in `src/index.ts`
2. Build and generate debug DXT version
3. Monitor Codex Desktop logs: `tail -f ~/Library/Logs/Codex/mcp*.log`

## Auto Backlink Vault Tool

The `auto_backlink_vault` tool is a content-enrichment / mention-linking tool. It scans notes for plain-text mentions of other note names and can convert those mentions to wikilinks (`[[note name]]`). It is intentionally separate from structural link maintenance: note/folder moves and renames are handled by Obsidian Core via `move_note` / `manage_folder` and the companion link extension.

### Key Features:
- **Smart Detection**: Identifies note names in content while avoiding false positives
- **Batch Processing**: Handles large vaults efficiently with configurable batch sizes
- **Safe Execution**: Defaults to dry-run mode for previewing changes before applying
- **Pattern Exclusion**: Skip specific folders or file patterns (e.g., templates, archives)
- **Intelligent Filtering**: Avoids linking common words and respects existing links
- **Performance Optimized**: Memory-efficient processing with progress reporting

### Usage Parameters:
- `dryRun` (default: true) - Preview changes without applying them
- `excludePatterns` (default: []) - Array of glob patterns to exclude
- `minLength` (default: 3) - Minimum note name length for linking
- `caseSensitive` (default: false) - Whether matching is case sensitive
- `wholeWords` (default: true) - Match only complete words
- `batchSize` (default: 50) - Notes processed per batch

### Safety Features:
- Skips code blocks, existing links, and URLs
- Avoids common English words to prevent over-linking
- Provides detailed preview before making changes
- Supports undo through version control integration

## Recent Updates (v1.7.1-beta) 🎯 BETA RELEASE

### 🧠 Notes Insight Tool - 战略分析新突破

- **🎯 TRILEMMA-PRINCIPLES框架**: 全新的 notes_insight 工具支持深度战略分析
- **🔍 智能主题搜索**: 自动搜索并选择最相关的笔记内容
- **🤖 AI驱动摘要**: 智能处理长笔记，优化上下文长度管理
- **📊 结构化分析**: 系统性的约束识别、假设挑战和突破性解决方案
- **⚡ 灵活配置**: 支持自定义笔记数量、上下文长度等参数
- **🧭 多维分析**: 从时间、空间、实体、技术维度探索解决方案
- **🎪 智能选择**: 基于相关性评分自动选择最优笔记组合

**Beta Testing**: v1.7.1-beta is now available for testing!
- 📦 NPM: `npm install -g @huangyihe/obsidian-mcp@1.7.1-beta`
- 🐙 GitHub: https://github.com/newtype-01/obsidian-mcp/releases/tag/v1.7.1-beta  
- 💾 DXT: Download latest `obsidian-mcp.dxt` for one-click installation
- 🧹 **Enhanced**: Self-contained deployment with embedded TRILEMMA-PRINCIPLES framework

### Previous Updates (v1.6.0) - PATCH 精确插入

### 🎯 PATCH 精确插入 - 革命性功能发布

- **🎯 PATCH 精确插入**: 全新的 update_note 工具支持基于标题和块ID的精确内容插入
- **📍 4种插入位置**: before, after, append, prepend - 灵活的内容定位
- **🎯 智能标题定位**: 支持 1-6 级标题精确匹配和模糊搜索
- **🔗 块ID引用支持**: 完整支持 `^block-id` 格式的块引用
- **🌐 双重API策略**: 优先使用 Obsidian Local REST API PATCH 端点，自动回退到文件系统
- **🔄 向后兼容**: 100% 保持原有替换模式功能
- **🛡️ 智能验证**: 完整的参数验证和详细错误处理
- **⚡ 高性能**: 优化的 Markdown 解析和批量操作支持

**Published**: v1.6.0 is now live on NPM, GitHub, and available as DXT package!
- 📦 NPM: `npm install -g @huangyihe/obsidian-mcp@1.6.0`
- 🐙 GitHub: https://github.com/newtype-01/obsidian-mcp/releases/tag/v1.6.0  
- 💾 DXT: Download `obsidian-mcp.dxt` for one-click installation

### Previous Updates (v1.5.0) - Auto Backlink Vault

- **🔗 Auto Backlink Vault**: New tool for automated backlink creation across entire vault
- **🧠 Smart Pattern Matching**: Intelligent detection of note names with false positive prevention
- **⚡ Batch Processing**: Memory-efficient processing of large vaults
- **🛡️ Safety First**: Comprehensive dry-run mode and validation
- **🎯 Precision Linking**: Configurable matching with common word filtering
- **📊 Detailed Reporting**: Progress tracking and change previews

## Notes Insight Tool

The `notes_insight` tool provides intelligent analysis of topics using the TRILEMMA-PRINCIPLES framework with AI-powered content management. It automatically searches your vault for relevant notes, processes them intelligently, and generates strategic insights.

### Key Features:
- **🔍 Smart Search**: Automatically finds notes related to your topic using the existing search_vault functionality
- **🧠 AI-Powered Summarization**: Intelligently summarizes long notes to fit within context limits
- **📊 Strategic Analysis**: Applies TRILEMMA-PRINCIPLES framework for deep analytical insights
- **⚡ Context Management**: Automatically handles content length optimization
- **🎯 Relevance Ranking**: Selects the most relevant notes based on search scores

### Usage Parameters:
- `topic` (required) - The topic or keyword to analyze
- `maxNotes` (default: 5) - Maximum number of notes to analyze
- `maxContextLength` (default: 50000) - Maximum total context length in characters
- `enableSummary` (default: true) - Whether to enable AI summarization for long notes

### How It Works:
1. **Search Phase**: Uses search_vault to find notes related to your topic
2. **Selection Phase**: Ranks results by relevance and selects top notes
3. **Processing Phase**: Applies AI summarization to long notes if needed
4. **Analysis Phase**: Integrates content with TRILEMMA-PRINCIPLES framework
5. **Output Phase**: Returns structured strategic analysis

### Example Usage:
```
Topic: "RAG系统设计"
Result: Strategic analysis identifying constraints (accuracy vs speed vs cost), challenging assumptions about vector databases, and proposing breakthrough solutions for hybrid retrieval systems.
```

### TRILEMMA-PRINCIPLES Framework:
The tool uses a sophisticated analytical framework that:
- Identifies core trilemmas (three conflicting elements)
- Analyzes constraint sources and trade-offs  
- Challenges fundamental assumptions
- Seeks root principles and redefines boundaries
- Designs breakthrough solutions across multiple dimensions
- Creates actionable implementation pathways

### Previous Updates (v1.4.0)
- **🎉 DXT Installation Fully Fixed**: Resolved all compatibility issues with Codex Desktop
- **🔍 Enhanced Search**: Dual search (filename + content), supports all file types, smart scoring
- **🚀 Stability Improvements**: Fixed API response parsing, better error handling, streamlined debug output
- **📚 Documentation**: Updated README files to reflect stable DXT support, removed compatibility warnings
- **🔧 File Type Support**: Now supports all file types (PDF, images, documents) not just .md files
- **⚡ Performance**: Optimized search with filename matching priority and binary file support
- **🛠️ New Tools**: Restored `update_note` and added `read_multiple_notes` tools

## Memories

- to memorize