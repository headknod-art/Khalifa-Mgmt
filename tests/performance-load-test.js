/**
 * Performance & Load Testing for Khalifa Management System
 * Tests throughput, response times, and system stability under load
 */

const http = require('http');

// ============================================
// Configuration
// ============================================

const CONFIG = {
  baseUrl: 'http://localhost:5001',
  endpoints: [
    { name: 'Health Check', method: 'GET', path: '/api/health' },
    { name: 'Get All Forms', method: 'GET', path: '/api/intake' },
    { name: 'Get Forms Page 1', method: 'GET', path: '/api/intake?page=1&limit=10' },
    { name: 'Create Form', method: 'POST', path: '/api/intake', body: true }
  ],
  loadLevels: [1, 5, 10, 25, 50],
  duration: 10000, // 10 seconds per load level
  timeout: 5000
};

// ============================================
// Performance Monitor
// ============================================

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      responseTimes: []
    };
  }

  recordRequest(duration, success = true) {
    this.metrics.requests++;
    this.metrics.totalTime += duration;
    this.metrics.responseTimes.push(duration);

    if (success) {
      this.metrics.successes++;
    } else {
      this.metrics.failures++;
    }

    this.metrics.minTime = Math.min(this.metrics.minTime, duration);
    this.metrics.maxTime = Math.max(this.metrics.maxTime, duration);
  }

  getStats() {
    const sorted = this.metrics.responseTimes.sort((a, b) => a - b);
    const avg = this.metrics.totalTime / this.metrics.requests;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      requests: this.metrics.requests,
      successes: this.metrics.successes,
      failures: this.metrics.failures,
      successRate: ((this.metrics.successes / this.metrics.requests) * 100).toFixed(2),
      avgTime: avg.toFixed(2),
      minTime: this.metrics.minTime.toFixed(2),
      maxTime: this.metrics.maxTime.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2),
      rps: (this.metrics.requests / (CONFIG.duration / 1000)).toFixed(2)
    };
  }

  printReport(concurrent, endpoint) {
    const stats = this.getStats();
    console.log(`\n  📊 Results for "${endpoint}" (${concurrent} concurrent):`);
    console.log(`     ✅ Successes: ${stats.successes}/${stats.requests} (${stats.successRate}%)`);
    console.log(`     ⏱️  Avg Response: ${stats.avgTime}ms`);
    console.log(`     📈 Min/Max: ${stats.minTime}ms / ${stats.maxTime}ms`);
    console.log(`     📊 Percentiles - P50: ${stats.p50}ms | P95: ${stats.p95}ms | P99: ${stats.p99}ms`);
    console.log(`     🚀 Throughput: ${stats.rps} requests/sec`);
    return stats;
  }
}

// ============================================
// HTTP Request Helper
// ============================================

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.path, CONFIG.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: endpoint.method,
      timeout: CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          success: res.statusCode < 400,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    // Send body if POST
    if (endpoint.body && endpoint.method === 'POST') {
      const body = {
        firstName: `Load-${Date.now()}`,
        lastName: 'Test',
        email: `load-${Date.now()}@test.com`,
        phone: '1234567890'
      };
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// ============================================
// Load Testing
// ============================================

async function runLoadTest(endpoint, concurrentRequests) {
  const monitor = new PerformanceMonitor();
  const startTime = Date.now();
  let activeRequests = 0;

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      // Maintain target concurrency
      while (activeRequests < concurrentRequests && Date.now() - startTime < CONFIG.duration) {
        activeRequests++;
        makeRequest(endpoint)
          .then(response => {
            const duration = Date.now() - startTime;
            monitor.recordRequest(duration, response.success);
          })
          .catch(() => {
            monitor.recordRequest(0, false);
          })
          .finally(() => {
            activeRequests--;
          });
      }

      // Check if duration exceeded
      if (Date.now() - startTime >= CONFIG.duration && activeRequests === 0) {
        clearInterval(interval);
        resolve(monitor);
      }
    }, 50); // Spawn new requests every 50ms
  });
}

// ============================================
// Main Execution
// ============================================

async function runAllLoadTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(20) + '⚡ LOAD & PERFORMANCE TESTS ⚡'.padEnd(68) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');

  // Select endpoints to test
  const testEndpoints = CONFIG.endpoints.filter(e => e.name !== 'Create Form'); // Skip write operations for now

  console.log('\n📋 Test Configuration:');
  console.log(`   Duration per level: ${CONFIG.duration / 1000}s`);
  console.log(`   Load levels: ${CONFIG.loadLevels.join(', ')} concurrent`);
  console.log(`   Endpoints: ${testEndpoints.map(e => e.name).join(', ')}`);
  console.log('');

  const allResults = {};

  for (const endpoint of testEndpoints) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`🧪 Testing: ${endpoint.name}`);
    console.log(`${'─'.repeat(70)}`);

    allResults[endpoint.name] = [];

    for (const loadLevel of CONFIG.loadLevels) {
      console.log(`\n  ⏳ Running with ${loadLevel} concurrent requests...`);
      const monitor = await runLoadTest(endpoint, loadLevel);
      const stats = monitor.getStats();
      allResults[endpoint.name].push({ concurrent: loadLevel, stats });
    }
  }

  // Print comprehensive report
  printFinalReport(allResults);
}

function printFinalReport(results) {
  console.log('\n\n');
  console.log('═'.repeat(70));
  console.log('📈 FINAL PERFORMANCE REPORT');
  console.log('═'.repeat(70));

  for (const [endpoint, runs] of Object.entries(results)) {
    console.log(`\n🔹 ${endpoint}`);
    console.log('┌' + '─'.repeat(68) + '┐');
    console.log('│ Concurrency │ Success Rate │ Avg (ms) │ P95 (ms) │ P99 (ms) │ RPS   │');
    console.log('├' + '─'.repeat(68) + '┤');

    for (const { concurrent, stats } of runs) {
      const row = `│ ${String(concurrent).padEnd(11)} │ ${String(stats.successRate + '%').padEnd(12)} │ ${String(stats.avgTime).padEnd(8)} │ ${String(stats.p95).padEnd(8)} │ ${String(stats.p99).padEnd(8)} │ ${String(stats.rps).padEnd(5)} │`;
      console.log(row);
    }
    console.log('└' + '─'.repeat(68) + '┘');
  }

  console.log('\n✅ Load testing completed!');
  console.log('\n💡 Recommendations:');
  console.log('   - Monitor response times as load increases');
  console.log('   - P99 latency indicates worst-case performance');
  console.log('   - Success rate should remain 100% across all load levels');
  console.log('   - RPS indicates throughput capacity of the API');
}

// Run tests
runAllLoadTests().catch(console.error);
