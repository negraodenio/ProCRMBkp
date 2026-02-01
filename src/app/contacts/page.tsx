import { ContactList } from "@/components/contacts/contact-list";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function ContactsPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('name', { ascending: true });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64">
        <Header />
        <main className="flex-1 p-6">
          <ContactList contacts={contacts || []} />
        </main>
      </div>
    </div>
  );
}