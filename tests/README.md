# 🧪 Comprehensive Testing Guide

## Overview

This directory contains comprehensive tests for the Khalifa Management System and Intake Form Application, covering:

- **Service Health & Connectivity**: Verifies all containers are running and reachable
- **API Endpoints**: Tests all backend API routes with various inputs
- **Frontend-Backend Communication**: Validates proper API integration
- **Database Operations**: Tests read/write operations through the API
- **Container Networking**: Ensures inter-container communication works
- **Performance Metrics**: Measures response times and throughput
- **Load Testing**: Simulates high concurrent request scenarios
- **Error Handling**: Validates proper error responses

## Quick Start

### 1. Ensure Services Are Running

```bash
cd /Users/hk/Desktop/Khalifa\ Mgmt.
./start-dev.sh
```

Wait for all services to be healthy (should complete in ~30-60 seconds).

### 2. Run Integration Tests

```bash
cd tests
chmod +x test-runner.sh
./test-runner.sh
```

Or run directly:

```bash
node comprehensive-integration-tests.js
```

### 3. Run Performance Tests

```bash
node performance-load-test.js
```

## Test Suite Details

### comprehensive-integration-tests.js

**What it tests:**
- ✅ All service availability (Khalifa, Intake Frontend, Intake Backend, MongoDB)
- ✅ API health endpoints
- ✅ CRUD operations on intake forms
- ✅ CORS headers and preflight requests
- ✅ Frontend page loads
- ✅ Database connectivity (read/write)
- ✅ Response time performance
- ✅ Concurrent request handling
- ✅ Error handling and edge cases

**Key Test Categories:**

| Category | Tests | Purpose |
|----------|-------|---------|
| Service Health | 5 tests | Verify all containers running |
| API Endpoints | 4 tests | Test intake form CRUD operations |
| FE-BE Communication | 3 tests | Validate API connectivity & CORS |
| Database | 2 tests | Test read/write through API |
| Networking | 2 tests | Check container network connectivity |
| Performance | 4 tests | Measure response times |
| Error Handling | 2 tests | Validate error responses |

**Expected Output:**
```
✅ Health Check: Khalifa Management (25ms)
✅ Health Check: Intake Form Frontend (30ms)
✅ Health Check: Intake Backend API (15ms)
✅ Intake API: GET /api/health (12ms)
✅ Intake API: GET /api/intake (45ms)
✅ Intake API: POST /api/intake (Create) (120ms)
... (more tests)

📊 TEST REPORT
═══════════════════════════════════════════════════════
Total Tests: 25
✅ Passed: 25
❌ Failed: 0
⏱️  Total Time: 2500ms
```

### performance-load-test.js

**What it tests:**
- Load capacity at various concurrency levels (1, 5, 10, 25, 50 concurrent requests)
- Response time percentiles (P50, P95, P99)
- Throughput (requests per second)
- Success rate under load
- System stability

**Test Parameters:**
- **Duration**: 10 seconds per concurrency level
- **Endpoints**: Health check, Get forms, Get forms with pagination
- **Load Levels**: 1, 5, 10, 25, 50 concurrent connections

**What Results Mean:**

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Avg Response | <100ms | 100-500ms | >500ms |
| P99 Response | <200ms | 200-1000ms | >1000ms |
| Success Rate | 100% | 99.9% | <99.9% |
| RPS | >100/sec | 50-100/sec | <50/sec |

## Architecture Being Tested

```
┌─────────────────────────────────────────────────────┐
│                  Test Runner                        │
│  (Node.js with HTTP client)                         │
└─────────────────────────────────────────────────────┘
                        ↓
     ┌──────────────────┼──────────────────┐
     ↓                  ↓                   ↓
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  Khalifa    │  │ Intake Form  │  │   Intake    │
│ Management  │  │  Frontend    │  │   Backend   │
│  (3000)     │  │   (3006)     │  │   (5001)    │
└─────────────┘  └──────────────┘  └─────────────┘
     ↓                   ↓                ↓
┌─────────────┐                   ┌──────────────┐
│  MongoDB    │                   │   MongoDB    │
│  (27017)    │                   │   (27018)    │
└─────────────┘                   └──────────────┘
```

## Key API Endpoints Tested

### Intake Backend API (Port 5001)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/intake` | GET | Get all intake forms with pagination |
| `/api/intake` | POST | Create new intake form |
| `/api/intake/:id` | GET | Get specific form |
| `/api/intake/:id` | PUT | Update form |
| `/api/intake/:id` | DELETE | Delete form |

### Frontend Testing (Port 3006)

- Verifies React app loads
- Tests API connectivity via `REACT_APP_API_URL`
- Validates CORS headers for cross-origin requests

## Troubleshooting

### Tests Fail with "Connection Refused"

**Problem**: Services not running
```bash
# Solution: Start services
./start-dev.sh
# Wait for healthy status message
```

### Tests Timeout

**Problem**: Services too slow to respond
```bash
# Check container logs
docker-compose logs -f khalifa-mgmt-app
docker-compose logs -f intake-form-app-backend

# Restart services
docker-compose restart
```

### CORS Tests Fail

**Problem**: Frontend can't reach backend
```bash
# Check environment variables in container
docker exec intake-form-app-backend env | grep CORS
docker exec intake-form-app-frontend env | grep REACT_APP_API_URL

# Should see:
# CORS_ORIGIN=http://localhost:3006
# REACT_APP_API_URL=http://localhost:5001
```

### Database Tests Fail

**Problem**: MongoDB not connected
```bash
# Check MongoDB status
docker exec intake-form-app-mongo mongosh --eval 'db.adminCommand("ping")'

# Check backend connection logs
docker logs intake-form-app-backend | grep MongoDB
```

## Performance Tuning Tips

1. **Response Time Optimization**
   - Ensure database indices are created
   - Consider caching frequently accessed data
   - Use pagination for large datasets

2. **Concurrency Handling**
   - Monitor CPU/memory usage during load tests
   - Increase container resource limits if needed
   - Consider connection pooling for database

3. **Network Efficiency**
   - Monitor network traffic between containers
   - Use compression for large responses
   - Optimize API response payload size

## Continuous Testing

To integrate with CI/CD:

```bash
#!/bin/bash
# .github/workflows/test.yml compatible

# Run integration tests
node tests/comprehensive-integration-tests.js || exit 1

# Run performance tests
node tests/performance-load-test.js || exit 1

echo "✅ All tests passed!"
```

## Adding New Tests

### Template for Integration Test

```javascript
await runner.runTest('Test Name: Description', async () => {
  const response = await runner.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/endpoint',
    method: 'GET'
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }
  
  const data = JSON.parse(response.body);
  if (!data.expectedField) {
    throw new Error('Missing expected field in response');
  }
});
```

### Template for Load Test

```javascript
const testEndpoint = {
  name: 'New Endpoint',
  method: 'POST',
  path: '/api/new-endpoint',
  body: true // if POST with body
};

// Add to CONFIG.endpoints
// Then it will be tested automatically
```

## Metrics Explained

### Response Time Percentiles
- **P50 (Median)**: 50% of requests faster, 50% slower
- **P95**: 95% of requests faster (95th percentile)
- **P99**: 99% of requests faster (99th percentile, worst cases)

### Throughput (RPS)
- **Requests Per Second**: How many requests the API can handle
- Formula: `Total Requests / Duration in Seconds`
- Higher is better

### Success Rate
- **Percentage of requests that completed successfully**
- Should be 100% for stable systems
- <99.9% may indicate reliability issues

## Contact & Support

For test failures or questions:
1. Check the detailed error message
2. Review container logs
3. Verify environment variables
4. Check network connectivity
5. Review [troubleshooting.md](../troubleshooting.md)
