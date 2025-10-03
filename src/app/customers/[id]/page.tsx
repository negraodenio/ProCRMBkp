import { CustomerDetails } from "@/components/customers/customer-details";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function CustomerDetailsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <CustomerDetails />
        </main>
      </div>
    </div>
  );
}