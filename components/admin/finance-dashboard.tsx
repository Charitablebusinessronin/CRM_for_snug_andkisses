"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  Edit, 
  Eye, 
  Download,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Receipt,
  Banknote,
  PiggyBank,
  BarChart3,
  FileText,
  Send,
  Printer
} from 'lucide-react';
import { InvoiceCreator } from '@/components/invoice-creator';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  date: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  created_time: string;
  paymentMethod?: string;
  paidDate?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'insurance';
  date: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
}

interface Expense {
  id: string;
  description: string;
  category: 'supplies' | 'equipment' | 'utilities' | 'insurance' | 'marketing' | 'other';
  amount: number;
  date: string;
  vendor: string;
  receipt?: string;
  status: 'pending' | 'approved' | 'paid';
}

interface FinanceMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  totalExpenses: number;
  netProfit: number;
  averageInvoiceValue: number;
  paymentCycle: number; // average days to payment
}

export function FinanceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isInvoiceCreatorOpen, setIsInvoiceCreatorOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'supplies' as Expense['category'],
    amount: 0,
    vendor: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setIsLoading(true);
    try {
      // Load invoices from our API
      const invoicesResponse = await fetch('/api/finance/invoices');
      let invoiceData = [];
      if (invoicesResponse.ok) {
        const result = await invoicesResponse.json();
        invoiceData = result.data || [];
      }

      // Generate comprehensive mock finance data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2025-001',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.johnson@email.com',
          customerCompany: 'Johnson Family',
          date: '2025-01-01',
          dueDate: '2025-01-31',
          subtotal: 2500.00,
          tax: 200.00,
          total: 2700.00,
          status: 'paid',
          items: [
            { description: 'Postpartum Care Package (6 weeks)', quantity: 1, rate: 2500.00, amount: 2500.00 }
          ],
          created_time: '2025-01-01T10:00:00Z',
          paymentMethod: 'insurance',
          paidDate: '2025-01-15'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2025-002',
          customerName: 'Emma Miller',
          customerEmail: 'emma.miller@email.com',
          customerCompany: 'Miller Family',
          date: '2025-01-02',
          dueDate: '2025-02-01',
          subtotal: 1200.00,
          tax: 96.00,
          total: 1296.00,
          status: 'sent',
          items: [
            { description: 'Lactation Support Sessions', quantity: 4, rate: 300.00, amount: 1200.00 }
          ],
          created_time: '2025-01-02T14:30:00Z'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2025-003',
          customerName: 'Jennifer Davis',
          customerEmail: 'jennifer.davis@email.com',
          customerCompany: 'Davis Family',
          date: '2024-12-15',
          dueDate: '2025-01-14',
          subtotal: 3200.00,
          tax: 256.00,
          total: 3456.00,
          status: 'overdue',
          items: [
            { description: 'Birth Doula Services', quantity: 1, rate: 3200.00, amount: 3200.00 }
          ],
          created_time: '2024-12-15T09:15:00Z'
        },
        {
          id: '4',
          invoiceNumber: 'INV-2025-004',
          customerName: 'Lisa Wilson',
          customerEmail: 'lisa.wilson@email.com',
          customerCompany: 'Wilson Family',
          date: '2025-01-03',
          dueDate: '2025-02-02',
          subtotal: 4500.00,
          tax: 360.00,
          total: 4860.00,
          status: 'paid',
          items: [
            { description: 'Comprehensive Care Package', quantity: 1, rate: 4500.00, amount: 4500.00 }
          ],
          created_time: '2025-01-03T11:20:00Z',
          paymentMethod: 'credit_card',
          paidDate: '2025-01-10'
        }
      ];

      const mockPayments: Payment[] = [
        {
          id: '1',
          invoiceId: '1',
          amount: 2700.00,
          method: 'insurance',
          date: '2025-01-15',
          reference: 'INS-789456',
          status: 'completed'
        },
        {
          id: '2',
          invoiceId: '4',
          amount: 4860.00,
          method: 'credit_card',
          date: '2025-01-10',
          reference: 'CC-123789',
          status: 'completed'
        }
      ];

      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Medical Supplies - January',
          category: 'supplies',
          amount: 450.00,
          date: '2025-01-02',
          vendor: 'Healthcare Supply Co.',
          status: 'paid'
        },
        {
          id: '2',
          description: 'Office Rent - January',
          category: 'utilities',
          amount: 1200.00,
          date: '2025-01-01',
          vendor: 'Property Management LLC',
          status: 'paid'
        },
        {
          id: '3',
          description: 'Professional Liability Insurance',
          category: 'insurance',
          amount: 800.00,
          date: '2025-01-01',
          vendor: 'Healthcare Insurance Group',
          status: 'paid'
        },
        {
          id: '4',
          description: 'Marketing Campaign - Social Media',
          category: 'marketing',
          amount: 300.00,
          date: '2025-01-03',
          vendor: 'Digital Marketing Agency',
          status: 'approved'
        }
      ];

      setInvoices(mockInvoices);
      setPayments(mockPayments);
      setExpenses(mockExpenses);
    } catch (error) {
      toast.error("Failed to load finance data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.vendor) {
      toast.error("Please fill in all required fields");
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      ...newExpense,
      status: 'pending'
    };

    setExpenses(prev => [expense, ...prev]);
    setIsExpenseModalOpen(false);
    setNewExpense({
      description: '',
      category: 'supplies',
      amount: 0,
      vendor: '',
      date: new Date().toISOString().split('T')[0]
    });
    toast.success("Expense recorded successfully!");
  };

  const updateInvoiceStatus = (invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(invoice => {
      if (invoice.id === invoiceId) {
        const updatedInvoice = { ...invoice, status: newStatus };
        if (newStatus === 'paid') {
          updatedInvoice.paidDate = new Date().toISOString().split('T')[0];
          updatedInvoice.paymentMethod = 'credit_card';
        }
        return updatedInvoice;
      }
      return invoice;
    }));
    
    toast.success(`Invoice marked as ${newStatus.toUpperCase()}`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.customerCompany && invoice.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const financeMetrics: FinanceMetrics = {
    totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    monthlyRevenue: invoices.filter(inv => 
      inv.status === 'paid' && 
      new Date(inv.paidDate || inv.date).getMonth() === new Date().getMonth()
    ).reduce((sum, inv) => sum + inv.total, 0),
    outstandingAmount: invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + inv.total, 0),
    paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
    totalExpenses: expenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0),
    netProfit: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0) - 
               expenses.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + exp.amount, 0),
    averageInvoiceValue: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length : 0,
    paymentCycle: 18 // average days
  };

  const statusColors = {
    draft: 'bg-gray-500',
    sent: 'bg-blue-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
    cancelled: 'bg-gray-500'
  };

  const statusNames = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled'
  };

  return (
    <div className="space-y-6">
      {/* Finance Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Financial Management
          </h2>
          <p className="text-gray-600">Comprehensive financial tracking and invoice management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadFinanceData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => toast.success("Export feature coming soon!")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${financeMetrics.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+12% vs last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${financeMetrics.outstandingAmount.toLocaleString()}
                </p>
                <p className="text-sm text-orange-600">{invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).length} invoices</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-[#3B2352]">
                  ${financeMetrics.netProfit.toLocaleString()}
                </p>
                <p className="text-sm text-[#3B2352]">This month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#3B2352]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Invoice</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${financeMetrics.averageInvoiceValue.toFixed(0)}
                </p>
                <p className="text-sm text-blue-600">{financeMetrics.paymentCycle} day cycle</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Financial Overview</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Profitable
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Revenue</span>
                <span className="text-green-600 font-bold">${financeMetrics.totalRevenue.toLocaleString()}</span>
              </div>
              <Progress value={100} className="h-3 bg-gray-200">
                <div className="h-full bg-green-500 rounded-full" />
              </Progress>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Expenses</span>
                <span className="text-red-600 font-bold">${financeMetrics.totalExpenses.toLocaleString()}</span>
              </div>
              <Progress 
                value={(financeMetrics.totalExpenses / financeMetrics.totalRevenue) * 100} 
                className="h-3 bg-gray-200"
              >
                <div className="h-full bg-red-500 rounded-full" />
              </Progress>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-bold">Net Profit</span>
                <span className="text-[#3B2352] font-bold text-lg">
                  ${financeMetrics.netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invoices by number, customer, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsInvoiceCreatorOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Finance Tabs */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#3B2352]" />
              </div>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                          <Badge className={statusColors[invoice.status]}>
                            {statusNames[invoice.status]}
                          </Badge>
                          {invoice.status === 'overdue' && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              OVERDUE
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Customer</p>
                            <p className="font-medium">{invoice.customerName}</p>
                            <p className="text-xs text-gray-500">{invoice.customerCompany}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-bold text-green-600">${invoice.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Tax: ${invoice.tax.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Issue Date</p>
                            <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                            {invoice.status === 'overdue' && (
                              <p className="text-xs text-red-600">
                                {Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-600">Payment</p>
                            <p className="font-medium">{invoice.paymentMethod || 'Pending'}</p>
                            {invoice.paidDate && (
                              <p className="text-xs text-green-600">Paid: {new Date(invoice.paidDate).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsInvoiceModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'sent' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="space-y-4">
            {payments.map((payment) => {
              const invoice = invoices.find(inv => inv.id === payment.invoiceId);
              return (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">Payment #{payment.id}</h4>
                          <Badge className={payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Invoice</p>
                            <p className="font-medium">{invoice?.invoiceNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Amount</p>
                            <p className="font-bold text-green-600">${payment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Method</p>
                            <p className="font-medium capitalize">{payment.method.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Date</p>
                            <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Reference: {payment.reference}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Business Expenses</h3>
            <Button onClick={() => setIsExpenseModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
          
          <div className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{expense.description}</h4>
                        <Badge variant="outline" className="capitalize">
                          {expense.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={
                          expense.status === 'paid' ? 'bg-green-500' :
                          expense.status === 'approved' ? 'bg-blue-500' : 'bg-yellow-500'
                        }>
                          {expense.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Vendor</p>
                          <p className="font-medium">{expense.vendor}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Amount</p>
                          <p className="font-bold text-red-600">${expense.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { service: 'Postpartum Care', revenue: 15600, percentage: 45 },
                    { service: 'Doula Services', revenue: 12800, percentage: 37 },
                    { service: 'Lactation Support', revenue: 4200, percentage: 12 },
                    { service: 'Comprehensive Packages', revenue: 2100, percentage: 6 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.service}</span>
                        <span className="text-sm text-gray-600">${item.revenue.toLocaleString()}</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'November 2024', revenue: 28900, expenses: 6200, profit: 22700 },
                    { month: 'December 2024', revenue: 32100, expenses: 7100, profit: 25000 },
                    { month: 'January 2025', revenue: 34700, expenses: 7500, profit: 27200 }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium mb-2">{item.month}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-green-600">Revenue</p>
                          <p className="font-bold">${item.revenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-red-600">Expenses</p>
                          <p className="font-bold">${item.expenses.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[#3B2352]">Profit</p>
                          <p className="font-bold">${item.profit.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Creator Modal */}
      <InvoiceCreator 
        open={isInvoiceCreatorOpen} 
        onOpenChange={setIsInvoiceCreatorOpen} 
      />

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Business Expense</DialogTitle>
            <DialogDescription>
              Record a new business expense for tracking and tax purposes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expenseDescription">Description *</Label>
              <Input
                id="expenseDescription"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="e.g., Medical supplies for January"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseCategory">Category</Label>
                <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value as Expense['category']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplies">Medical Supplies</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="utilities">Utilities & Rent</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expenseAmount">Amount ($) *</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseVendor">Vendor/Supplier *</Label>
                <Input
                  id="expenseVendor"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="expenseDate">Date</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Badge className={statusColors[selectedInvoice.status]}>
                          {statusNames[selectedInvoice.status]}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
                        <p><strong>Email:</strong> {selectedInvoice.customerEmail}</p>
                        <p><strong>Company:</strong> {selectedInvoice.customerCompany}</p>
                        <p><strong>Issue Date:</strong> {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                        <p><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                        {selectedInvoice.paidDate && (
                          <p><strong>Paid Date:</strong> {new Date(selectedInvoice.paidDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Invoice Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${selectedInvoice.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>${selectedInvoice.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.rate.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${item.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}