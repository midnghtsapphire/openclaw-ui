import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, MessageSquare } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export default function ChatPage() {
  const agents = trpc.agents.list.useQuery();
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ role: "system", content: "You are an OpenClaw AI agent assistant." }]);

  const agentId = selectedAgentId ?? agents.data?.[0]?.id ?? null;
  const history = trpc.chat.history.useQuery({ agentId: agentId ?? 0 }, { enabled: !!agentId });
  const sendMessage = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    },
  });

  const initialMessages = useMemo(() => {
    if (!history.data) return [];
    return history.data.map(m => ({ role: m.role as Message["role"], content: m.content }));
  }, [history.data]);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages([{ role: "system", content: "You are an OpenClaw AI agent assistant." }, ...initialMessages]);
    } else {
      setMessages([{ role: "system", content: "You are an OpenClaw AI agent assistant." }]);
    }
  }, [initialMessages]);

  const handleSend = (content: string) => {
    if (!agentId) return;
    setMessages(prev => [...prev, { role: "user", content }]);
    sendMessage.mutate({ agentId, message: content });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
            <p className="text-muted-foreground mt-1">Talk to your agent, brainstorm ideas, get research back.</p>
          </div>
          {agents.data && agents.data.length > 0 && (
            <Select value={String(agentId ?? "")} onValueChange={v => setSelectedAgentId(Number(v))}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Select agent" /></SelectTrigger>
              <SelectContent>
                {agents.data.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!agentId ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No agent selected</h3>
            <p className="text-sm text-muted-foreground">Register an agent first to start chatting.</p>
          </div>
        ) : (
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={sendMessage.isPending}
            placeholder="Ask your agent anything..."
            height="calc(100vh - 14rem)"
            emptyStateMessage="Start a conversation with your OpenClaw agent"
            suggestedPrompts={[
              "What tasks are you currently working on?",
              "Research the latest AI agent frameworks",
              "Summarize today's activity logs",
              "Help me brainstorm a new project",
            ]}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
