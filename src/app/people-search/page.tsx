"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Mail, Linkedin, ExternalLink, ShieldCheck, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { searchPeople, convertToLead } from "@/app/actions/people-search-actions";
import { toast } from "sonner";
import { maskPII } from "@/lib/utils";

export default function PeopleSearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [revealedEmails, setRevealedEmails] = useState<string[]>([]);
    const [privacyMode, setPrivacyMode] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    // Load all contacts on mount
    useEffect(() => {
        async function loadAll() {
            const res = await searchPeople("");
            if (res.success) setContacts(res.contacts || []);
            setInitialLoad(false);
        }
        loadAll();
    }, []);

    async function handleSearch() {
        setLoading(true);
        try {
            const res = await searchPeople(searchTerm);
            if (res.success) {
                setContacts(res.contacts || []);
                if (res.contacts?.length === 0) {
                    toast.info("Nenhum contato encontrado com esse critério.");
                }
            } else {
                toast.error(res.error || "Erro na busca");
            }
        } catch {
            toast.error("Erro na comunicação.");
        } finally {
            setLoading(false);
        }
    }

    async function handleConnect(contactId: string) {
        const res = await convertToLead(contactId);
        if (res.success) {
            toast.success("Contato convertido em lead qualificado!");
            // Refresh list
            const refreshRes = await searchPeople(searchTerm);
            if (refreshRes.success) setContacts(refreshRes.contacts || []);
        } else {
            toast.error(res.error || "Erro ao converter");
        }
    }

    const toggleEmail = (email: string) => {
        if (revealedEmails.includes(email)) return;
        setRevealedEmails([...revealedEmails, email]);
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col md:ml-64">
                <Header />
                <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">People Search</h1>
                            <p className="text-muted-foreground italic">
                                Base de decisores corporativos verificados por IA — {contacts.length} encontrados.
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => setPrivacyMode(!privacyMode)}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            {privacyMode ? "LGPD Ativo" : "LGPD Desativado"}
                        </Button>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por cargo, empresa ou expertise (ex: Diretor P&D, Bioinsumos...)" 
                                className="pl-10 h-14 text-lg shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <Button 
                            onClick={handleSearch} 
                            disabled={loading}
                            className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 gap-2"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Buscar
                        </Button>
                    </div>

                    {initialLoad ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {contacts.map((contact) => (
                                <Card key={contact.id} className="overflow-hidden hover:border-indigo-400 transition-colors">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                                                {contact.name?.[0] || "?"}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg">
                                                        {privacyMode ? maskPII(contact.name, "phone") : contact.name}
                                                    </h3>
                                                    {contact.verified && (
                                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                                            <ShieldCheck className="h-3 w-3" />
                                                            Verificado
                                                        </Badge>
                                                    )}
                                                    {contact.status === "qualified" && (
                                                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                                            Lead Qualificado
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {contact.role || "Decisor"} @ <span className="text-indigo-600">{contact.company}</span>
                                                </p>
                                                <div className="flex gap-2">
                                                    {(contact.expertise || []).map((e: string) => (
                                                        <span key={e} className="text-[10px] uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                            {e}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-muted-foreground mb-1">E-mail Corporativo</p>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                    onClick={() => toggleEmail(contact.email)}
                                                >
                                                    {revealedEmails.includes(contact.email) ? (
                                                        <span className="font-mono text-sm">
                                                            {privacyMode ? maskPII(contact.email) : contact.email}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <Mail className="h-3 w-3" />
                                                            Revelar E-mail
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                            <Button size="icon" variant="outline" className="rounded-full">
                                                <Linkedin className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                                                onClick={() => handleConnect(contact.id)}
                                            >
                                                <UserCheck className="h-4 w-4" />
                                                Conectar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!initialLoad && contacts.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed rounded-3xl opacity-50">
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p>Nenhum contato encontrado. Rode o seed para popular a base.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
