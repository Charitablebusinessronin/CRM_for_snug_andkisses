"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface Doula {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  description: string;
  rating: number;
}

export function DoulaList() {
  const [doulas, setDoulas] = useState<Doula[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoulas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/v1/doulas');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch doulas.');
        }

        setDoulas(result.data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoulas();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (doulas.length === 0) {
    return <p>No doulas available at this time.</p>;
  }

  return (
    <div className="space-y-4">
      {doulas.map((doula) => (
        <Card key={doula.id}>
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
              <AvatarFallback>{doula.firstName.charAt(0)}{doula.lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{doula.firstName} {doula.lastName}</h3>
              <p className="text-sm text-gray-600">{doula.description}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{doula.rating.toFixed(1)}</span>
              </div>
            </div>
            <Button variant="outline">Select</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
