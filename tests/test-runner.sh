#!/bin/zsh
# Test Runner Script for Khalifa Management System
# Runs comprehensive integration tests

set -e

ROOT_DIR="/Users/hk/Desktop/Khalifa Mgmt."
TEST_DIR="$ROOT_DIR/tests"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 KHALIFA MANAGEMENT - INTEGRATION TEST RUNNER${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed"
  exit 1
fi

log_success "Node.js is available ($(node --version))"

# Navigate to test directory
cd "$TEST_DIR" || exit 1

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  log_info "Installing test dependencies..."
  npm init -y > /dev/null 2>&1 || true
fi

# Run tests
echo ""
log_info "Starting integration tests..."
echo ""

if node comprehensive-integration-tests.js; then
  log_success "All tests completed"
else
  log_error "Some tests failed"
  exit 1
fi
