// app/page.tsx (الصفحة الرئيسية - إعادة توجيه)
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/')
} 
