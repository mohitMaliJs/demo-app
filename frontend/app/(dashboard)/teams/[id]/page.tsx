'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Edit, Trash, UserPlus, ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Team {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }[];
}

export default function TeamDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );
        setTeam(response.data);
        setTeamName(response.data.name);
        setTeamDescription(response.data.description || '');
      } catch (error) {
        console.error('Error fetching team:', error);
        toast({
          title: 'Error',
          description: 'Failed to load team details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken && id) {
      fetchTeam();
    }
  }, [id, session, toast]);

  const handleUpdateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${id}`,
        {
          name: teamName,
          description: teamDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      setTeam({ ...team!, ...response.data });
      setEditDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Team updated successfully',
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to update team. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    setSubmitting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/teams/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      toast({
        title: 'Success',
        description: 'Team deleted successfully',
      });
      router.push('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete team. Please try again.',
        variant: 'destructive',
      });
      setDeleteDialogOpen(false);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/teams')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teams
      </Button>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : team ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              {team.description && (
                <p className="text-gray-500 mt-1">{team.description}</p>
              )}
            </div>
            {isAdmin && (
              <div className="flex space-x-2">
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Team</DialogTitle>
                      <DialogDescription>
                        Update team information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter team name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Enter team description"
                          value={teamDescription}
                          onChange={(e) => setTeamDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateTeam} disabled={submitting}>
                        {submitting ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Team</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this team? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={submitting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteTeam}
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {submitting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  {team.members.length} members in this team
                </CardDescription>
              </div>
              {isAdmin && (
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {team.members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No members
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This team doesn&apos;t have any members yet
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      {isAdmin && <TableHead className="w-24">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <span className="capitalize">{member.role.toLowerCase()}</span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Team not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The team you are looking for does not exist or you don&apos;t have
            permission to view it.
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => router.push('/teams')}
          >
            Go back to Teams
          </Button>
        </div>
      )}
    </div>
  );
}