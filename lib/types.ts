export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "contractor" | "client" | "employee"
  phone?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  children?: Child[]
  preferences: {
    serviceType: string[]
    specialInstructions: string
  }
  status: "active" | "inactive" | "pending"
  createdAt: Date
  updatedAt: Date
}

export interface Child {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  allergies?: string[]
  medicalConditions?: string[]
  specialNeeds?: string
}

export interface Appointment {
  id: string
  customerId: string
  contractorId: string
  serviceType: "babysitting" | "doula" | "overnight" | "consultation"
  startDateTime: Date
  endDateTime: Date
  location: {
    type: "client_home" | "hospital" | "other"
    address?: string
  }
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled"
  notes?: string
  rate: number
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface Contractor {
  id: string
  userId: string
  specialties: string[]
  certifications: string[]
  experience: number
  hourlyRate: number
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
  }[]
  rating: number
  reviewCount: number
  status: "active" | "inactive" | "pending_approval"
  backgroundCheckStatus: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  customerId: string
  appointmentId: string
  invoiceNumber: string
  amount: number
  tax: number
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: Date
  paidDate?: Date
  paymentMethod?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
