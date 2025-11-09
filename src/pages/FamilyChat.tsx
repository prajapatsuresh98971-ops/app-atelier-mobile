import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";

export default function FamilyChat() {
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage } = useChat(selectedContact);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUserId(user.id);

    // Get user role
    const { data: roleData } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData) return;

    // If parent, get paired children
    if (roleData.role === 'parent') {
      const { data: pairings } = await (supabase as any)
        .from('device_pairings')
        .select('child_id, profiles!device_pairings_child_id_fkey(name)')
        .eq('parent_id', user.id)
        .eq('is_active', true);

      if (pairings) {
        const formattedContacts = pairings.map((p: any) => ({
          id: p.child_id,
          name: p.profiles?.name || 'Child',
        }));
        setContacts(formattedContacts);
        if (formattedContacts.length > 0) {
          setSelectedContact(formattedContacts[0].id);
        }
      }
    } else {
      // If child, get paired parents
      const { data: pairings } = await (supabase as any)
        .from('device_pairings')
        .select('parent_id, profiles!device_pairings_parent_id_fkey(name)')
        .eq('child_id', user.id)
        .eq('is_active', true);

      if (pairings) {
        const formattedContacts = pairings.map((p: any) => ({
          id: p.parent_id,
          name: p.profiles?.name || 'Parent',
        }));
        setContacts(formattedContacts);
        if (formattedContacts.length > 0) {
          setSelectedContact(formattedContacts[0].id);
        }
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedContact) return;

    await sendMessage(messageInput);
    setMessageInput("");
  };

  return (
    <Layout title="Family Chat">
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-4 h-[calc(100vh-180px)] flex flex-col">
          {/* Contact Selection */}
          <Card className="mb-4 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat With
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="flex-1 flex flex-col glass-card">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground">No messages yet. Start a conversation!</p>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p className="break-words">{message.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <CardContent className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={!selectedContact}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!messageInput.trim() || !selectedContact}
                  className="glow-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomTabBar />
    </Layout>
  );
}
