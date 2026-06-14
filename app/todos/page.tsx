"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus, Search, LogOut, CheckCircle2, Clock, Circle,
  MoreVertical, Pencil, Trash2, CheckSquare, Loader2, User as UserIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Todo {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

export default function TodosDashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);

  const [formData, setFormData] = useState({ title: "", description: "", status: "pending" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchTodos();
    }
  }, [authLoading, user]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/todos");
      setTodos(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load todos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");

    try {
      setIsSubmitting(true);
      const response = await api.post("/todos", formData);
      setTodos((prev) => [response.data.data, ...prev]);
      toast.success("Task created successfully");
      setIsCreateModalOpen(false);
      setFormData({ title: "", description: "", status: "pending" });
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTodo) return;
    if (!formData.title.trim()) return toast.error("Title is required");

    try {
      setIsSubmitting(true);
      const response = await api.put(`/todos/${currentTodo._id}`, formData);
      setTodos((prev) =>
        prev.map((t) => (t._id === currentTodo._id ? response.data.data : t))
      );
      toast.success("Task updated successfully");
      setIsEditModalOpen(false);
      setCurrentTodo(null);
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t._id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const openEditModal = (todo: Todo) => {
    setCurrentTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      status: todo.status,
    });
    setIsEditModalOpen(true);
  };


  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || todo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [todos, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-200 border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-200 border-blue-200 dark:border-blue-500/20 px-3 py-1 rounded-full shadow-sm"><Clock className="w-3.5 h-3.5 mr-1.5" /> In Progress</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full shadow-sm"><Circle className="w-3.5 h-3.5 mr-1.5" /> Pending</Badge>;
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin h-10 w-10 text-indigo-500" /></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-slate-50 to-cyan-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 relative">
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-500/10 dark:from-indigo-500/5 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="sticky top-4 z-40 w-full max-w-6xl mx-auto px-4 mb-4">
        <div className="rounded-2xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-indigo-100/40 dark:shadow-slate-900/50 flex items-center justify-between px-6 h-16 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-900 dark:text-white">TaskMaster</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-200/60 dark:border-slate-800">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Welcome back, {user.username}!</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Here's what you need to get done today.</p>
          </div>
          <Button onClick={() => {
            setFormData({ title: "", description: "", status: "pending" });
            setIsCreateModalOpen(true);
          }} className="h-12 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 active:scale-95 font-semibold text-base">
            <Plus className="mr-2 h-5 w-5" /> Add New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800/60">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-12 h-12 rounded-xl bg-white dark:bg-slate-950 border-none shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/50 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[220px]">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-slate-950 border-none shadow-sm focus:ring-2 focus:ring-indigo-500/50 text-base px-4">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                <SelectItem value="all" className="rounded-lg my-1">All Statuses</SelectItem>
                <SelectItem value="pending" className="rounded-lg my-1">Pending</SelectItem>
                <SelectItem value="in-progress" className="rounded-lg my-1">In Progress</SelectItem>
                <SelectItem value="completed" className="rounded-lg my-1">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Todo List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-3xl border-transparent shadow-sm bg-white/50 dark:bg-slate-900/50">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-3 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-5/6 rounded-md mb-2" />
                  <Skeleton className="h-4 w-4/6 rounded-md" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredTodos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTodos.map((todo) => (
              <Card key={todo._id} className="group overflow-hidden flex flex-col rounded-3xl border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0 relative px-6 pt-6">
                  <div className="pr-10 w-full">
                    <CardTitle className={`text-xl font-bold leading-tight mb-2 line-clamp-1 ${todo.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`} title={todo.title}>
                      {todo.title}
                    </CardTitle>
                    <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {format(new Date(todo.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-9 w-9 absolute top-5 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center border border-transparent focus:opacity-100">
                      <MoreVertical className="h-5 w-5 text-slate-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-40 p-2">
                      <DropdownMenuItem onClick={() => openEditModal(todo)} className="rounded-lg my-1 cursor-pointer font-medium">
                        <Pencil className="mr-2 h-4 w-4 text-indigo-500" /> Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteTodo(todo._id)} className="text-red-600 rounded-lg my-1 cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-1 pb-6 px-6">
                  <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {todo.description || <span className="italic text-slate-400/70">No description provided.</span>}
                  </p>
                </CardContent>
                <CardFooter className="pt-4 pb-6 px-6 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                  <div>{getStatusBadge(todo.status)}</div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-sm mt-8">
            <div className="bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/40 dark:to-cyan-900/40 p-6 rounded-full mb-6 shadow-inner">
              <CheckSquare className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No tasks found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mb-8 leading-relaxed">
              {searchQuery || statusFilter !== "all"
                ? "We couldn't find any tasks matching your filters. Try adjusting them."
                : "Your task list is beautifully empty. Let's create your first task and get things done!"}
            </p>
            {(!searchQuery && statusFilter === "all") && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg font-semibold text-base transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" /> Create your first task
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Create Todo Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-900">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">Create new task</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Add a new task to your list. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTodo}>
              <div className="grid gap-6">
                <div className="grid gap-2.5">
                  <Label htmlFor="title" className="font-semibold">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Design the new landing page"
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="description" className="font-semibold">Description <span className="text-slate-400 font-normal">(Optional)</span></Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add more details about this task..."
                    className="resize-none rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 p-4"
                    rows={4}
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="status" className="font-semibold">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: (val as any) || "pending" })}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="pending" className="my-1 rounded-lg">Pending</SelectItem>
                      <SelectItem value="in-progress" className="my-1 rounded-lg">In Progress</SelectItem>
                      <SelectItem value="completed" className="my-1 rounded-lg">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl font-medium border-slate-200 dark:border-slate-700" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="h-11 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md font-semibold">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Todo Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="px-8 pt-8 pb-6 bg-white dark:bg-slate-900">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">Edit task</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Make changes to your task details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTodo}>
              <div className="grid gap-6">
                <div className="grid gap-2.5">
                  <Label htmlFor="edit-title" className="font-semibold">Task Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Task title"
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="edit-description" className="font-semibold">Description <span className="text-slate-400 font-normal">(Optional)</span></Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task description..."
                    className="resize-none rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 p-4"
                    rows={4}
                  />
                </div>
                <div className="grid gap-2.5">
                  <Label htmlFor="edit-status" className="font-semibold">Status</Label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: (val as any) || "pending" })}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="pending" className="my-1 rounded-lg">Pending</SelectItem>
                      <SelectItem value="in-progress" className="my-1 rounded-lg">In Progress</SelectItem>
                      <SelectItem value="completed" className="my-1 rounded-lg">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" className="h-11 px-6 rounded-xl font-medium border-slate-200 dark:border-slate-700" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="h-11 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white shadow-md font-semibold">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
