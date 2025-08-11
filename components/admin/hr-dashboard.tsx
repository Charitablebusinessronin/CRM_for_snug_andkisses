"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus, 
  Edit, 
  Eye, 
  Phone, 
  Mail,
  RefreshCw,
  Download,
  Search,
  Filter,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  FileText,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Shield,
  DollarSign,
  CalendarDays
} from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: 'clinical' | 'administrative' | 'support' | 'management';
  employeeType: 'full_time' | 'part_time' | 'contractor' | 'intern';
  startDate: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  salary?: number;
  hourlyRate?: number;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  certifications: string[];
  performanceRating: number; // 1-5
  lastReview: string;
  nextReview: string;
  ptoBalance: number;
  avatar?: string;
}

interface TimeEntry {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  approvedBy?: string;
  submittedDate: string;
}

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  averagePerformance: number;
  totalPendingLeaves: number;
  averageSalary: number;
  turnoverRate: number;
  employeeSatisfaction: number;
}

export function HRDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: 'clinical' as Employee['department'],
    employeeType: 'full_time' as Employee['employeeType'],
    startDate: new Date().toISOString().split('T')[0],
    salary: 0,
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    employeeId: '',
    type: 'vacation' as LeaveRequest['type'],
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadHRData();
  }, []);

  const loadHRData = async () => {
    setIsLoading(true);
    try {
      // Generate comprehensive mock HR data
      const mockEmployees: Employee[] = [
        {
          id: '1',
          firstName: 'Dr. Sarah',
          lastName: 'Chen',
          email: 'sarah.chen@snugandkisses.com',
          phone: '+1-555-0101',
          position: 'Lead Doula & Medical Director',
          department: 'clinical',
          employeeType: 'full_time',
          startDate: '2023-01-15',
          status: 'active',
          salary: 95000,
          address: '123 Healthcare Ave, Medical District, City',
          emergencyContact: {
            name: 'Michael Chen',
            relationship: 'Spouse',
            phone: '+1-555-0102'
          },
          certifications: ['Certified Doula', 'Medical License', 'CPR Certified', 'Lactation Consultant'],
          performanceRating: 5,
          lastReview: '2024-12-01',
          nextReview: '2025-06-01',
          ptoBalance: 18
        },
        {
          id: '2',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          email: 'emily.rodriguez@snugandkisses.com',
          phone: '+1-555-0201',
          position: 'Senior Support Specialist',
          department: 'support',
          employeeType: 'full_time',
          startDate: '2023-03-20',
          status: 'active',
          salary: 52000,
          address: '456 Wellness St, Community, City',
          emergencyContact: {
            name: 'Carlos Rodriguez',
            relationship: 'Brother',
            phone: '+1-555-0202'
          },
          certifications: ['Customer Service Excellence', 'Healthcare Communication'],
          performanceRating: 4.8,
          lastReview: '2024-11-15',
          nextReview: '2025-05-15',
          ptoBalance: 12
        },
        {
          id: '3',
          firstName: 'Michael',
          lastName: 'Wilson',
          email: 'michael.wilson@snugandkisses.com',
          phone: '+1-555-0301',
          position: 'Lactation Consultant',
          department: 'clinical',
          employeeType: 'part_time',
          startDate: '2023-06-10',
          status: 'active',
          hourlyRate: 45,
          address: '789 Care Circle, Health District, City',
          emergencyContact: {
            name: 'Lisa Wilson',
            relationship: 'Wife',
            phone: '+1-555-0302'
          },
          certifications: ['IBCLC Certified', 'Pediatric Nutrition', 'Breastfeeding Support'],
          performanceRating: 4.9,
          lastReview: '2024-10-20',
          nextReview: '2025-04-20',
          ptoBalance: 8
        },
        {
          id: '4',
          firstName: 'Jessica',
          lastName: 'Taylor',
          email: 'jessica.taylor@snugandkisses.com',
          phone: '+1-555-0401',
          position: 'Administrative Coordinator',
          department: 'administrative',
          employeeType: 'full_time',
          startDate: '2023-09-01',
          status: 'active',
          salary: 42000,
          address: '321 Admin Plaza, Business District, City',
          emergencyContact: {
            name: 'Robert Taylor',
            relationship: 'Father',
            phone: '+1-555-0402'
          },
          certifications: ['Healthcare Administration', 'HIPAA Compliance'],
          performanceRating: 4.6,
          lastReview: '2024-09-01',
          nextReview: '2025-03-01',
          ptoBalance: 15
        },
        {
          id: '5',
          firstName: 'Amanda',
          lastName: 'Foster',
          email: 'amanda.foster@snugandkisses.com',
          phone: '+1-555-0501',
          position: 'Birth Doula',
          department: 'clinical',
          employeeType: 'contractor',
          startDate: '2024-01-15',
          status: 'active',
          hourlyRate: 40,
          address: '654 Birth Support Way, Care Community, City',
          emergencyContact: {
            name: 'David Foster',
            relationship: 'Spouse',
            phone: '+1-555-0502'
          },
          certifications: ['Certified Birth Doula', 'Prenatal Yoga Instructor'],
          performanceRating: 4.7,
          lastReview: '2024-07-15',
          nextReview: '2025-01-15',
          ptoBalance: 5
        }
      ];

      const mockTimeEntries: TimeEntry[] = [
        {
          id: '1',
          employeeId: '1',
          date: '2025-01-03',
          clockIn: '08:00',
          clockOut: '17:00',
          breakMinutes: 60,
          totalHours: 8,
          status: 'present'
        },
        {
          id: '2',
          employeeId: '2',
          date: '2025-01-03',
          clockIn: '09:00',
          clockOut: '18:00',
          breakMinutes: 45,
          totalHours: 8.25,
          status: 'present'
        },
        {
          id: '3',
          employeeId: '3',
          date: '2025-01-03',
          clockIn: '10:00',
          clockOut: '15:00',
          breakMinutes: 30,
          totalHours: 4.5,
          status: 'present'
        }
      ];

      const mockLeaveRequests: LeaveRequest[] = [
        {
          id: '1',
          employeeId: '2',
          type: 'vacation',
          startDate: '2025-01-20',
          endDate: '2025-01-24',
          days: 5,
          reason: 'Family vacation to celebrate anniversary',
          status: 'pending',
          submittedDate: '2025-01-02'
        },
        {
          id: '2',
          employeeId: '4',
          type: 'sick',
          startDate: '2025-01-15',
          endDate: '2025-01-16',
          days: 2,
          reason: 'Medical appointment and recovery',
          status: 'approved',
          approvedBy: 'Dr. Sarah Chen',
          submittedDate: '2025-01-01'
        }
      ];

      setEmployees(mockEmployees);
      setTimeEntries(mockTimeEntries);
      setLeaveRequests(mockLeaveRequests);
    } catch (error) {
      toast.error("Failed to load HR data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast.error("Please fill in required fields");
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      status: 'active',
      certifications: [],
      performanceRating: 0,
      lastReview: '',
      nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months from now
      ptoBalance: newEmployee.employeeType === 'full_time' ? 15 : 10
    };

    setEmployees(prev => [employee, ...prev]);
    setIsAddEmployeeOpen(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: 'clinical',
      employeeType: 'full_time',
      startDate: new Date().toISOString().split('T')[0],
      salary: 0,
      address: '',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    toast.success("Employee added successfully!");
  };

  const handleLeaveRequest = async () => {
    if (!newLeaveRequest.employeeId || !newLeaveRequest.startDate || !newLeaveRequest.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(newLeaveRequest.startDate);
    const endDate = new Date(newLeaveRequest.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest: LeaveRequest = {
      id: Date.now().toString(),
      ...newLeaveRequest,
      days,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0]
    };

    setLeaveRequests(prev => [leaveRequest, ...prev]);
    setIsLeaveRequestOpen(false);
    setNewLeaveRequest({
      employeeId: '',
      type: 'vacation',
      startDate: '',
      endDate: '',
      reason: ''
    });
    toast.success("Leave request submitted successfully!");
  };

  const updateLeaveStatus = (requestId: string, newStatus: LeaveRequest['status'], approver?: string) => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: newStatus,
          approvedBy: newStatus === 'approved' ? approver || 'HR Manager' : undefined
        };
      }
      return request;
    }));
    
    toast.success(`Leave request ${newStatus.toUpperCase()}`);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const hrMetrics: HRMetrics = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    newHiresThisMonth: employees.filter(emp => 
      new Date(emp.startDate).getMonth() === new Date().getMonth() &&
      new Date(emp.startDate).getFullYear() === new Date().getFullYear()
    ).length,
    averagePerformance: employees.length > 0 ? 
      employees.reduce((sum, emp) => sum + emp.performanceRating, 0) / employees.length : 0,
    totalPendingLeaves: leaveRequests.filter(req => req.status === 'pending').length,
    averageSalary: employees.filter(emp => emp.salary).length > 0 ?
      employees.filter(emp => emp.salary).reduce((sum, emp) => sum + (emp.salary || 0), 0) /
      employees.filter(emp => emp.salary).length : 0,
    turnoverRate: 5.2, // Mock percentage
    employeeSatisfaction: 4.6 // Mock rating out of 5
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    on_leave: 'bg-yellow-500',
    terminated: 'bg-red-500'
  };

  const departmentColors = {
    clinical: 'bg-blue-500',
    administrative: 'bg-purple-500',
    support: 'bg-orange-500',
    management: 'bg-green-500'
  };

  const leaveStatusColors = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    denied: 'bg-red-500'
  };

  return (
    <div className="space-y-6">
      {/* HR Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Human Resources Management
          </h2>
          <p className="text-gray-600">Manage your healthcare team and organizational operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadHRData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => toast.success("Export feature coming soon!")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* HR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-[#3B2352]">{hrMetrics.totalEmployees}</p>
                <p className="text-sm text-green-600">{hrMetrics.activeEmployees} active</p>
              </div>
              <Users className="h-8 w-8 text-[#3B2352]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Hires</p>
                <p className="text-2xl font-bold text-blue-600">{hrMetrics.newHiresThisMonth}</p>
                <p className="text-sm text-blue-600">this month</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-green-600">{hrMetrics.averagePerformance.toFixed(1)}/5</p>
                <p className="text-sm text-green-600">⭐ Excellent</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold text-purple-600">{hrMetrics.employeeSatisfaction}/5</p>
                <p className="text-sm text-purple-600">High morale</p>
              </div>
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['clinical', 'administrative', 'support', 'management'].map(dept => {
                const deptEmployees = employees.filter(emp => emp.department === dept);
                const percentage = employees.length > 0 ? (deptEmployees.length / employees.length) * 100 : 0;
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{dept}</span>
                      <span className="text-sm text-gray-600">{deptEmployees.length} employees</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Leave Requests</span>
                </div>
                <Badge className="bg-yellow-500">{hrMetrics.totalPendingLeaves}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Performance Reviews Due</span>
                </div>
                <Badge className="bg-blue-500">
                  {employees.filter(emp => new Date(emp.nextReview) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Certification Renewals</span>
                </div>
                <Badge className="bg-green-500">2</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees by name, position, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="clinical">Clinical</SelectItem>
              <SelectItem value="administrative">Administrative</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddEmployeeOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* HR Tabs */}
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Employees ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="attendance" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="leaves" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Leave Requests ({leaveRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#3B2352]" />
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352] font-semibold">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              {employee.firstName} {employee.lastName}
                            </h3>
                            <Badge className={statusColors[employee.status]}>
                              {employee.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <Badge className={departmentColors[employee.department]} variant="outline">
                              {employee.department.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              {employee.employeeType.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Position</p>
                              <p className="font-medium">{employee.position}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Email</p>
                              <p className="font-medium">{employee.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Start Date</p>
                              <p className="font-medium">{new Date(employee.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Performance</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">{employee.performanceRating}/5</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            {employee.certifications.slice(0, 3).map(cert => (
                              <Badge key={cert} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                            {employee.certifications.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{employee.certifications.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEmployeeModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Today's Attendance - {new Date().toLocaleDateString()}</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {timeEntries.filter(entry => entry.status === 'present').length} / {employees.filter(emp => emp.status === 'active').length} Present
              </Badge>
            </div>
            
            {timeEntries.map((entry) => {
              const employee = employees.find(emp => emp.id === entry.employeeId);
              if (!employee) return null;
              
              return (
                <Card key={entry.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352]">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{employee.firstName} {employee.lastName}</h4>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-center">
                        <div>
                          <p className="text-gray-600">Clock In</p>
                          <p className="font-medium">{entry.clockIn}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Clock Out</p>
                          <p className="font-medium">{entry.clockOut || 'Active'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Hours</p>
                          <p className="font-medium">{entry.totalHours}h</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <Badge className={entry.status === 'present' ? 'bg-green-500' : 'bg-red-500'}>
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leave Requests Management</h3>
            <Button onClick={() => setIsLeaveRequestOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
          
          <div className="space-y-4">
            {leaveRequests.map((request) => {
              const employee = employees.find(emp => emp.id === request.employeeId);
              if (!employee) return null;
              
              return (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{employee.firstName} {employee.lastName}</h4>
                          <Badge className={leaveStatusColors[request.status]}>
                            {request.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {request.type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Dates</p>
                            <p className="font-medium">
                              {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-medium">{request.days} days</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Submitted</p>
                            <p className="font-medium">{new Date(request.submittedDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Approved By</p>
                            <p className="font-medium">{request.approvedBy || 'Pending'}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateLeaveStatus(request.id, 'approved', 'HR Manager')}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateLeaveStatus(request.id, 'denied', 'HR Manager')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rating: '5 Stars', count: 2, percentage: 40 },
                    { rating: '4-4.9 Stars', count: 2, percentage: 40 },
                    { rating: '3-3.9 Stars', count: 1, percentage: 20 },
                    { rating: 'Below 3 Stars', count: 0, percentage: 0 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.rating}</span>
                        <span className="text-sm text-gray-600">{item.count} employees</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .sort((a, b) => b.performanceRating - a.performanceRating)
                    .slice(0, 5)
                    .map((employee, index) => (
                      <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-[#3B2352] text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            <p className="text-xs text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold">{employee.performanceRating}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new team member to your healthcare organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newEmployee.firstName}
                  onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newEmployee.lastName}
                  onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                placeholder="e.g., Registered Nurse, Doula, Administrative Assistant"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value as Employee['department']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employeeType">Employment Type</Label>
                <Select value={newEmployee.employeeType} onValueChange={(value) => setNewEmployee({...newEmployee, employeeType: value as Employee['employeeType']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newEmployee.startDate}
                  onChange={(e) => setNewEmployee({...newEmployee, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary (Annual)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({...newEmployee, salary: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newEmployee.address}
                onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Name"
                  value={newEmployee.emergencyContact.name}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    emergencyContact: {...newEmployee.emergencyContact, name: e.target.value}
                  })}
                />
                <Input
                  placeholder="Relationship"
                  value={newEmployee.emergencyContact.relationship}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    emergencyContact: {...newEmployee.emergencyContact, relationship: e.target.value}
                  })}
                />
                <Input
                  placeholder="Phone"
                  value={newEmployee.emergencyContact.phone}
                  onChange={(e) => setNewEmployee({
                    ...newEmployee, 
                    emergencyContact: {...newEmployee.emergencyContact, phone: e.target.value}
                  })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Add Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog open={isLeaveRequestOpen} onOpenChange={setIsLeaveRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Leave Request</DialogTitle>
            <DialogDescription>
              Create a new leave request for employee review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employeeSelect">Employee *</Label>
              <Select value={newLeaveRequest.employeeId} onValueChange={(value) => setNewLeaveRequest({...newLeaveRequest, employeeId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="leaveType">Leave Type</Label>
              <Select value={newLeaveRequest.type} onValueChange={(value) => setNewLeaveRequest({...newLeaveRequest, type: value as LeaveRequest['type']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="maternity">Maternity/Paternity</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLeaveRequest.startDate}
                  onChange={(e) => setNewLeaveRequest({...newLeaveRequest, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newLeaveRequest.endDate}
                  onChange={(e) => setNewLeaveRequest({...newLeaveRequest, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={newLeaveRequest.reason}
                onChange={(e) => setNewLeaveRequest({...newLeaveRequest, reason: e.target.value})}
                placeholder="Brief explanation for the leave request..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLeaveRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLeaveRequest} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Details Modal */}
      <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Employee Profile - {selectedEmployee?.firstName} {selectedEmployee?.lastName}</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center space-y-3">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352] text-2xl font-bold">
                          {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                        <p className="text-gray-600">{selectedEmployee.position}</p>
                        <div className="flex justify-center gap-2 mt-2">
                          <Badge className={statusColors[selectedEmployee.status]}>
                            {selectedEmployee.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-lg">{selectedEmployee.performanceRating}/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-2">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{selectedEmployee.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">{selectedEmployee.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Department</p>
                        <p className="font-medium capitalize">{selectedEmployee.department}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Employment Type</p>
                        <p className="font-medium capitalize">{selectedEmployee.employeeType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p className="font-medium">{new Date(selectedEmployee.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Compensation</p>
                        <p className="font-medium">
                          {selectedEmployee.salary ? 
                            `$${selectedEmployee.salary.toLocaleString()}/year` : 
                            `$${selectedEmployee.hourlyRate}/hour`
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">PTO Balance</p>
                        <p className="font-medium">{selectedEmployee.ptoBalance} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Review</p>
                        <p className="font-medium">{new Date(selectedEmployee.nextReview).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-600">Address</p>
                      <p className="font-medium">{selectedEmployee.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedEmployee.emergencyContact.name}</p>
                      <p><strong>Relationship:</strong> {selectedEmployee.emergencyContact.relationship}</p>
                      <p><strong>Phone:</strong> {selectedEmployee.emergencyContact.phone}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedEmployee.certifications.length > 0 ? (
                        selectedEmployee.certifications.map(cert => (
                          <Badge key={cert} variant="outline" className="mr-2 mb-2">
                            {cert}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No certifications on file</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}