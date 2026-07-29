import { createClient } from '@supabase/supabase-js'

// تأكد من وجود المتغيرات
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// لو مش موجودين، استخدم القيم الثابتة (مؤقتاً)
const url = supabaseUrl || 'https://vxjjlfuxsnjvttpspdar.supabase.co'
const anonKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ampsZnV4c25qdnR0cHNwZGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMDg5MjIsImV4cCI6MjEwMDY4NDkyMn0.S05umCl-SGTqFayLS6Mc-5g5W8PTUbL0CSvI4FwO6vg'

// Client side (for components)
export const supabase = createClient(url, anonKey)

// Server side (for API routes)
export const supabaseServer = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ampsZnV4c25qdnR0cHNwZGFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEwODkyMiwiZXhwIjoyMTAwNjg0OTIyfQ.bl1VOmoU8GvyyAYObxyw7tGyn4iPWMGm6aofZA6lvMI'
)

// For middleware (session checking)
export const supabaseMiddleware = createClient(url, anonKey, {
  auth: {
    persistSession: false,
  },
}) 
