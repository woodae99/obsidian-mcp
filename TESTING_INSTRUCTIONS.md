# Testing the Obsidian MCP Exclusion Settings Feature

## Build Status

✅ The feature branch `obsidian-exclusion-settings` has been successfully built. The compiled JavaScript is available in the `build/` directory.

## What's New in This Feature

This feature adds **exclusion settings support** to the Obsidian MCP server:

- **Automatic Exclusion Loading**: The server now reads Obsidian's `.obsidian/app.json` settings to load user-defined `userIgnoreFilters`
- **Default Exclusions**: Includes built-in exclusions for `.obsidian`, `.git`, and `.DS_Store`
- **Smart Pattern Matching**: Supports directory-level and glob-style pattern exclusions
- **All Tools Respect Exclusions**: The following tools now honor the exclusion settings:
  - `list_notes` - Won't return excluded files/folders
  - `search_vault` - Won't search in excluded paths
  - `read_note` - Can still read excluded files (for flexibility)
  - `read_multiple_notes` - Same behavior as `read_note`

## Testing Setup

### Prerequisites

1. Node.js 16+ installed
2. An Obsidian vault with the [Local REST API plugin](https://github.com/colineckert/obsidian-local-rest-api) installed and configured
3. The Local REST API plugin must be enabled with an API token

### Step 1: Start the MCP Server

In your terminal:

```bash
cd /path/to/obsidian-mcp

# Option A: Direct execution (recommended for testing)
node build/index.js --vault-path "C:\path\to\your\vault" --api-token "your-api-token"

# Option B: Using npm
npm start -- --vault-path "C:\path\to\your\vault" --api-token "your-api-token"

# Option C: Using environment variables
set OBSIDIAN_VAULT_PATH=C:\path\to\your\vault
set OBSIDIAN_API_TOKEN=your-api-token
node build/index.js
```

**Note**: Replace `"C:\path\to\your\vault"` with your actual Obsidian vault path and `"your-api-token"` with your Local REST API token.

### Step 2: Configure Your Test Vault

Before testing, configure exclusions in Obsidian:

1. Open your Obsidian vault
2. Go to Settings → Files & Links
3. Under "Ignore files" add some test patterns, for example:
   - `private/` (directory exclusion)
   - `archive/` (directory exclusion)
   - `temp.md` (file exclusion)

These settings will be automatically loaded from `.obsidian/app.json` when the MCP server starts.

### Step 3: Test with Claude MCP Client

#### Option A: Using Claude.ai with MCP Support

1. Install the [Claude MCP Extension](https://github.com/modelcontextprotocol/build)
2. In the extension settings, configure the server:

```json
{
  "obsidian-mcp": {
    "command": "node",
    "args": ["/path/to/obsidian-mcp/build/index.js"],
    "env": {
      "OBSIDIAN_VAULT_PATH": "C:\\path\\to\\your\\vault",
      "OBSIDIAN_API_TOKEN": "your-api-token"
    }
  }
}
```

3. Test the `list_notes` tool:

```
@list_notes
```

**Expected Result**: Files and folders in your exclusion list should not appear in the output.

#### Option B: Using the Local Test Script

Create a test file `test-exclusions.js`:

```javascript
import { spawn } from "child_process";
import axios from "axios";

const server = spawn("node", [
  "build/index.js",
  "--vault-path",
  "C:\\path\\to\\your\\vault",
  "--api-token",
  "your-api-token",
]);

server.stdout.on("data", (data) => {
  console.log(`Server: ${data}`);
});

server.stderr.on("data", (data) => {
  console.error(`Error: ${data}`);
});

// After a few seconds, test with a simple HTTP request
setTimeout(() => {
  console.log("Testing list_notes tool...");
  // The server is now ready to accept MCP requests
}, 2000);

process.on("SIGINT", () => {
  server.kill();
  process.exit();
});
```

#### Option C: Manual Testing with stdio Transport

1. Start the server:

```bash
node build/index.js --vault-path "C:\path\to\your\vault" --api-token "your-api-token"
```

2. Send MCP requests via stdin (for testing). Example JSON-RPC request:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "list_notes", "arguments": { "folder": "" } }
}
```

## Test Cases

### Test 1: Verify Exclusions in list_notes

```
Tool: list_notes
Arguments: {}
Expected: Files/folders matching your exclusion patterns should be missing
```

### Test 2: Verify Exclusions in search_vault

```
Tool: search_vault
Arguments: {"query": "*"}
Expected: Search results should not include files in excluded paths
```

### Test 3: Verify Direct Read Still Works

```
Tool: read_note
Arguments: {"note_path": "private/secret-note.md"}
Expected: Even though "private/" is excluded, you can still read the file directly
```

### Test 4: Verify Default Exclusions

```
Tool: list_notes
Arguments: {"folder": ""}
Expected: .obsidian, .git, .DS_Store folders should never appear
```

### Test 5: Test Pattern Matching

Create test structure:

```
vault/
├── normal-folder/
│   └── note.md
├── private/
│   └── secret.md
├── archive/
│   └── old.md
└── temp.md
```

Configure exclusions:

- `private/`
- `archive/`
- `temp.md`

Run `list_notes` and verify:

- ✅ normal-folder/note.md appears
- ❌ private/secret.md does not appear
- ❌ archive/old.md does not appear
- ❌ temp.md does not appear

## Troubleshooting

### Server Won't Start

- Ensure the vault path exists and is correct
- Check that Obsidian is running and the Local REST API plugin is enabled
- Verify the API token is correct: `node build/index.js --help` for usage

### Exclusions Not Being Respected

- Check that your Obsidian vault's `.obsidian/app.json` file exists
- Verify the `userIgnoreFilters` array is properly formatted in `app.json`
- Restart the server after changing settings in Obsidian
- Check the server console output for any warnings about loading exclusions

### Can't Read Excluded Files

- This is expected behavior - direct file reads work even for excluded files
- This is intentional to allow flexibility when you need to access excluded files directly

## Debugging

Enable verbose logging by adding debug output:

```bash
# Run with debug environment variable if the server supports it
set DEBUG=obsidian-mcp:*
node build/index.js --vault-path "C:\path\to\your\vault" --api-token "your-api-token"
```

Check the server's stderr output for any exclusion-related messages.

## Integration with Different MCP Clients

### Cursor IDE

Add to `.cursor/config.json` or settings:

```json
{
  "mcp_server": {
    "obsidian-mcp": {
      "command": "node",
      "args": ["path/to/build/index.js"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "C:\\path\\to\\vault",
        "OBSIDIAN_API_TOKEN": "token"
      }
    }
  }
}
```

### VSCode with MCP Extension

Follow similar configuration in VSCode's MCP extension settings.

## Cleanup

When done testing, kill the server:

```bash
# In the terminal where it's running:
Ctrl+C
```

---

**Feature Branch**: `obsidian-exclusion-settings-9245876029095822211`
**Build Date**: Ready for testing
**Main Changes**: Added automatic exclusion pattern loading from Obsidian's app.json settings
