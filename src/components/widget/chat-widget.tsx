"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatWidgetProps {
    orgId: string;
    botName: string;
    botAvatar: string | null;
    companyName: string;
    colors: {
        userMsg: string;
        agentMsg: string;
    };
    welcomeMessage: string;
    removeWatermark: boolean;
}

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function ChatWidget({
    orgId,
    botName,
    botAvatar,
    companyName,
    colors,
    welcomeMessage,
    removeWatermark
}: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Welcome Message
    useEffect(() => {
        if (welcomeMessage && messages.length === 0) {
            setMessages([{ role: "assistant", content: welcomeMessage }]);
        }
    }, [welcomeMessage]);

    // Auto-scroll.
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch("/api/widget/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    orgId: orgId,
                    history: messages // Send previous context
                })
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, tive um problema técnico. Tente novamente." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-md mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-white z-10 shadow-sm relative">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={botAvatar || undefined} />
                            <AvatarFallback>{botName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-900 leading-tight">{botName}</h3>
                        <p className="text-xs text-muted-foreground">{companyName}</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={scrollRef}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex items-start gap-2 max-w-[85%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        {msg.role === "assistant" && (
                            <Avatar className="h-6 w-6 mt-1 border">
                                <AvatarImage src={botAvatar || undefined} />
                                <AvatarFallback className="text-[10px]">{botName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}

                        <div
                            className={cn(
                                "p-3 text-sm shadow-sm",
                                msg.role === "user" ? "rounded-2xl rounded-tr-none" : "rounded-2xl rounded-tl-none"
                            )}
                            style={{
                                backgroundColor: msg.role === "user" ? colors.userMsg : colors.agentMsg,
                                color: msg.role === "user" ? "#fff" : (colors.agentMsg === '#ffffff' ? '#1e293b' : '#fff')
                            }}
                        >
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs ml-2">
                         <Avatar className="h-6 w-6 mt-1 border">
                                <AvatarImage src={botAvatar || undefined} />
                                <AvatarFallback className="text-[10px]">{botName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex space-x-1 p-2 bg-slate-100 rounded-xl rounded-tl-none">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t">
                <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite uma mensagem..."
                        className="bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto py-1 text-sm placeholder:text-muted-foreground"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={cn(
                            "h-8 w-8 rounded-full shrink-0 transition-all",
                            input.trim() ? "opacity-100 scale-100" : "opacity-50 scale-90"
                        )}
                        style={{ backgroundColor: colors.userMsg }}
                    >
                        <Send className="h-4 w-4 text-white" />
                    </Button>
                </div>

                {!removeWatermark && (
                    <div className="mt-2 text-center">
                        <a href="https://procrm.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                            <Sparkles className="h-3 w-3" />
                            Feito com <strong>ProCRM</strong>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
