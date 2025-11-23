import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://ehcecqguqsenhstbuquy.supabase.co
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoY2VjcWd1cXNlbmhzdGJ1cXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTc3MDEsImV4cCI6MjA3OTQ3MzcwMX0.fIwGkFlruoaUfrJIgJWhUWLLxfZi8UxGSVYCyKF2290

export const supabase = createClient(supabaseUrl, supabaseAnonKey)