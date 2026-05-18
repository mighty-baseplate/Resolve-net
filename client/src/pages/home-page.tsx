import { useQuery, useMutation } from "@tanstack/react-query";
import { Issue } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, ThumbsUp, Clock, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

type SortOption = "votes" | "date";
type StatusFilter = "all" | "reported" | "in_progress" | "resolved";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: issues, isLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, increment }: { id: number; increment: boolean }) => {
      const res = await apiRequest("POST", `/api/issues/${id}/vote`, { increment });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/issues/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredAndSortedIssues = issues
    ?.filter(issue => statusFilter === 'all' || issue.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ResolveNet</h1>
          <div className="flex items-center gap-4">
            <Link href="/report">
              <Button>Report Issue</Button>
            </Link>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                {sortBy === 'votes' ? (
                  <ThumbsUp className="w-4 h-4 mr-2" />
                ) : (
                  <Clock className="w-4 h-4 mr-2" />
                )}
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes">Most Votes</SelectItem>
                <SelectItem value="date">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredAndSortedIssues?.map((issue) => (
            <Card key={issue.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{issue.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)}
                        </span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                    {issue.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{issue.description}</p>
                {issue.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={issue.imageUrl}
                      alt="Issue"
                      className="rounded-md max-h-48 object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => voteMutation.mutate({ id: issue.id, increment: true })}
                    disabled={voteMutation.isPending}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {issue.votes} votes
                  </Button>

                  {user?.role === 'authority' && (
                    <Select
                      value={issue.status}
                      onValueChange={(value) =>
                        statusMutation.mutate({ id: issue.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}