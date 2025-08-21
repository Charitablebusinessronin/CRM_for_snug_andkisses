"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LogOut, Loader2 } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showConfirmDialog?: boolean
  redirectTo?: string
}

export function LogoutButton({ 
  variant = "ghost", 
  size = "default",
  className = "",
  showConfirmDialog = true,
  redirectTo = "/auth/signin"
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    if (!session) return

    setIsLoading(true)
    
    try {
      // Sign out with NextAuth
      await signOut({
        redirect: false,
        callbackUrl: redirectTo
      })
      
      // Clear any additional local storage or session data
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirect to sign in page
      router.push(redirectTo)
      
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if there's an error
      router.push(redirectTo)
    } finally {
      setIsLoading(false)
    }
  }

  const LogoutButtonComponent = (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isLoading || !session}
      onClick={showConfirmDialog ? undefined : handleLogout}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </>
      )}
    </Button>
  )

  if (!showConfirmDialog) {
    return LogoutButtonComponent
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {LogoutButtonComponent}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? You will need to sign in again to access your account.
            {session?.user?.email && (
              <div className="mt-2 text-sm text-gray-600">
                Currently signed in as: <strong>{session.user.email}</strong>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Session timeout warning component
export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const { data: session } = useSession()

  // This would be implemented with a useEffect that checks session expiry
  // For now, it's a placeholder for the session timeout functionality

  if (!showWarning || !session) return null

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {timeRemaining} seconds due to HIPAA security requirements.
            Click "Stay Signed In" to extend your session, or you will be automatically signed out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
            Sign Out Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => setShowWarning(false)}>
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}