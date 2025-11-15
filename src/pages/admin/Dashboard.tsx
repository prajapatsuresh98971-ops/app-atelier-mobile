import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeParents: 0,
    activeChildren: 0,
    totalPairings: 0,
    openTickets: 0,
  });
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsAdmin(!!data);
      
      if (data) {
        await fetchStats();
        await fetchTickets();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Count total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Count parents
      const { count: parentCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'parent');

      // Count children
      const { count: childCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'child');

      // Count active pairings
      const { count: pairingCount } = await supabase
        .from('device_pairings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Count open tickets
      const { count: ticketCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      setStats({
        totalUsers: userCount || 0,
        activeParents: parentCount || 0,
        activeChildren: childCount || 0,
        totalPairings: pairingCount || 0,
        openTickets: ticketCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, profiles!support_tickets_user_id_fkey(name, email)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Ticket Updated",
        description: `Ticket marked as ${status}`,
      });

      await fetchTickets();
      await fetchStats();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/parent/dashboard" replace />;
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">System monitoring and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Parents</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeParents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Children</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChildren}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openTickets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="stats">System Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Support Tickets</CardTitle>
                <CardDescription>Latest support requests from users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{ticket.subject}</p>
                          <Badge variant={
                            ticket.status === 'open' ? 'destructive' :
                            ticket.status === 'in_progress' ? 'default' : 'secondary'
                          }>
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline">{ticket.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{ticket.message}</p>
                        <p className="text-xs text-muted-foreground">
                          From: {ticket.profiles?.name || ticket.profiles?.email} • 
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {ticket.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {ticket.status !== 'resolved' && (
                          <Button
                            size="sm"
                            onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No tickets found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
                <CardDescription>Overview of platform metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="font-medium">Total Device Pairings</span>
                    <span className="text-2xl font-bold">{stats.totalPairings}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="font-medium">Parent Accounts</span>
                    <span className="text-2xl font-bold">{stats.activeParents}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="font-medium">Child Accounts</span>
                    <span className="text-2xl font-bold">{stats.activeChildren}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
