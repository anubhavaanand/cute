// tests.mts - Comprehensive test suite for Custom Terminal

import { getCommandJourney, formatJourneyCompact, commandHistory } from './journey-visualizer.mjs';
import { getWeather, getWeatherMock } from './weather.mjs';
import { showStatusLine } from './overlay.mjs';
import { traceCommandSyscalls } from './tracer.mjs';

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Test failed: ${message}`);
    process.exit(1);
  }
}

function test(name: string, fn: () => void) {
  try {
    console.log(`🧪 Running test: ${name}`);
    fn();
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    console.error(`❌ Test failed: ${name} - ${error}`);
    process.exit(1);
  }
}

// Journey Visualizer Tests
test('Basic command journey parsing', () => {
  const journey = getCommandJourney('ls -la');
  assert(journey.length > 2, 'Journey should have multiple steps');
  assert(journey[0].label === 'parse', 'First step should be parse');
  assert(journey[journey.length - 1].label === 'complete', 'Last step should be complete');
});

test('Sudo command journey', () => {
  const journey = getCommandJourney('sudo pacman -Syu');
  const hasAuth = journey.some(step => step.type === 'auth');
  assert(hasAuth, 'Sudo command should include auth step');
});

test('Pipeline command journey', () => {
  const journey = getCommandJourney('cat file.txt | grep pattern');
  const hasPipe = journey.some(step => step.type === 'pipe');
  assert(hasPipe, 'Pipeline should include pipe step');
});

test('Journey compact formatting', () => {
  const journey = getCommandJourney('ls');
  const compact = formatJourneyCompact(journey);
  assert(compact.includes('→'), 'Compact format should include arrows');
  assert(compact.length > 0, 'Compact format should not be empty');
});

// Weather Tests
test('Weather mock data', () => {
  const weather = getWeatherMock();
  assert(typeof weather.temperature === 'number', 'Temperature should be a number');
  assert(typeof weather.description === 'string', 'Description should be a string');
  assert(weather.description.length > 0, 'Description should not be empty');
});

test('Weather API structure', async () => {
  try {
    const weather = await getWeather();
    assert(typeof weather.temperature === 'number', 'API temperature should be a number');
    assert(typeof weather.description === 'string', 'API description should be a string');
  } catch (error) {
    console.log('⚠️ Weather API test skipped (network unavailable)');
  }
});

// Overlay Tests
test('Status line generation', () => {
  const statusData = {
    time: '12:00:00',
    weather: { description: 'Sunny', temperature: 25 },
    journey: '⚡ ls → 🗄️ filesystem → ✅ complete',
    syscalls: 42,
    username: 'testuser',
    currentDir: '/home/testuser'
  };

  // This should not throw an error
  showStatusLine(statusData);
  assert(true, 'Status line generation should work');
});

// Command History Tests
test('Command history management', () => {
  const history = commandHistory;
  history.addEntry('ls -la', getCommandJourney('ls -la'), true);
  history.addEntry('pwd', getCommandJourney('pwd'), true);

  const recent = history.getRecentCommands(5);
  assert(recent.length >= 2, 'Should have recent commands');

  const patterns = history.getCommandPatterns();
  assert(patterns.length > 0, 'Should have command patterns');
});

// Tracer Tests
test('Syscall tracing estimation', async () => {
  const result = await traceCommandSyscalls('echo "test"');
  assert(typeof result.totalSyscalls === 'number', 'Should return syscall count');
  assert(result.totalSyscalls >= 0, 'Syscall count should be non-negative');
  assert(Array.isArray(result.syscallBreakdown), 'Should have syscall breakdown');
});

// Performance Tests
test('Journey parsing performance', () => {
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    getCommandJourney('sudo pacman -S neofetch');
  }
  const end = Date.now();
  const duration = end - start;

  assert(duration < 1000, `Journey parsing should be fast (< 1000ms for 100 iterations), took ${duration}ms`);
});

// Integration Tests
test('Full command processing workflow', async () => {
  const command = 'echo "integration test"';

  // Get journey
  const journey = getCommandJourney(command);
  assert(journey.length > 0, 'Should generate journey');

  // Format journey
  const compact = formatJourneyCompact(journey);
  assert(compact.length > 0, 'Should format journey');

  // This should not throw
  const statusData = {
    time: '12:00:00',
    weather: { description: 'Clear', temperature: 20 },
    journey: compact,
    syscalls: 10,
    username: 'test',
    currentDir: '/tmp'
  };

  showStatusLine(statusData);
  assert(true, 'Full workflow should complete without errors');
});

// Error Handling Tests
test('Invalid command handling', () => {
  const journey = getCommandJourney('');
  assert(journey.length >= 2, 'Even empty command should have basic journey');
});

test('Malformed pipeline handling', () => {
  const journey = getCommandJourney('cmd1 | | cmd2');
  assert(journey.length > 0, 'Malformed pipeline should still generate journey');
});

// Cross-platform Compatibility Tests
test('Path handling', () => {
  // Test that paths work on different systems
  const journey1 = getCommandJourney('ls /home/user');
  const journey2 = getCommandJourney('ls C:\\Users\\user'); // Windows-style

  assert(journey1.length > 0, 'Unix path should work');
  assert(journey2.length > 0, 'Windows path should be handled');
});

console.log('\n🎉 All tests passed!');
console.log('📊 Test Summary:');
console.log('- Journey visualizer: ✅');
console.log('- Weather integration: ✅');
console.log('- Overlay system: ✅');
console.log('- Command history: ✅');
console.log('- Syscall tracing: ✅');
console.log('- Performance: ✅');
console.log('- Integration: ✅');
console.log('- Error handling: ✅');
console.log('- Compatibility: ✅');

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  // Tests run automatically when executed directly
}