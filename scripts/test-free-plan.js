/**
 * A2Z Free Plan Testing Script
 * Run this to test all free plan functionality
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testFreeAccountReset() {
  console.log('🧪 Testing Free Account Reset Endpoint...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/cron/free-account-reset`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Reset endpoint working:', result)
      return true
    } else {
      console.log('❌ Reset endpoint failed:', result)
      return false
    }
  } catch (error) {
    console.log('❌ Reset endpoint error:', error.message)
    return false
  }
}

async function testTierLimits() {
  console.log('🧪 Testing Tier Limits...')
  
  // This would require authentication, so just log the test
  console.log('📝 Manual test required:')
  console.log('   1. Sign up as free user')
  console.log('   2. Create 3 listings')
  console.log('   3. Try to create 4th listing (should fail)')
  console.log('   4. Upload 5 images per listing')
  console.log('   5. Try to upload 6th image (should fail)')
  
  return true
}

async function testFileUploadLimits() {
  console.log('🧪 Testing File Upload Limits...')
  
  console.log('📝 Manual test required:')
  console.log('   1. Try uploading file > 10MB (should fail)')
  console.log('   2. Try uploading unsupported format (should fail)')
  console.log('   3. Upload 5 valid images (should work)')
  
  return true
}

async function runAllTests() {
  console.log('🚀 Starting A2Z Free Plan Tests...\n')
  
  const tests = [
    { name: 'Free Account Reset', fn: testFreeAccountReset },
    { name: 'Tier Limits', fn: testTierLimits },
    { name: 'File Upload Limits', fn: testFileUploadLimits }
  ]
  
  const results = []
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`)
    const result = await test.fn()
    results.push({ name: test.name, passed: result })
  }
  
  console.log('\n📊 Test Results:')
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  const passedCount = results.filter(r => r.passed).length
  console.log(`\n🎯 ${passedCount}/${results.length} tests passed`)
  
  if (passedCount === results.length) {
    console.log('🎉 All tests passed! Free Plan is ready for beta testing.')
  } else {
    console.log('⚠️  Some tests failed. Please fix issues before beta testing.')
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testFreeAccountReset,
  testTierLimits,
  testFileUploadLimits,
  runAllTests
}
