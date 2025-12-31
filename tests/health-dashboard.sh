#!/bin/zsh
# System Health Dashboard
# Real-time monitoring of all Khalifa services

ROOT_DIR="/Users/hk/Desktop/Khalifa Mgmt."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen and show header
clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}     🎯 KHALIFA MANAGEMENT SYSTEM - HEALTH DASHBOARD 🎯    ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check service health
check_service() {
  local name=$1
  local port=$2
  local path=${3:-"/"}
  
  if timeout 2 curl -s "http://localhost:$port$path" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $name"
    return 0
  else
    echo -e "${RED}❌${NC} $name"
    return 1
  fi
}

# Function to check container status
check_container() {
  local name=$1
  
  if docker ps --filter "name=$name" --format "{{.Status}}" | grep -q "Up"; then
    local status=$(docker ps --filter "name=$name" --format "{{.Status}}")
    echo -e "${GREEN}✅${NC} $name ($status)"
    return 0
  else
    echo -e "${RED}❌${NC} $name (not running)"
    return 1
  fi
}

# Function to get container stats
get_container_stats() {
  local name=$1
  
  if docker ps --filter "name=$name" --format "{{.Names}}" | grep -q "$name"; then
    local stats=$(docker stats --no-stream "$name" 2>/dev/null | tail -1)
    if [ ! -z "$stats" ]; then
      echo "$stats" | awk '{printf "%5s CPU, %6s MEM", $3, $4}'
    else
      echo "Stats unavailable"
    fi
  else
    echo "Container not found"
  fi
}

# ============================================
# Container Status
# ============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 CONTAINER STATUS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_container "khalifa-mgmt-app"
check_container "khalifa-mgmt-mongo"
check_container "intake-form-app-backend"
check_container "intake-form-app-frontend"
check_container "intake-form-app-mongo"

echo ""

# ============================================
# Service Health
# ============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🏥 SERVICE HEALTH${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_service "Khalifa Management" "3000" "/"
check_service "Intake Frontend" "3006" "/"
check_service "Intake Backend API" "5001" "/api/health"

echo ""

# ============================================
# Resource Usage
# ============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 RESOURCE USAGE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "Khalifa App:         $(get_container_stats 'khalifa-mgmt-app')"
echo -e "Khalifa MongoDB:     $(get_container_stats 'khalifa-mgmt-mongo')"
echo -e "Intake Backend:      $(get_container_stats 'intake-form-app-backend')"
echo -e "Intake Frontend:     $(get_container_stats 'intake-form-app-frontend')"
echo -e "Intake MongoDB:      $(get_container_stats 'intake-form-app-mongo')"

echo ""

# ============================================
# Network Status
# ============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 NETWORK CONNECTIVITY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "Port 3000 (Khalifa):     $(lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null && echo -e "${GREEN}✅ Open${NC}" || echo -e "${RED}❌ Closed${NC}")"
echo -e "Port 3006 (Intake FE):   $(lsof -Pi :3006 -sTCP:LISTEN -t >/dev/null && echo -e "${GREEN}✅ Open${NC}" || echo -e "${RED}❌ Closed${NC}")"
echo -e "Port 5001 (Intake API):  $(lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null && echo -e "${GREEN}✅ Open${NC}" || echo -e "${RED}❌ Closed${NC}")"
echo -e "Port 27017 (Khalifa DB): $(lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null && echo -e "${GREEN}✅ Open${NC}" || echo -e "${RED}❌ Closed${NC}")"
echo -e "Port 27018 (Intake DB):  $(lsof -Pi :27018 -sTCP:LISTEN -t >/dev/null && echo -e "${GREEN}✅ Open${NC}" || echo -e "${RED}❌ Closed${NC}")"

echo ""

# ============================================
# Quick Links
# ============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔗 QUICK LINKS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "🌐 Applications:"
echo "   • Khalifa Management:  ${BLUE}http://localhost:3000${NC}"
echo "   • Intake Form:         ${BLUE}http://localhost:3006${NC}"
echo "   • API Docs:            ${BLUE}http://localhost:5001/api/health${NC}"
echo ""

echo "📋 Useful Commands:"
echo "   • View all logs:       ${BLUE}docker-compose -f $ROOT_DIR/docker-compose.yml logs -f${NC}"
echo "   • Run tests:           ${BLUE}cd $ROOT_DIR/tests && ./run-all-tests.sh${NC}"
echo "   • Check status:        ${BLUE}docker ps${NC}"
echo ""

# ============================================
# Summary
# ============================================

KHALIFA_OK=$(check_service "Khalifa Management" "3000" "/" 2>/dev/null && echo 1 || echo 0)
INTAKE_OK=$(check_service "Intake Backend API" "5001" "/api/health" 2>/dev/null && echo 1 || echo 0)

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $KHALIFA_OK -eq 1 ] && [ $INTAKE_OK -eq 1 ]; then
  echo -e "${GREEN}✨ SYSTEM STATUS: ALL SYSTEMS OPERATIONAL ✨${NC}"
else
  echo -e "${YELLOW}⚠️  SYSTEM STATUS: SOME ISSUES DETECTED${NC}"
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
