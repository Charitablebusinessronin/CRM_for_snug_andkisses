import { UnifiedDashboard } from "@/components/unified-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Briefcase, Shield, Baby } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

/**
 * The main entry point of the application - Zoho One-like Business Suite
 * @returns {JSX.Element} The unified business dashboard.
 */
export default function Home() {
  redirect('/auth/signin')
}
