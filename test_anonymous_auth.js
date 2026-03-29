// 测试匿名登录是否已启用
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hfwqkeycrxbmeinyrkdh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhmd3FrZXljcnhibWVpbnlya2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzY2MTUsImV4cCI6MjA5MDE1MjYxNX0.G3ohFCS7gYVHjGxe-v4UkIXlFEsOcd5HTL0_dKRSNT0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAnonymousAuth() {
  try {
    console.log('Testing anonymous sign-in...')
    const { data, error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error('Anonymous sign-in error:', error.message)
      if (error.message.includes('Anonymous sign-ins are disabled')) {
        console.log('❌ Anonymous sign-ins are currently DISABLED')
        return false
      }
    } else {
      console.log('✅ Anonymous sign-in successful!')
      console.log('User ID:', data.user?.id)
      console.log('Is anonymous:', data.user?.is_anonymous)
      return true
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    return false
  }
}

testAnonymousAuth().then(success => {
  if (!success) {
    console.log('\n🔧 To enable anonymous sign-ins:')
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project: hfwqkeycrxbmeinyrkdh')
    console.log('3. Navigate to: Authentication → Settings')
    console.log('4. Find "Allow anonymous sign-ins" and toggle it ON')
    console.log('5. Save changes')
  }
})