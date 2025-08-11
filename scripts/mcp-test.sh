#!/bin/bash
# MCP Server Test and Validation Script

set -e

echo "🚀 MCP Server Test and Validation"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_mcp_server() {
    local server_name=$1
    local docker_image=$2
    
    echo -e "\n${BLUE}Testing MCP Server: ${server_name}${NC}"
    echo "Docker Image: ${docker_image}"
    
    # Test stdio transport
    echo -e "${YELLOW}Testing stdio transport...${NC}"
    
    local test_cmd='{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}'
    
    if echo "${test_cmd}" | docker run -i --rm --init --security-opt no-new-privileges --memory=256m --cpus=0.25 "${docker_image}" | grep -q "jsonrpc"; then
        echo -e "${GREEN}✅ ${server_name} stdio transport: WORKING${NC}"
        return 0
    else
        echo -e "${RED}❌ ${server_name} stdio transport: FAILED${NC}"
        return 1
    fi
}

# Test available MCP servers
echo -e "\n${BLUE}Available MCP Docker Images:${NC}"
docker images | grep mcp | head -10

echo -e "\n${BLUE}Testing MCP Servers...${NC}"

# Test each server
test_mcp_server "context7" "mcp/context7"
test_mcp_server "notion" "mcp/notion"
test_mcp_server "desktop-commander" "mcp/desktop-commander"
test_mcp_server "dockerhub" "mcp/dockerhub"

# System resource check
echo -e "\n${BLUE}System Resources:${NC}"
echo "Memory usage:"
free -h | grep -E "Mem:|Swap:"
echo -e "\nDocker system info:"
docker system df

# Docker daemon status
echo -e "\n${BLUE}Docker Status:${NC}"
docker version --format 'Client: {{.Client.Version}} | Server: {{.Server.Version}}'
docker info --format '{{.ServerVersion}} | {{.Architecture}} | {{.OSType}} | Containers: {{.Containers}} | Images: {{.Images}}'

echo -e "\n${GREEN}🎉 MCP Server Testing Complete!${NC}"