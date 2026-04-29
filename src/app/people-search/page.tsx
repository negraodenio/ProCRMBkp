"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Mail, Linkedin, ExternalLink, ShieldCheck, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MOCK_CONTACTS = [
    {
        name: "Dr. Ricardo Almeida",
        role: "Diretor de Inovação e P&D",
        company: "Natura &Co",
        expertise: ["Biotecnologia", "Sustentabilidade"],
        email: "r.almeida@natura.net",
        linkedIn: "linkedin.com/in/ralmeida",
        verified: true
    },
    {
        name: "Eng. Cláudia Souza",
        role: "VP de Novos Negócios",
        company: "Embraer X",
        expertise: ["Mobilidade Aérea", "Materiais Compostos"],
        email: "claudia.souza@embraer.com.br",
        linkedIn: "linkedin.com/in/csouza",
        verified: true
    },
    {
        name: "Marcos Pontes Jr.",
        role: "Head de Open Innovation",
        company: "Vale S.A.",
        expertise: ["Descarbonização", "Automação"],
        email: "marcos.pontes@vale.com",
        linkedIn: "linkedin.com/in/mpontes",
        verified: true
    }
];

export default function PeopleSearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [revealedEmails, setRevealedEmails] = useState<string[]>([]);

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
                            <p className="text-muted-foreground italic">Base de 710.000+ decisores corporativos verificados por IA.</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros Avançados
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por cargo, empresa ou expertise (ex: Diretor P&D, Bioinsumos...)" 
                            className="pl-10 h-14 text-lg shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {MOCK_CONTACTS.map((contact, idx) => (
                            <Card key={idx} className="overflow-hidden hover:border-indigo-400 transition-colors">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                                            {contact.name[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{contact.name}</h3>
                                                {contact.verified && (
                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        Verificado
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium">{contact.role} @ <span className="text-indigo-600">{contact.company}</span></p>
                                            <div className="flex gap-2">
                                                {contact.expertise.map(e => (
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
                                                    <span className="font-mono text-sm">{contact.email}</span>
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
                                        <Button size="icon" variant="outline" className="rounded-full">
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                                            <UserCheck className="h-4 w-4" />
                                            Conectar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
