# This script is executed by Windsurf IDE to start the MCP server.
# It runs the mcp-server.js file inside the running nodejs-tools Docker container.

$scriptPath = "/app/Scripts/MCP/mcp-server.js"
Write-Host "[Launcher] Attempting to start MCP server in Docker container 'nodejs-tools'..."

# Stop any previously running instance to ensure a clean start
docker exec nodejs-tools pkill node 2>$null

# Start the server in detached (background) mode
Write-Host "[Launcher] Starting MCP server in detached mode..."
docker exec -d nodejs-tools node $scriptPath

Write-Host "[Launcher] MCP server process started."
