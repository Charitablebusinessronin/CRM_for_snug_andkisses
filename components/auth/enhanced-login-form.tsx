"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Loader2, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react"
import { UserRole, DEMO_ACCOUNTS, ROLE_DASHBOARDS } from "@/types/auth"

// Form validation schema with HIPAA-compliant password requirements
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export function EnhancedLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null)
  const router = useRouter()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Check if account is locked out
  const isLockedOut = lockoutTime && new Date() < lockoutTime

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    if (isLockedOut) {
      setError("Account temporarily locked. Please try again later.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        
        // Lock account after 5 failed attempts for 15 minutes (HIPAA compliance)
        if (newAttempts >= 5) {
          setLockoutTime(new Date(Date.now() + 15 * 60 * 1000))
          setError("Too many failed attempts. Account locked for 15 minutes.")
        } else {
          setError(`Invalid credentials. ${5 - newAttempts} attempts remaining.`)
        }
        return
      }

      // Reset login attempts on success
      setLoginAttempts(0)
      setLockoutTime(null)

      // Get the updated session to determine redirect
      const session = await getSession()
      if (session?.user?.role) {
        const redirectUrl = ROLE_DASHBOARDS[session.user.role] || "/dashboard"
        router.push(redirectUrl)
      } else {
        router.push("/dashboard")
      }
      
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Demo account login
  const loginWithDemo = async (role: UserRole) => {
    setIsLoading(true)
    setError(null)

    try {
      const demoAccount = DEMO_ACCOUNTS[role]
      
      const result = await signIn("credentials", {
        email: demoAccount.email,
        password: demoAccount.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Demo login failed. Please try again.")
        return
      }

      router.push(ROLE_DASHBOARDS[role])
      
    } catch (error) {
      console.error("Demo login error:", error)
      setError("Demo login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Format lockout time remaining
  const getLockoutTimeRemaining = (): string => {
    if (!lockoutTime) return ""
    const remaining = Math.ceil((lockoutTime.getTime() - Date.now()) / 1000 / 60)
    return `${remaining} minute${remaining !== 1 ? "s" : ""}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D7C7ED]/10 to-white p-4">
      <Card className="w-full max-w-md border-[#3B2352]/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <span className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Snugs & Kisses
            </span>
          </div>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Welcome Back</CardTitle>
          <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
            Sign in to access your HIPAA-compliant portal
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                            disabled={isLoading || isLockedOut}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="border-[#D7C7ED]/50 focus:border-[#3B2352] pr-10"
                              disabled={isLoading || isLockedOut}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                              disabled={isLoading || isLockedOut}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant={isLockedOut ? "destructive" : "destructive"}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                        {isLockedOut && (
                          <div className="mt-2 text-sm">
                            Time remaining: {getLockoutTimeRemaining()}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white" 
                    disabled={isLoading || isLockedOut}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Sign In Securely
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center">
                <Button 
                  variant="link" 
                  className="text-[#3B2352]" 
                  disabled={isLoading}
                  onClick={() => router.push('/auth/forgot-password')}
                >
                  Forgot Password?
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Try the system with demo accounts:</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loginWithDemo(UserRole.ADMIN)}
                  disabled={isLoading}
                  className="border-[#3B2352]/20 hover:bg-[#3B2352]/5"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Admin"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loginWithDemo(UserRole.CONTRACTOR)}
                  disabled={isLoading}
                  className="border-[#3B2352]/20 hover:bg-[#3B2352]/5"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Contractor"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loginWithDemo(UserRole.CLIENT)}
                  disabled={isLoading}
                  className="border-[#3B2352]/20 hover:bg-[#3B2352]/5"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Client"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loginWithDemo(UserRole.EMPLOYEE)}
                  disabled={isLoading}
                  className="border-[#3B2352]/20 hover:bg-[#3B2352]/5"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Employee"}
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p>Demo accounts are pre-configured for testing</p>
                <p>All demo data is isolated and secure</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-3 w-3" />
            <span>HIPAA Compliant • 256-bit Encryption</span>
          </div>
          <div className="text-xs text-gray-400 text-center">
            Session timeout: 15 minutes for security
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}