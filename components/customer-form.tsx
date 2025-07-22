"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { customerAPI } from "@/lib/api"
import type { Customer } from "@/lib/types"

const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, "Emergency contact name is required"),
    phone: z.string().min(10, "Emergency contact phone is required"),
    relationship: z.string().min(1, "Relationship is required"),
  }),
  preferences: z.object({
    serviceType: z.array(z.string()),
    specialInstructions: z.string().optional(),
  }),
  status: z.enum(["active", "inactive", "pending"]),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: Customer | null
  onSuccess: () => void
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          emergencyContact: customer.emergencyContact,
          preferences: customer.preferences,
          status: customer.status,
        }
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
          emergencyContact: {
            name: "",
            phone: "",
            relationship: "",
          },
          preferences: {
            serviceType: [],
            specialInstructions: "",
          },
          status: "active",
        },
  })

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => customerAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onSuccess()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CustomerFormData) => customerAPI.update(customer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      onSuccess()
    },
  })

  const onSubmit = (data: CustomerFormData) => {
    if (customer) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" {...form.register("firstName")} />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" {...form.register("lastName")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address</h3>
        <div>
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            {...form.register("address.street")}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("address.city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...form.register("address.state")}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              {...form.register("address.zipCode")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Emergency Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyName">Name</Label>
            <Input
              id="emergencyName"
              {...form.register("emergencyContact.name")}
            />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Phone</Label>
            <Input
              id="emergencyPhone"
              {...form.register("emergencyContact.phone")}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="relationship">Relationship</Label>
          <Input
            id="relationship"
            {...form.register("emergencyContact.relationship")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Preferences</h3>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => form.setValue("status", value as "active" | "inactive" | "pending")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="specialInstructions">Special Instructions</Label>
          <Textarea id="specialInstructions" {...form.register("preferences.specialInstructions")} rows={3} />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          {isLoading ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </form>
  )
}