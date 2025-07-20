"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { InfoHistoryForm } from "./info-history-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Video, PlusCircle } from "lucide-react"
import { toast } from "sonner"

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

// This component will represent the main dashboard view after the form is completed.
function ClientDashboard() {
  const [hasWindow, setHasWindow] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  const handleRequestService = async (serviceType: 'postpartum' | 'birth' | 'sitter' | 'both') => {
    setIsRequesting(true);
    try {
      const response = await fetch('/api/service-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceType }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit request.');
      }

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsRequesting(false);
    }
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Portal!</CardTitle>
          <CardDescription>Here's a quick video to get you started.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
                    <div className="bg-gray-200 aspect-video w-full max-w-xl mx-auto flex items-center justify-center rounded-lg overflow-hidden">
            {hasWindow && <ReactPlayer 
              url='https://www.youtube.com/watch?v=LXb3EKWsInQ' // Placeholder URL
              width='100%'
              height='100%'
              controls={true}
            />}
            {!hasWindow && <Video className="w-16 h-16 text-gray-500" />} 
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Services</CardTitle>
          <CardDescription>Choose from your available benefits.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="p-6 flex flex-col h-auto" onClick={() => handleRequestService('postpartum')} disabled={isRequesting}>
            <PlusCircle className="w-8 h-8 mb-2" />
            <span className="text-lg">Postpartum Doula Support</span>
          </Button>
          <Button variant="outline" className="p-6 flex flex-col h-auto" onClick={() => handleRequestService('birth')} disabled={isRequesting}>
            <PlusCircle className="w-8 h-8 mb-2" />
            <span className="text-lg">Birth Doula Support</span>
          </Button>
          <Button variant="outline" className="p-6 flex flex-col h-auto" onClick={() => handleRequestService('sitter')} disabled={isRequesting}>
            <PlusCircle className="w-8 h-8 mb-2" />
            <span className="text-lg">Backup Childcare / Sitter</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function EmployeePortal() {
  const [isInfoSubmitted, setIsInfoSubmitted] = useState(false)

  const handleFormSuccess = () => {
    setIsInfoSubmitted(true);
  };

  return (
    <div>
      {isInfoSubmitted ? (
        <ClientDashboard />
      ) : (
        <InfoHistoryForm onSuccess={handleFormSuccess} />
      )}
    </div>
  )
}
