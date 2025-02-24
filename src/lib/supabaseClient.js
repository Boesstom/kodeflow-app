import { createClient } from '@supabase/supabase-js'

const isBrowser = typeof window !== 'undefined'

export const supabase = createClient(
  'https://yhftuflnwkwomwruffoj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZnR1Zmxud2t3b213cnVmZm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNjk1ODIsImV4cCI6MjA0Nzk0NTU4Mn0.pR-s0KXDHqMeJHsM8jNCtMMAhxqRiZ__qf5Lbb12rZ4',
  {
    auth: {
      storage: isBrowser ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)