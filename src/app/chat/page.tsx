"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, User, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendMessageAction } from "./actions";
import { toast } from "sonner";

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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations
    useEffect(() => {
        const fetchConversations = async () => {
            const { data, error } = await supabase
                .from("conversations")
                .select("*")
                .order("last_message_at", { ascending: false });

            if (data) setConversations(data);
            setLoading(false);
        };

        fetchConversations();

        // 2. Realtime Conversations
        const channel = supabase
            .channel("conversations_changes")
            .on("postgres_changes", { event: "*", table: "conversations" }, (payload) => {
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
            .on("postgres_changes", { 
                event: "INSERT", 
                table: "messages", 
                filter: `conversation_id=eq.${selectedId}` 
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [selectedId, supabase]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!selectedId || !inputText.trim() || sending) return;

        try {
            setSending(true);
            const text = inputText;
            setInputText("");
            await sendMessageAction(selectedId, text);
        } catch (error: any) {
            toast.error("Erro ao enviar: " + error.message);
        } finally {
            setSending(false);
        }
    };

    const selectedChat = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            
            <div className="flex flex-1 flex-col md:ml-64 relative overflow-hidden">
                <Header />
                
                <main className="flex-1 flex overflow-hidden">
                    {/* Chat Sidebar */}
                    <div className="w-80 border-r flex flex-col bg-muted/20">
                        <div className="p-4 border-b bg-background">
                            <h2 className="font-semibold text-lg">Conversas</h2>
                        </div>
                        <ScrollArea className="flex-1">
                            {loading ? (
                                <div className="p-4 text-center text-muted-foreground">Carregando...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-8 text-center space-y-2">
                                    <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">Nenhuma conversa encontrada.</p>
                                </div>
                            ) : (
                                conversations.map(chat => (
                                    <div 
                                        key={chat.id}
                                        onClick={() => setSelectedId(chat.id)}
                                        className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${selectedId === chat.id ? 'bg-primary/10 border-r-4 border-r-primary' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium truncate">{chat.contact_name || chat.contact_phone}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {format(new Date(chat.last_message_at), "HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {chat.last_message_content || "Inicie uma conversa..."}
                                        </p>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </div>

                    {/* Chat Window */}
                    <div className="flex-1 flex flex-col bg-background relative">
                        {selectedId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-medium leading-none">{selectedChat?.contact_name || selectedChat?.contact_phone}</h3>
                                            <span className="text-xs text-green-500 flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                                    <div className="space-y-4 pb-4">
                                        {messages.map((msg) => (
                                            <div 
                                                key={msg.id}
                                                className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] rounded-2xl p-3 text-sm shadow-sm ${
                                                    msg.direction === 'outbound' 
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                        : 'bg-muted rounded-tl-none'
                                                }`}>
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    <div className={`text-[10px] mt-1 opacity-70 ${msg.direction === 'outbound' ? 'text-right' : ''}`}>
                                                        {format(new Date(msg.created_at), "HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Input */}
                                <div className="p-4 border-t bg-background">
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Digite sua mensagem..." 
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            disabled={sending}
                                            className="focus-visible:ring-primary"
                                        />
                                        <Button onClick={handleSend} disabled={sending || !inputText.trim()} size="icon">
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                    <MessageSquare className="h-16 w-16 text-primary relative" />
                                </div>
                                <div className="max-w-md space-y-2">
                                    <h2 className="text-xl font-semibold">Suas Mensagens</h2>
                                    <p className="text-muted-foreground italic">
                                        "A comunicação eficiente é o segredo de um CRM de sucesso."
                                    </p>
                                    <p className="text-sm text-muted-foreground pt-4">
                                        Selecione uma conversa ao lado para começar ou envie uma mensagem do seu WhatsApp para testar a integração.
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
