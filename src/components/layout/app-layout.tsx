import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:pl-[240px]">
        <Navbar />
        <main className="p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
