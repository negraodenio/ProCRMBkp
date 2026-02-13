"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Trash2, Tag, Plus, CheckCircle2, ArrowLeft, Brain } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendMessageAction, deleteConversationAction, toggleAIAction } from "./actions";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Conversation = {
    id: string;
    contact_phone: string;
    contact_name: string;
    last_message_content: string;
    last_message_at: string;
    unread_count: number;
    status: string;
    ai_enabled: boolean;
};

type Message = {
    id: string;
    content: string;
    direction: "inbound" | "outbound";
    created_at: string;
    status: string;
    sender_name?: string;
};


export default function ChatPage() {
    const [supabase] = useState(() => createClient());
    const { profile, loading: profileLoading } = useProfile();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                console.log("🔍 [Chat] Starting fetchConversations for Org:", profile?.organization_id);
                if (!profile?.organization_id) {
                    console.warn("⚠️ [Chat] No organization_id in profile");
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("conversations")
                    .select("*")
                    .eq("organization_id", profile.organization_id)
                    .order("last_message_at", { ascending: false });

                if (error) {
                    console.error("❌ [Chat] Error fetching conversations:", error);
                    toast.error("Erro ao carregar conversas: " + error.message);
                } else {
                    console.log(`✅ [Chat] Fetched ${data?.length || 0} conversations`);
                    setConversations(data || []);
                }
            } catch (err) {
                console.error("❌ [Chat] Exception in fetchConversations:", err);
            } finally {
                setLoading(false);
            }
        };

        if (!profileLoading && profile?.organization_id) {
            fetchConversations();

            // 2. Realtime Conversations
            const channel = supabase
                .channel(`conversations_${profile.organization_id}`)
                .on("postgres_changes" as any, {
                    event: "*",
                    table: "conversations",
                    filter: `organization_id=eq.${profile.organization_id}`
                }, (payload: any) => {
                    console.log("🔄 Realtime Conversation Change:", payload.eventType, payload.new?.id);
                    if (payload.eventType === "INSERT") {
                        setConversations(prev => [payload.new as Conversation, ...prev]);
                    } else if (payload.eventType === "UPDATE") {
                        setConversations(prev => {
                            const updated = prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c);
                            return [...updated].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
                        });
                    } else if (payload.eventType === "DELETE") {
                        setConversations(prev => prev.filter(c => c.id !== payload.old.id));
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [supabase, profileLoading, profile?.organization_id]);



    // 3. Fetch Messages when selection changes
    useEffect(() => {
        if (!selectedId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", selectedId)
                .order("created_at", { ascending: true });

            if (data) setMessages(data as Message[]);
        };

        fetchMessages();

        // 4. Realtime Messages
        const channel = supabase
            .channel(`messages_${selectedId}`)
            .on("postgres_changes" as any, {
                event: "*", // Listen to all events including updates and deletes
                table: "messages",
                filter: `conversation_id=eq.${selectedId}`
            }, (payload: any) => {
                if (payload.eventType === "INSERT") {
                    setMessages(prev => {
                        // Avoid duplicates if optimistic update already added it
                        if (prev.find(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new as Message];
                    });
                } else if (payload.eventType === "UPDATE") {
                    setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
                }
            })
            .subscribe();

        // 5. Mark as Read logic
        const markAsRead = async () => {
            const { error } = await supabase
                .from("conversations")
                .update({ unread_count: 0 })
                .eq("id", selectedId);

            if (error) console.error("Error marking as read:", error);
        };
        markAsRead();


        return () => { supabase.removeChannel(channel); };
    }, [selectedId, supabase]);

    // Scroll to bottom
    // 4. Polling Fallback (5s) for Redundancy
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("⏱️ Polling for updates...");
            loadConversations();
            if (selectedId) loadMessages(selectedId);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedId, profile?.organization_id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-select first conversation
    useEffect(() => {
        if (!selectedId && conversations.length > 0) {
            setSelectedId(conversations[0].id);
        }
    }, [conversations, selectedId]);

    const handleSend = async () => {
        if (!selectedId || !inputText.trim() || sending) return;

        const text = inputText;
        const tempId = 'temp-' + Date.now();

        try {
            setSending(true);
            setInputText("");

            // 1. Optimistic Update
            const optimisticMsg: Message = {
                id: tempId,
                content: text,
                direction: "outbound",
                created_at: new Date().toISOString(),
                status: "sending",
                sender_name: profile?.full_name || "Você"
            };

            setMessages(prev => [...prev, optimisticMsg]);

            console.log("📤 UI: Sending message (Optimistic)...", { selectedId, textLength: text.length });

            const result = await sendMessageAction(selectedId, text);
            console.log("📥 UI: Action result:", result);

            if (result && result.error) {
                toast.error(result.error);
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== tempId));
                setInputText(text); // Restore text
                return;
            }

            // Update the optimistic message with the real one
            if (result && result.id) {
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: result.id, status: 'sent' } : m));
            }
        } catch (error: any) {
            console.error("❌ UI: Unexpected error sending:", error);
            toast.error("Erro inesperado: " + (error.message || "Erro desconhecido"));
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setInputText(text);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation(); // Prevent selecting the chat when clicking delete

        if (!confirm("Tem certeza que deseja excluir esta conversa? Todas as mensagens serão perdidas.")) {
            return;
        }

        try {
            // Optimistic update
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            if (selectedId === conversationId) {
                setSelectedId(null);
            }

            const result = await deleteConversationAction(conversationId);

            if (result.error) {
                toast.error(result.error);
                // Re-fetch or revert if possible, but for now just show error
                // In a real app we might want to revert the optimistic update
            } else {
                toast.success("Conversa excluída com sucesso");
            }
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("Erro ao excluir conversa");
        }
    };

    const handleToggleAI = async (conversationId: string, enabled: boolean) => {
        try {
            // Optimistic update
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, ai_enabled: enabled } : c));

            const result = await toggleAIAction(conversationId, enabled);
            if (result.error) {
                toast.error("Erro ao configurar IA: talvez a coluna ai_enabled precise ser criada no banco.");
                // Revert
                setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, ai_enabled: !enabled } : c));
            } else {
                toast.success(`IA ${enabled ? 'ativada' : 'desativada'} para esta conversa`);
            }
        } catch (error) {
            toast.error("Erro ao configurar IA");
        }
    };

    const selectedChat = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">

            <Sidebar />

            <div className="flex flex-1 flex-col md:ml-64 relative overflow-hidden">
                <Header />

                <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 md:p-4 gap-2 md:gap-4 md:relative">
                    {/* Chat Sidebar / List */}
                    <div className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col gap-4 h-full`}>
                        <div className="flex flex-col gap-2">
                            <h2 className="font-bold text-xl text-foreground px-2">Conversas Ativas</h2>
                        </div>

                        <ScrollArea className="flex-1 rounded-3xl bg-card shadow-sm border border-border">
                            {/* ... Content ... */}
                            {loading || profileLoading ? (
                                <div className="p-3 space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 animate-pulse">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-muted h-10 w-10 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-muted rounded-full w-24" />
                                                    <div className="h-2 bg-muted/50 rounded-full w-full" />
                                                    <div className="h-2 bg-muted/50 rounded-full w-2/3" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-12 text-center space-y-4">
                                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                        <MessageSquare className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">Nenhuma conversa encontrada. Aguardando mensagens...</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {conversations.map(chat => (
                                        <div
                                            key={chat.id}
                                            onClick={() => setSelectedId(chat.id)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                                selectedId === chat.id
                                                    ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/20 conversation-active'
                                                    : 'bg-card border-transparent hover:bg-muted/50 hover:border-border'
                                            }`}
                                        >

                                            <div className="flex items-start gap-3">
                                                <div className="bg-muted p-2 rounded-xl text-primary">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="font-bold text-foreground truncate block">
                                                            {chat.contact_name || "Contato Novo"}
                                                        </span>
                                                        {chat.unread_count > 0 && (
                                                            <Badge variant="default" className="bg-primary h-5 px-1.5 min-w-[20px] justify-center text-[10px]">
                                                                {chat.unread_count}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-primary font-medium mb-1">
                                                        {chat.contact_phone}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-1 italic mb-1">
                                                        {chat.last_message_content || "..."}
                                                    </p>
                                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Há {formatDistanceToNow(new Date(chat.last_message_at), { locale: ptBR })}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleDelete(e, chat.id)}
                                                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Excluir conversa"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className={`${!selectedId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-card rounded-3xl shadow-sm border border-border overflow-hidden relative h-full`}>
                        {selectedId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 md:p-6 border-b flex items-start justify-between bg-card z-10 relative shadow-sm">
                                    <div className="flex items-center gap-3 md:gap-4">
                                         {/* Mobile Back Button */}
                                         <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden -ml-2 h-8 w-8"
                                            onClick={() => setSelectedId(null)}
                                         >
                                            <ArrowLeft className="h-5 w-5" />
                                         </Button>

                                        <div className="bg-muted p-2 md:p-3 rounded-2xl">
                                            <User className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 md:gap-3 mb-1">
                                                <h3 className="font-bold text-lg md:text-xl text-foreground line-clamp-1">
                                                    {selectedChat?.contact_name || "Contato Novo"}
                                                </h3>
                                                <Badge variant="outline" className="text-primary bg-primary/5 border-primary/20 text-[10px] font-bold hidden sm:inline-flex">
                                                    {selectedChat?.contact_phone}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Tag className="h-3 w-3 md:h-4 md:w-4" />
                                                    <span className="font-medium text-xs md:text-sm">Etiquetas:</span>
                                                    <button className="flex items-center gap-1 text-primary hover:underline text-xs md:text-sm">
                                                        <Plus className="h-3 w-3" /> <span className="hidden sm:inline">Adicionar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Toggle */}
                                    <div className="flex flex-col items-center gap-2 px-4 py-2 bg-muted/30 rounded-2xl border border-border/50">
                                        <div className="flex items-center gap-2">
                                            {selectedChat?.ai_enabled ? (
                                                <Brain className="h-4 w-4 text-emerald-500 animate-pulse" />
                                            ) : (
                                                <Brain className="h-4 w-4 text-muted-foreground opacity-50" />
                                            )}
                                            <Label htmlFor="ai-toggle" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                IA Status
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-medium ${!selectedChat?.ai_enabled ? 'text-primary' : 'text-muted-foreground'}`}>OFF</span>
                                            <Switch
                                                id="ai-toggle"
                                                checked={selectedChat?.ai_enabled ?? true}
                                                onCheckedChange={(checked) => handleToggleAI(selectedChat!.id, checked)}
                                                className="scale-75 data-[state=checked]:bg-emerald-500"
                                            />
                                            <span className={`text-[10px] font-medium ${selectedChat?.ai_enabled ? 'text-emerald-500' : 'text-muted-foreground'}`}>ON</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 relative overflow-hidden bg-muted/10">
                                    <ScrollArea className="h-full p-4 md:p-6">
                                        <div className="space-y-6 pb-6">
                                            {messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[11px] font-bold text-foreground">
                                                            {msg.direction === 'outbound' ? (msg.sender_name || 'Você') : (selectedChat?.contact_name || 'Cliente')}
                                                        </span>

                                                        <span className="text-[10px] text-muted-foreground">
                                                            {format(new Date(msg.created_at), "HH:mm")}
                                                        </span>
                                                    </div>
                                                    <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border ${
                                                        msg.direction === 'outbound'
                                                            ? 'bg-primary/10 text-foreground border-primary/20 rounded-tr-none'
                                                            : 'bg-background text-foreground border-border rounded-tl-none'
                                                    }`}>
                                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                </div>

                                {/* Message Input Area */}
                                <div className="p-3 md:p-6 border-t bg-card">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2 md:gap-4 items-end">
                                            <div className="flex-1 bg-muted/30 rounded-2xl border border-border px-4 py-2 flex items-center">
                                                <textarea
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none min-h-[44px] max-h-32 text-foreground"
                                                    placeholder="Digite sua mensagem..."
                                                    value={inputText}
                                                    onChange={(e) => setInputText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSend();
                                                        }
                                                    }}
                                                    disabled={sending}
                                                    rows={1}
                                                />
                                            </div>
                                            <Button
                                                onClick={handleSend}
                                                disabled={sending || !inputText.trim()}
                                                className="h-[50px] w-[50px] md:h-[60px] md:w-[60px] rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                                            >
                                                <Send className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-medium ml-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            Conectado via Evolution API
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/5">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare className="h-10 w-10 text-primary" />
                                </div>
                                <div className="max-w-md space-y-4">
                                    <h2 className="text-2xl font-bold text-foreground">Conversas WhatsApp</h2>
                                    <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r-xl text-sm">
                                        "A comunicação eficiente é o segredo de um CRM de sucesso."
                                    </p>
                                    <p className="text-sm text-muted-foreground pt-6">
                                        Selecione uma conversa ao lado para começar ou aguarde novas mensagens dos seus clientes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}
