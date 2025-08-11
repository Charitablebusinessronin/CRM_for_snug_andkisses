"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { 
  Briefcase, Plus, Search, Filter, Calendar as CalendarIcon, Clock, 
  Users, CheckCircle, AlertTriangle, BarChart3, FileText, Settings,
  Target, TrendingUp, User, MessageSquare, Paperclip, Star
} from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee: string
  due_date: string
  created_at: string
  project_id: string
  time_logged: number
  attachments: number
  comments: number
}

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date: string
  end_date: string
  budget: number
  spent: number
  progress: number
  manager: string
  team_members: string[]
  tasks_total: number
  tasks_completed: number
  client: string
  created_at: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  avatar: string
  projects: number
  tasks_assigned: number
  tasks_completed: number
  utilization: number
}

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "proj_001",
      name: "HIPAA Compliance Audit",
      description: "Complete HIPAA compliance audit for all patient data handling processes",
      status: "active",
      priority: "critical",
      start_date: "2025-01-01",
      end_date: "2025-02-15",
      budget: 25000,
      spent: 12500,
      progress: 65,
      manager: "Sarah Johnson",
      team_members: ["Sarah Johnson", "Mike Chen", "Emily Davis"],
      tasks_total: 18,
      tasks_completed: 12,
      client: "Internal - Compliance",
      created_at: "2024-12-15"
    },
    {
      id: "proj_002", 
      name: "Patient Portal Enhancement",
      description: "Upgrade patient portal with new features and improved UX",
      status: "active",
      priority: "high",
      start_date: "2025-01-08",
      end_date: "2025-03-01",
      budget: 35000,
      spent: 8750,
      progress: 25,
      manager: "David Wilson",
      team_members: ["David Wilson", "Lisa Park", "Tom Anderson"],
      tasks_total: 24,
      tasks_completed: 6,
      client: "Snug & Kisses Healthcare",
      created_at: "2024-12-20"
    },
    {
      id: "proj_003",
      name: "Care Team Training Program",
      description: "Develop comprehensive training program for new care team protocols",
      status: "planning",
      priority: "medium",
      start_date: "2025-02-01",
      end_date: "2025-04-30",
      budget: 18000,
      spent: 0,
      progress: 5,
      manager: "Jennifer Lee",
      team_members: ["Jennifer Lee", "Robert Kim"],
      tasks_total: 15,
      tasks_completed: 0,
      client: "Training Department",
      created_at: "2025-01-02"
    }
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task_001",
      title: "Review current HIPAA policies",
      description: "Conduct thorough review of existing HIPAA compliance policies",
      status: "completed",
      priority: "high",
      assignee: "Sarah Johnson",
      due_date: "2025-01-10",
      created_at: "2025-01-01",
      project_id: "proj_001",
      time_logged: 8,
      attachments: 3,
      comments: 5
    },
    {
      id: "task_002",
      title: "Audit patient data access logs",
      description: "Analyze all patient data access logs for compliance violations",
      status: "in_progress",
      priority: "critical",
      assignee: "Mike Chen",
      due_date: "2025-01-15",
      created_at: "2025-01-03",
      project_id: "proj_001",
      time_logged: 12,
      attachments: 1,
      comments: 8
    },
    {
      id: "task_003",
      title: "Design new patient dashboard UI",
      description: "Create mockups and wireframes for enhanced patient dashboard",
      status: "in_progress",
      priority: "medium",
      assignee: "Lisa Park",
      due_date: "2025-01-20",
      created_at: "2025-01-08",
      project_id: "proj_002",
      time_logged: 6,
      attachments: 12,
      comments: 15
    },
    {
      id: "task_004",
      title: "Update encryption protocols",
      description: "Implement new encryption standards for patient data storage",
      status: "review",
      priority: "high",
      assignee: "Emily Davis",
      due_date: "2025-01-18",
      created_at: "2025-01-05",
      project_id: "proj_001",
      time_logged: 16,
      attachments: 2,
      comments: 3
    }
  ])

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "tm_001",
      name: "Sarah Johnson",
      role: "Project Manager",
      email: "sarah.johnson@snugkisses.com",
      avatar: "/avatars/sarah.jpg",
      projects: 2,
      tasks_assigned: 8,
      tasks_completed: 6,
      utilization: 85
    },
    {
      id: "tm_002",
      name: "Mike Chen",
      role: "Security Specialist",
      email: "mike.chen@snugkisses.com",
      avatar: "/avatars/mike.jpg",
      projects: 1,
      tasks_assigned: 5,
      tasks_completed: 3,
      utilization: 75
    },
    {
      id: "tm_003",
      name: "Lisa Park",
      role: "UI/UX Designer",
      email: "lisa.park@snugkisses.com",
      avatar: "/avatars/lisa.jpg",
      projects: 1,
      tasks_assigned: 6,
      tasks_completed: 2,
      utilization: 60
    }
  ])

  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    priority: "medium",
    start_date: new Date(),
    end_date: new Date(),
    budget: "",
    manager: "",
    client: ""
  })
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    due_date: new Date(),
    project_id: ""
  })

  const handleCreateProject = async () => {
    const project: Project = {
      id: `proj_${Date.now()}`,
      name: newProject.name,
      description: newProject.description,
      status: "planning",
      priority: newProject.priority as 'low' | 'medium' | 'high' | 'critical',
      start_date: format(newProject.start_date, 'yyyy-MM-dd'),
      end_date: format(newProject.end_date, 'yyyy-MM-dd'),
      budget: parseFloat(newProject.budget) || 0,
      spent: 0,
      progress: 0,
      manager: newProject.manager,
      team_members: [newProject.manager],
      tasks_total: 0,
      tasks_completed: 0,
      client: newProject.client,
      created_at: format(new Date(), 'yyyy-MM-dd')
    }

    setProjects(prev => [...prev, project])
    setShowNewProjectModal(false)
    setNewProject({
      name: "",
      description: "",
      priority: "medium",
      start_date: new Date(),
      end_date: new Date(),
      budget: "",
      manager: "",
      client: ""
    })
    toast.success("Project created successfully!")
  }

  const handleCreateTask = async () => {
    const task: Task = {
      id: `task_${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority as 'low' | 'medium' | 'high' | 'critical',
      assignee: newTask.assignee,
      due_date: format(newTask.due_date, 'yyyy-MM-dd'),
      created_at: format(new Date(), 'yyyy-MM-dd'),
      project_id: newTask.project_id,
      time_logged: 0,
      attachments: 0,
      comments: 0
    }

    setTasks(prev => [...prev, task])
    
    // Update project task count
    setProjects(prev => prev.map(project => 
      project.id === newTask.project_id 
        ? { ...project, tasks_total: project.tasks_total + 1 }
        : project
    ))

    setShowNewTaskModal(false)
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      assignee: "",
      due_date: new Date(),
      project_id: ""
    })
    toast.success("Task created successfully!")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': 
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-purple-100 text-purple-800'
      case 'planning': 
      case 'todo': return 'bg-gray-100 text-gray-800'
      case 'on_hold': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    overdue: projects.filter(p => new Date(p.end_date) < new Date() && p.status !== 'completed').length
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'completed').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Projects Management
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive project tracking and team collaboration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setShowNewTaskModal(true)}
            variant="outline"
            className="border-[#3B2352] text-[#3B2352]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button 
            onClick={() => setShowNewProjectModal(true)}
            className="bg-[#3B2352] hover:bg-[#2A1A3E]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-[#3B2352]">{projectStats.total}</p>
                <p className="text-sm text-gray-500">{projectStats.active} active</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-[#3B2352]">{taskStats.total}</p>
                <p className="text-sm text-green-600">{taskStats.completed} completed</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-[#3B2352]">{taskStats.in_progress}</p>
                <p className="text-sm text-blue-600">Tasks active</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                <p className="text-2xl font-bold text-[#3B2352]">{taskStats.overdue}</p>
                <p className="text-sm text-red-600">Need attention</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-96">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Manage and track all project progress</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search projects..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-[#3B2352]">{project.name}</h3>
                            <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                            <Badge variant="secondary" className={getStatusColor(project.status)}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{project.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Progress</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Progress value={project.progress} className="flex-1" />
                                <span className="text-sm font-medium">{project.progress}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Budget</p>
                              <p className="font-medium">
                                ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Tasks</p>
                              <p className="font-medium">
                                {project.tasks_completed} / {project.tasks_total} completed
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{project.manager}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{project.team_members.length} members</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {format(new Date(project.end_date), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Tasks</CardTitle>
                  <CardDescription>Track individual task progress and assignments</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter(task => !selectedProject || task.project_id === selectedProject)
                  .map((task) => (
                  <Card key={task.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-[#3B2352]">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {task.priority}
                            </Badge>
                            <Badge variant="secondary" className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{task.assignee}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  Due: {format(new Date(task.due_date), 'MMM dd')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{task.time_logged}h logged</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Paperclip className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-500">{task.attachments}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-500">{task.comments}</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>Track team performance and workload distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="border-[#D7C7ED]/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-[#3B2352]">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Projects</span>
                          <span className="font-medium">{member.projects}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tasks Assigned</span>
                          <span className="font-medium">{member.tasks_assigned}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tasks Completed</span>
                          <span className="font-medium">{member.tasks_completed}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Utilization</span>
                            <span className="text-sm font-medium">{member.utilization}%</span>
                          </div>
                          <Progress value={member.utilization} className="h-2" />
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Project Health Dashboard</CardTitle>
                <CardDescription>Overall project portfolio status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">On Track</span>
                    </div>
                    <span className="font-bold text-green-600">75%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">At Risk</span>
                    </div>
                    <span className="font-bold text-yellow-600">20%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Behind Schedule</span>
                    </div>
                    <span className="font-bold text-red-600">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Team capacity and workload analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Team Capacity</span>
                      <span className="text-sm text-gray-600">73% utilized</span>
                    </div>
                    <Progress value={73} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Budget Utilization</span>
                      <span className="text-sm text-gray-600">64% spent</span>
                    </div>
                    <Progress value={64} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Timeline Progress</span>
                      <span className="text-sm text-gray-600">58% complete</span>
                    </div>
                    <Progress value={58} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle>Recent Activity Timeline</CardTitle>
              <CardDescription>Latest project updates and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: "HIPAA Compliance Audit - Phase 2 completed", time: "2 hours ago", type: "success" },
                  { event: "New task assigned: Update encryption protocols", time: "4 hours ago", type: "info" },
                  { event: "Patient Portal Enhancement - UI mockups reviewed", time: "6 hours ago", type: "info" },
                  { event: "Budget alert: Care Team Training Program", time: "1 day ago", type: "warning" },
                  { event: "Project milestone: HIPAA policy review completed", time: "2 days ago", type: "success" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "success" ? "bg-green-500" :
                      activity.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-[#3B2352]">{activity.event}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Project Modal */}
      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Set up a new project with timeline, budget, and team assignments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="project-client">Client</Label>
                <Input
                  id="project-client"
                  value={newProject.client}
                  onChange={(e) => setNewProject(prev => ({ ...prev, client: e.target.value }))}
                  placeholder="Client name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="project-priority">Priority</Label>
                <Select value={newProject.priority} onValueChange={(value) => 
                  setNewProject(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="project-manager">Project Manager</Label>
                <Select value={newProject.manager} onValueChange={(value) => 
                  setNewProject(prev => ({ ...prev, manager: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="project-budget">Budget ($)</Label>
                <Input
                  id="project-budget"
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newProject.start_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newProject.start_date}
                      onSelect={(date) => date && setNewProject(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newProject.end_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newProject.end_date}
                      onSelect={(date) => date && setNewProject(prev => ({ ...prev, end_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} className="bg-[#3B2352] hover:bg-[#2A1A3E]">
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Task Modal */}
      <Dialog open={showNewTaskModal} onOpenChange={setShowNewTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to an existing project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-project">Project</Label>
                <Select value={newTask.project_id} onValueChange={(value) => 
                  setNewTask(prev => ({ ...prev, project_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => 
                  setNewTask(prev => ({ ...prev, priority: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select value={newTask.assignee} onValueChange={(value) => 
                  setNewTask(prev => ({ ...prev, assignee: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTask.due_date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.due_date}
                      onSelect={(date) => date && setNewTask(prev => ({ ...prev, due_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTaskModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} className="bg-[#3B2352] hover:bg-[#2A1A3E]">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}