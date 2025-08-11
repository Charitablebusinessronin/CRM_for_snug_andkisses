#!/bin/bash
# MCP Server Monitoring and Health Check Script

set -e

echo "🔍 MCP Server Monitoring Dashboard"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to check Docker daemon
check_docker() {
    echo -e "\n${BLUE}Docker Daemon Status:${NC}"
    if docker info >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker daemon is running${NC}"
        docker version --format 'Version: {{.Server.Version}} | OS: {{.Server.Os}}/{{.Server.Arch}}'
    else
        echo -e "${RED}❌ Docker daemon is not accessible${NC}"
        exit 1
    fi
}

# Function to check MCP images
check_mcp_images() {
    echo -e "\n${BLUE}MCP Docker Images:${NC}"
    local mcp_images=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | grep -E "mcp/|github.*mcp" | head -10)
    if [[ -n "$mcp_images" ]]; then
        echo "$mcp_images"
    else
        echo -e "${YELLOW}⚠️  No MCP images found${NC}"
    fi
}

# Function to check running containers
check_running_containers() {
    echo -e "\n${BLUE}Running Containers:${NC}"
    local containers=$(docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}")
    if [[ $(docker ps -q | wc -l) -gt 0 ]]; then
        echo "$containers"
    else
        echo -e "${YELLOW}⚠️  No containers currently running${NC}"
    fi
}

# Function to check system resources
check_resources() {
    echo -e "\n${BLUE}System Resources:${NC}"
    
    # Memory
    echo -e "${CYAN}Memory Usage:${NC}"
    free -h | grep -E "Mem:|Swap:"
    
    # Disk
    echo -e "\n${CYAN}Disk Usage:${NC}"
    df -h | grep -E "^(/dev|tmpfs)" | head -5
    
    # Docker resources
    echo -e "\n${CYAN}Docker System Usage:${NC}"
    docker system df
}

# Function to test MCP connectivity
test_mcp_connectivity() {
    echo -e "\n${BLUE}MCP Server Connectivity Test:${NC}"
    
    local servers=("mcp/context7" "mcp/notion" "mcp/desktop-commander" "mcp/dockerhub")
    
    for server in "${servers[@]}"; do
        if docker images -q "$server" >/dev/null 2>&1; then
            echo -n "Testing $server... "
            if echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}' | \
               timeout 10 docker run -i --rm --init --security-opt no-new-privileges --memory=256m --cpus=0.25 "$server" >/dev/null 2>&1; then
                echo -e "${GREEN}✅ OK${NC}"
            else
                echo -e "${RED}❌ FAILED${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  $server image not found${NC}"
        fi
    done
}

# Function to check network connectivity
check_network() {
    echo -e "\n${BLUE}Network Connectivity:${NC}"
    
    # Check internet connectivity
    if curl -s --connect-timeout 5 https://google.com >/dev/null; then
        echo -e "${GREEN}✅ Internet connectivity: OK${NC}"
    else
        echo -e "${RED}❌ Internet connectivity: FAILED${NC}"
    fi
    
    # Check Docker Hub connectivity
    if curl -s --connect-timeout 5 https://registry-1.docker.io >/dev/null; then
        echo -e "${GREEN}✅ Docker Hub connectivity: OK${NC}"
    else
        echo -e "${RED}❌ Docker Hub connectivity: FAILED${NC}"
    fi
}

# Function to show performance metrics
show_performance() {
    echo -e "\n${BLUE}Performance Metrics:${NC}"
    
    # CPU usage
    echo -e "${CYAN}CPU Usage:${NC}"
    top -bn1 | grep "Cpu(s)" || echo "CPU info not available"
    
    # Load average
    echo -e "\n${CYAN}Load Average:${NC}"
    uptime
    
    # Docker stats for running containers
    if [[ $(docker ps -q | wc -l) -gt 0 ]]; then
        echo -e "\n${CYAN}Container Resource Usage:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
    fi
}

# Main execution
main() {
    check_docker
    check_mcp_images
    check_running_containers
    check_resources
    test_mcp_connectivity
    check_network
    show_performance
    
    echo -e "\n${GREEN}🎉 MCP Monitoring Complete!${NC}"
    echo -e "${BLUE}Run this script periodically to monitor MCP health${NC}"
}

# Allow script to be run with specific functions
if [[ $# -eq 0 ]]; then
    main
else
    case $1 in
        "docker")
            check_docker
            ;;
        "images")
            check_mcp_images
            ;;
        "containers")
            check_running_containers
            ;;
        "resources")
            check_resources
            ;;
        "connectivity")
            test_mcp_connectivity
            ;;
        "network")
            check_network
            ;;
        "performance")
            show_performance
            ;;
        *)
            echo "Usage: $0 [docker|images|containers|resources|connectivity|network|performance]"
            exit 1
            ;;
    esac
fi