'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles } from 'lucide-react';
import { DocumentsTab } from './documents-tab';
import { PersonalityTab } from './personality-tab';

interface KnowledgeContentProps {
  documents: Array<{
    id: string;
    filename: string;
    created_at: string;
    count: number;
  }>;
  chunks: any[];
  botSettings: any;
  organizationId: string;
}

export function KnowledgeContent({ documents, chunks, botSettings, organizationId }: KnowledgeContentProps) {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="glass-card p-1">
        <TabsTrigger
          value="documents"
          className="data-[state=active]:gradient-primary data-[state=active]:text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          📚 Documentos
        </TabsTrigger>
        <TabsTrigger
          value="personality"
          className="data-[state=active]:gradient-primary data-[state=active]:text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          🎭 Personalidade
        </TabsTrigger>
      </TabsList>

      <TabsContent value="documents" className="space-y-6 animate-fade-in">
        <DocumentsTab documents={documents} chunksCount={chunks.length} />
      </TabsContent>

      <TabsContent value="personality" className="space-y-6 animate-fade-in">
        <PersonalityTab botSettings={botSettings} organizationId={organizationId} />
      </TabsContent>
    </Tabs>
  );
}
