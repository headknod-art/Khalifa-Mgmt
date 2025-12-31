#!/bin/zsh
# Full Test Suite Runner
# Runs comprehensive integration tests followed by performance tests

set -e

ROOT_DIR="/Users/hk/Desktop/Khalifa Mgmt."
TEST_DIR="$ROOT_DIR/tests"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_section() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${CYAN}$1${NC}\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# Show header
clear
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}         🧪 KHALIFA MANAGEMENT - FULL TEST SUITE 🧪         ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                                            ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
TEST_TYPE=${1:-"all"} # all, integration, performance

log_info "Test Type: $TEST_TYPE"
log_info "Test Directory: $TEST_DIR"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed"
  exit 1
fi

log_success "Node.js available ($(node --version))"

# Navigate to test directory
cd "$TEST_DIR" || {
  log_error "Cannot access test directory: $TEST_DIR"
  exit 1
}

# Variables for results
INTEGRATION_RESULT=0
PERFORMANCE_RESULT=0
START_TIME=$(date +%s)

# ============================================
# Integration Tests
# ============================================

if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "integration" ]]; then
  log_section "PHASE 1: INTEGRATION TESTS"
  
  log_info "Starting comprehensive integration tests..."
  echo ""
  
  if node comprehensive-integration-tests.js; then
    INTEGRATION_RESULT=0
    log_success "Integration tests completed successfully"
  else
    INTEGRATION_RESULT=1
    log_warning "Some integration tests failed"
  fi
fi

# ============================================
# Performance Tests
# ============================================

if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "performance" ]]; then
  log_section "PHASE 2: PERFORMANCE & LOAD TESTS"
  
  log_info "Starting performance and load tests..."
  log_warning "This will take approximately 2-3 minutes"
  echo ""
  
  if node performance-load-test.js; then
    PERFORMANCE_RESULT=0
    log_success "Performance tests completed successfully"
  else
    PERFORMANCE_RESULT=1
    log_warning "Some performance tests encountered issues"
  fi
fi

# ============================================
# Final Report
# ============================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log_section "TEST EXECUTION SUMMARY"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Results:${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "integration" ]]; then
  if [ $INTEGRATION_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Integration Tests: PASSED${NC}"
  else
    echo -e "${RED}❌ Integration Tests: FAILED${NC}"
  fi
fi

if [[ "$TEST_TYPE" == "all" || "$TEST_TYPE" == "performance" ]]; then
  if [ $PERFORMANCE_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Performance Tests: PASSED${NC}"
  else
    echo -e "${RED}❌ Performance Tests: FAILED${NC}"
  fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⏱️  Total Execution Time: ${DURATION}s${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Overall result
if [ $INTEGRATION_RESULT -eq 0 ] && [ $PERFORMANCE_RESULT -eq 0 ]; then
  log_success "ALL TESTS PASSED! 🎉"
  echo ""
  echo -e "${GREEN}Your system is ready for production!${NC}"
  exit 0
else
  log_error "SOME TESTS FAILED"
  echo ""
  echo -e "${YELLOW}Please review the output above and troubleshoot any issues.${NC}"
  echo -e "${YELLOW}See README.md in the tests directory for help.${NC}"
  exit 1
fi
