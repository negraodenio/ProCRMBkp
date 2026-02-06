"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Trash2, Tag, Plus, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendMessageAction } from "./actions";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Conversation = {
    id: string;
    contact_phone: string;
    contact_name: string;
    last_message_content: string;
    last_message_at: string;
    unread_count: number;
    status: string;
};

type Message = {
    id: string;
    content: string;
    direction: "inbound" | "outbound";
    created_at: string;
    status: string;
};

export default function ChatPage() {
    const supabase = createClient();
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
            if (!profile?.organization_id) {
                setLoading(false);
                return;
            }
            
            const { data, error } = await supabase
                .from("conversations")
                .select("*")
                .eq("organization_id", profile.organization_id)
                .order("last_message_at", { ascending: false });

            if (data) setConversations(data);
            setLoading(false);
        };

        if (!profileLoading) fetchConversations();

        // 2. Realtime Conversations
        const channel = supabase
            .channel("conversations_changes")
            .on("postgres_changes" as any, { 
                event: "*", 
                table: "conversations",
                filter: profile?.organization_id ? `organization_id=eq.${profile.organization_id}` : undefined
            }, (payload: any) => {
                if (payload.eventType === "INSERT") {
                    setConversations(prev => [payload.new as Conversation, ...prev]);
                } else if (payload.eventType === "UPDATE") {
                    setConversations(prev => {
                        const updated = prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c);
                        return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
                    });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

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
                event: "INSERT", 
                table: "messages", 
                filter: `conversation_id=eq.${selectedId}` 
            }, (payload: any) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedId, supabase]);

    // Scroll to bottom
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
                status: "sending"
            };
            setMessages(prev => [...prev, optimisticMsg]);
            
            console.log("📤 UI: Sending message (Optimistic)...", { selectedId, textLength: text.length });
            
            const result = await sendMessageAction(selectedId, text);
            console.log("📥 UI: Action result:", result);

            if (result && result.error) {
                toast.error("Erro: " + result.error);
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

    const selectedChat = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            <Sidebar />
            
            <div className="flex flex-1 flex-col md:ml-64 relative overflow-hidden">
                <Header />
                
                <main className="flex-1 flex overflow-hidden p-4 gap-4">
                    {/* Chat Sidebar */}
                    <div className="w-96 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-bold text-xl text-slate-800">Conversas Ativas</h2>
                        </div>
                        
                        <ScrollArea className="flex-1 rounded-3xl bg-white shadow-sm border border-slate-100">
                            {loading || profileLoading ? (
                                <div className="p-3 space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white border border-slate-50 animate-pulse">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-slate-100 h-10 w-10 rounded-xl" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 bg-slate-100 rounded-full w-24" />
                                                    <div className="h-2 bg-slate-50 rounded-full w-full" />
                                                    <div className="h-2 bg-slate-50 rounded-full w-2/3" />
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
                                                    ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-200' 
                                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="bg-slate-100 p-2 rounded-xl text-blue-500">
                                                    <MessageSquare className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="font-bold text-slate-800 truncate block">
                                                            {chat.contact_name || "Contato Novo"}
                                                        </span>
                                                        {chat.unread_count > 0 && (
                                                            <Badge variant="default" className="bg-blue-600 h-5 px-1.5 min-w-[20px] justify-center text-[10px]">
                                                                {chat.unread_count}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-blue-500 font-medium mb-1">
                                                        {chat.contact_phone}
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-1 italic mb-1">
                                                        {chat.last_message_content || "..."}
                                                    </p>
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Há {formatDistanceToNow(new Date(chat.last_message_at), { locale: ptBR })}
                                                    </div>
                                                </div>
                                                <button className="p-1 text-slate-300 hover:text-red-500 transition-colors">
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
                    <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                        {selectedId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-6 border-b flex items-start justify-between bg-white">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-slate-50 p-3 rounded-2xl">
                                            <User className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-slate-800">
                                                    {selectedChat?.contact_name || "Contato Novo"}
                                                </h3>
                                                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100 text-[10px] font-bold">
                                                    {selectedChat?.contact_phone}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Tag className="h-4 w-4" />
                                                    <span className="font-medium">Etiquetas:</span>
                                                    <button className="flex items-center gap-1 text-blue-600 hover:underline">
                                                        <Plus className="h-3 w-3" /> Adicionar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 relative overflow-hidden bg-slate-50/30">
                                    <ScrollArea className="h-full p-6">
                                        <div className="space-y-6 pb-6">
                                            {messages.map((msg) => (
                                                <div 
                                                    key={msg.id}
                                                    className={`flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[11px] font-bold text-slate-800">
                                                            {msg.direction === 'outbound' ? 'Você' : (selectedChat?.contact_name || 'Cliente')}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {format(new Date(msg.created_at), "HH:mm")}
                                                        </span>
                                                    </div>
                                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border ${
                                                        msg.direction === 'outbound' 
                                                            ? 'bg-[#eff6ff] text-slate-700 border-blue-100 rounded-tr-none' 
                                                            : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
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
                                <div className="p-6 border-t bg-white">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-2 flex items-center">
                                                <textarea
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none min-h-[44px] max-h-32"
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
                                                className="h-[60px] w-[60px] rounded-2xl bg-emerald-400 hover:bg-emerald-500 shadow-lg shadow-emerald-200/50"
                                            >
                                                <Send className="h-6 w-6 text-white" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            Conectado via Evolution API
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50/20">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare className="h-10 w-10 text-blue-500" />
                                </div>
                                <div className="max-w-md space-y-4">
                                    <h2 className="text-2xl font-bold text-slate-800">Conversas WhatsApp</h2>
                                    <p className="text-slate-500 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-2 bg-blue-50/50 rounded-r-xl text-sm">
                                        "A comunicação eficiente é o segredo de um CRM de sucesso."
                                    </p>
                                    <p className="text-sm text-slate-400 pt-6">
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
