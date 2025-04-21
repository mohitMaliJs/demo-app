'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, CalendarX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface Leave {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason?: string;
  comment?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const leaveSchema = z.object({
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  type: z.enum(['ANNUAL', 'SICK', 'PERSONAL', 'OTHER']),
  reason: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

const statusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comment: z.string().optional(),
});

type StatusFormValues = z.infer<typeof statusSchema>;

export default function LeavesPage() {
  const { data: session } = useSession();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const isAdmin = session?.user?.role === 'ADMIN';
  const isManager = session?.user?.role === 'MANAGER' || isAdmin;

  const leaveForm = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      type: 'ANNUAL',
      reason: '',
    },
  });

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: 'APPROVED',
      comment: '',
    },
  });

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/leaves`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );
        setLeaves(response.data);
      } catch (error) {
        console.error('Error fetching leaves:', error);
        toast({
          title: 'Error',
          description: 'Failed to load leaves. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchLeaves();
    }
  }, [session, toast]);

  const onSubmit = async (data: LeaveFormValues) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/leaves`,
        data,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      setLeaves([response.data, ...leaves]);
      setOpen(false);
      leaveForm.reset();
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit leave request',
        variant: 'destructive',
      });
    }
  };

  const onStatusSubmit = async (data: StatusFormValues) => {
    if (!selectedLeave) return;

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/leaves/${selectedLeave.id}/status`,
        data,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      setLeaves(
        leaves.map((leave) =>
          leave.id === selectedLeave.id ? response.data : leave
        )
      );
      setStatusDialogOpen(false);
      setSelectedLeave(null);
      statusForm.reset();
      toast({
        title: 'Success',
        description: `Leave request ${data.status.toLowerCase()} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating leave status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update leave status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLeave = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/leaves/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      setLeaves(leaves.filter((leave) => leave.id !== id));
      toast({
        title: 'Success',
        description: 'Leave request deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting leave request:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete leave request',
        variant: 'destructive',
      });
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return leave.status === 'PENDING';
    if (activeTab === 'approved') return leave.status === 'APPROVED';
    if (activeTab === 'rejected') return leave.status === 'REJECTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request
              </DialogDescription>
            </DialogHeader>
            <Form {...leaveForm}>
              <form onSubmit={leaveForm.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={leaveForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={leaveForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={leaveForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                          <SelectItem value="SICK">Sick Leave</SelectItem>
                          <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={leaveForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a reason for your leave request"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredLeaves.length === 0 ? (
        <div className="text-center py-12">
          <CalendarX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No leave requests found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab !== 'all'
              ? `No ${activeTab} leave requests found`
              : 'Get started by requesting a leave'}
          </p>
          <div className="mt-6">
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      {leave.user.firstName} {leave.user.lastName}
                    </TableCell>
                    <TableCell>
                      {leave.type === 'ANNUAL'
                        ? 'Annual Leave'
                        : leave.type === 'SICK'
                        ? 'Sick Leave'
                        : leave.type === 'PERSONAL'
                        ? 'Personal Leave'
                        : 'Other'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(leave.startDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell>
                      {format(new Date(leave.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {leave.status === 'PENDING' && (
                          <>
                            {isManager && leave.user.id !== session?.user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setStatusDialogOpen(true);
                                }}
                              >
                                Review
                              </Button>
                            )}
                            {leave.user.id === session?.user?.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancel Leave Request
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this leave
                                      request? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteLeave(leave.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Employee:</span>{' '}
                    {selectedLeave.user.firstName} {selectedLeave.user.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Period:</span>{' '}
                    {format(new Date(selectedLeave.startDate), 'MMM d, yyyy')} -{' '}
                    {format(new Date(selectedLeave.endDate), 'MMM d, yyyy')}
                  </p>
                  <p>
                    <span className="font-medium">Type:</span>{' '}
                    {selectedLeave.type === 'ANNUAL'
                      ? 'Annual Leave'
                      : selectedLeave.type === 'SICK'
                      ? 'Sick Leave'
                      : selectedLeave.type === 'PERSONAL'
                      ? 'Personal Leave'
                      : 'Other'}
                  </p>
                  {selectedLeave.reason && (
                    <p>
                      <span className="font-medium">Reason:</span>{' '}
                      {selectedLeave.reason}
                    </p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <Form {...statusForm}>
            <form onSubmit={statusForm.handleSubmit(onStatusSubmit)} className="space-y-4 py-4">
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decision</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APPROVED">Approve</SelectItem>
                        <SelectItem value="REJECTED">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={statusForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a comment about your decision"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStatusDialogOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Decision</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}