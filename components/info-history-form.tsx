"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  dueDate: z.string().min(1, { message: "Due date or birthdate is required." }),
  childrenInfo: z.string().min(1, { message: "Please enter number and ages of children." }),
  employerName: z.string().min(1, { message: "Please select your employer." }),
  careAddress: z.string().min(5, { message: "Address must be at least 5 characters." }),
  emergencyContact: z.string().min(2, { message: "Emergency contact is required." }),
  supportType: z.string().min(1, { message: "Please select a support type." }),
  healthConsiderations: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and policies.",
  }),
})

interface InfoHistoryFormProps {
  onSuccess: () => void;
}

export function InfoHistoryForm({ onSuccess }: InfoHistoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dueDate: "",
      childrenInfo: "",
      employerName: "",
      careAddress: "",
      emergencyContact: "",
      supportType: "",
      healthConsiderations: "",
      agreeToTerms: false,
    },
  })

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Client Information & History</CardTitle>
        <CardDescription>Please complete this form before requesting services.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
                  <form onSubmit={form.handleSubmit(async (values) => {
            setIsLoading(true);
            setError(null);
            try {
              const response = await fetch('/api/employee-info', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
              });

              if (!response.ok) {
                throw new Error('Failed to submit form. Please try again.');
              }

              // Call the success callback to notify the parent component
              onSuccess();

            } catch (err: any) {
              setError(err.message);
            } finally {
              setIsLoading(false);
            }
          })} className="space-y-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date or Baby's Birthdate</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="childrenInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number & Ages of Children</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1 child, 2 years old" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your employer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employer-a">Employer A</SelectItem>
                      <SelectItem value="employer-b">Employer B</SelectItem>
                      <SelectItem value="employer-c">Employer C</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="careAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Where Care Will Take Place</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Backup Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe - 555-123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Support You're Seeking</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="postpartum">Postpartum Doula Support</SelectItem>
                      <SelectItem value="birth">Birth Doula Support</SelectItem>
                      <SelectItem value="sitter">Backup Childcare / Sitter</SelectItem>
                      <SelectItem value="both">Both Doula Types</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthConsiderations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health or Household Considerations (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., allergies, pets in home, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Agree to Terms and Policies</FormLabel>
                    <FormDescription>
                      By checking this box, you agree to our terms of service.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
