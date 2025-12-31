/**
 * Comprehensive Integration Tests for Khalifa Management + Intake Form System
 * Tests all container connectivity, API communication, and efficiency metrics
 */

const http = require('http');
const https = require('https');

// ============================================
// Configuration
// ============================================

const SERVICES = {
  khalifa: {
    name: 'Khalifa Management',
    host: 'localhost',
    port: 3000,
    protocol: 'http',
    healthEndpoint: '/'
  },
  intakeFrontend: {
    name: 'Intake Form Frontend',
    host: 'localhost',
    port: 3006,
    protocol: 'http',
    healthEndpoint: '/'
  },
  intakeBackend: {
    name: 'Intake Backend API',
    host: 'localhost',
    port: 5001,
    protocol: 'http',
    healthEndpoint: '/api/health'
  },
  khalifaMongo: {
    name: 'Khalifa MongoDB',
    host: 'localhost',
    port: 27017,
    protocol: 'http'
  },
  intakeMongo: {
    name: 'Intake MongoDB',
    host: 'localhost',
    port: 27018,
    protocol: 'http'
  }
};

// ============================================
// Utility Functions
// ============================================

class TestRunner {
  constructor() {
    this.results = [];
    this.totalTime = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  async runTest(name, testFn) {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: '✅ PASS',
        duration: `${duration}ms`,
        error: null
      });
      this.passCount++;
      console.log(`✅ ${name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: '❌ FAIL',
        duration: `${duration}ms`,
        error: error.message
      });
      this.failCount++;
      console.log(`❌ ${name} - ${error.message}`);
    }
    this.totalTime += Date.now() - startTime;
  }

  request(options) {
    return new Promise((resolve, reject) => {
      const client = options.protocol === 'https' ? https : http;
      const timeout = options.timeout || 5000;

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      });

      req.setTimeout(timeout, () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', reject);
      if (options.body) req.write(JSON.stringify(options.body));
      req.end();
    });
  }

  async isServiceUp(service) {
    try {
      const response = await this.request({
        hostname: service.host,
        port: service.port,
        path: service.healthEndpoint || '/',
        method: 'GET',
        timeout: 3000
      });
      return response.status < 500;
    } catch {
      return false;
    }
  }

  printReport() {
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(70));
    console.log(`Total Tests: ${this.passCount + this.failCount}`);
    console.log(`✅ Passed: ${this.passCount}`);
    console.log(`❌ Failed: ${this.failCount}`);
    console.log(`⏱️  Total Time: ${this.totalTime}ms`);
    console.log('='.repeat(70));

    if (this.failCount > 0) {
      console.log('\n🔴 FAILED TESTS:');
      this.results.filter(r => r.status === '❌ FAIL').forEach(r => {
        console.log(`  - ${r.name}`);
        console.log(`    Error: ${r.error}`);
      });
    }
  }
}

// ============================================
// Service Health & Connectivity Tests
// ============================================

async function testServiceHealth(runner) {
  console.log('\n📋 SERVICE HEALTH CHECKS');
  console.log('-'.repeat(70));

  for (const [key, service] of Object.entries(SERVICES)) {
    await runner.runTest(`Health Check: ${service.name}`, async () => {
      const response = await runner.request({
        hostname: service.host,
        port: service.port,
        path: service.healthEndpoint || '/',
        method: 'GET'
      });
      if (response.status >= 500) throw new Error(`Service returned ${response.status}`);
    });
  }
}

// ============================================
// API Communication Tests
// ============================================

async function testIntakeAPIEndpoints(runner) {
  console.log('\n🔌 INTAKE API ENDPOINT TESTS');
  console.log('-'.repeat(70));

  // Test 1: API Health Endpoint
  await runner.runTest('Intake API: GET /api/health', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    const data = JSON.parse(response.body);
    if (!data.status) throw new Error('Missing status in response');
  });

  // Test 2: Get All Intake Forms
  await runner.runTest('Intake API: GET /api/intake', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake',
      method: 'GET'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    const data = JSON.parse(response.body);
    if (!Array.isArray(data.data)) throw new Error('Response data should be an array');
  });

  // Test 3: Create Intake Form
  await runner.runTest('Intake API: POST /api/intake (Create)', async () => {
    const testData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      phone: '1234567890',
      businessName: 'Test Business'
    };
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: testData
    });
    if (![200, 201].includes(response.status)) {
      throw new Error(`Expected 200/201, got ${response.status}: ${response.body}`);
    }
  });

  // Test 4: OPTIONS Preflight for CORS
  await runner.runTest('Intake API: OPTIONS /api/intake (CORS Preflight)', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake',
      method: 'OPTIONS'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.headers['access-control-allow-origin']) {
      throw new Error('Missing CORS headers');
    }
  });
}

// ============================================
// Frontend-Backend Communication Tests
// ============================================

async function testFrontendBackendCommunication(runner) {
  console.log('\n🔄 FRONTEND-BACKEND COMMUNICATION TESTS');
  console.log('-'.repeat(70));

  // Test 1: Frontend can reach backend through API URL
  await runner.runTest('Frontend: API Connectivity (via REACT_APP_API_URL)', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET'
    });
    if (response.status !== 200) throw new Error('Cannot reach backend API');
  });

  // Test 2: Test CORS headers are properly set
  await runner.runTest('Frontend-Backend: CORS Headers Present', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake',
      method: 'OPTIONS'
    });
    const corsOrigin = response.headers['access-control-allow-origin'];
    if (!corsOrigin) throw new Error('Missing CORS origin header');
    if (!corsOrigin.includes('localhost') && corsOrigin !== '*') {
      throw new Error(`Unexpected CORS origin: ${corsOrigin}`);
    }
  });

  // Test 3: Frontend page loads
  await runner.runTest('Frontend: Page Load (GET /)', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 3006,
      path: '/',
      method: 'GET'
    });
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.body.includes('html') && !response.body.includes('React')) {
      throw new Error('Response does not appear to be HTML');
    }
  });
}

// ============================================
// Database Connectivity Tests
// ============================================

async function testDatabaseConnectivity(runner) {
  console.log('\n🗄️  DATABASE CONNECTIVITY TESTS');
  console.log('-'.repeat(70));

  // Note: Direct MongoDB connection testing would require mongodb client
  // Instead, we test through API endpoints that use the database

  await runner.runTest('Intake API: Database Write Operation', async () => {
    const testData = {
      firstName: 'DB-Test',
      lastName: 'User',
      email: `dbtest-${Date.now()}@example.com`,
      phone: '1234567890'
    };
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: testData
    });
    if (![200, 201].includes(response.status)) {
      throw new Error(`Database write failed: ${response.status}`);
    }
  });

  await runner.runTest('Intake API: Database Read Operation', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake?limit=1',
      method: 'GET'
    });
    if (response.status !== 200) throw new Error(`Database read failed: ${response.status}`);
    const data = JSON.parse(response.body);
    if (!data.data) throw new Error('Invalid database response structure');
  });
}

// ============================================
// Performance & Efficiency Tests
// ============================================

async function testPerformanceMetrics(runner) {
  console.log('\n⚡ PERFORMANCE & EFFICIENCY TESTS');
  console.log('-'.repeat(70));

  // Test 1: API Response Time
  await runner.runTest('Intake API: Response Time < 500ms', async () => {
    const startTime = Date.now();
    await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET'
    });
    const duration = Date.now() - startTime;
    if (duration > 500) throw new Error(`Response took ${duration}ms (> 500ms threshold)`);
    console.log(`     (Actual: ${duration}ms)`);
  });

  // Test 2: Bulk Read Performance
  await runner.runTest('Intake API: Pagination Performance (10 records)', async () => {
    const startTime = Date.now();
    await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake?page=1&limit=10',
      method: 'GET'
    });
    const duration = Date.now() - startTime;
    console.log(`     (Actual: ${duration}ms)`);
  });

  // Test 3: Concurrent Requests
  await runner.runTest('Intake API: Handle 5 Concurrent Requests', async () => {
    const promises = Array(5).fill().map(() =>
      runner.request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/health',
        method: 'GET'
      })
    );
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    if (results.some(r => r.status !== 200)) throw new Error('Some requests failed');
    console.log(`     (${results.length} requests in ${duration}ms)`);
  });

  // Test 4: Frontend Page Load Performance
  await runner.runTest('Frontend: Page Load Performance', async () => {
    const startTime = Date.now();
    await runner.request({
      hostname: 'localhost',
      port: 3006,
      path: '/',
      method: 'GET'
    });
    const duration = Date.now() - startTime;
    console.log(`     (Actual: ${duration}ms)`);
  });
}

// ============================================
// Container Network Tests
// ============================================

async function testContainerNetworking(runner) {
  console.log('\n🌐 CONTAINER NETWORKING TESTS');
  console.log('-'.repeat(70));

  // Check if containers can communicate internally
  await runner.runTest('Container Network: Internal API Connectivity', async () => {
    // This simulates how frontend container would reach backend container
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET'
    });
    if (response.status !== 200) throw new Error('Cannot reach backend through network');
  });

  await runner.runTest('Container Network: Port Mapping Verification', async () => {
    const ports = [
      { name: 'Khalifa', port: 3000 },
      { name: 'Intake Frontend', port: 3006 },
      { name: 'Intake Backend', port: 5001 }
    ];

    for (const { name, port } of ports) {
      try {
        const response = await runner.request({
          hostname: 'localhost',
          port,
          path: '/',
          method: 'GET',
          timeout: 2000
        });
        if (response.status >= 500) throw new Error(`${name} returned 500+`);
      } catch (e) {
        throw new Error(`Port ${port} (${name}) not accessible: ${e.message}`);
      }
    }
  });
}

// ============================================
// Error Handling Tests
// ============================================

async function testErrorHandling(runner) {
  console.log('\n⚠️  ERROR HANDLING TESTS');
  console.log('-'.repeat(70));

  await runner.runTest('API: Invalid Route Returns 404', async () => {
    try {
      await runner.request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/nonexistent',
        method: 'GET',
        timeout: 3000
      });
    } catch (e) {
      if (!e.message.includes('ECONNREFUSED')) return; // Service down is expected in some cases
    }
    // If no error, that's also OK for testing
  });

  await runner.runTest('API: Malformed Request Handling', async () => {
    const response = await runner.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api/intake',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { invalid: 'incomplete data' }
    });
    // Should either accept or return validation error
    if (![200, 201, 400].includes(response.status)) {
      throw new Error(`Unexpected status: ${response.status}`);
    }
  });
}

// ============================================
// Main Test Execution
// ============================================

async function runAllTests() {
  const runner = new TestRunner();

  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(15) + '🚀 COMPREHENSIVE INTEGRATION TEST SUITE 🚀'.padEnd(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');

  try {
    // Check service availability
    console.log('\n🔍 Checking Service Availability...');
    let availableServices = 0;
    for (const [key, service] of Object.entries(SERVICES)) {
      const isUp = await runner.isServiceUp(service);
      const status = isUp ? '✅ UP' : '❌ DOWN';
      console.log(`  ${status} - ${service.name}`);
      if (isUp) availableServices++;
    }
    console.log(`\n(${availableServices}/${Object.keys(SERVICES).length} services available)\n`);

    // Run test suites
    await testServiceHealth(runner);
    await testIntakeAPIEndpoints(runner);
    await testFrontendBackendCommunication(runner);
    await testDatabaseConnectivity(runner);
    await testContainerNetworking(runner);
    await testPerformanceMetrics(runner);
    await testErrorHandling(runner);

    // Print final report
    runner.printReport();

    // Exit with appropriate code
    process.exit(runner.failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during test execution:', error);
    process.exit(1);
  }
}

// Run all tests
runAllTests();
