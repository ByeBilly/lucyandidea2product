import Navbar from "@/components/navbar";

/**
 * Shops Layout
 * Shared layout for all "shop" pages (Lucy and future creative studios)
 */
export default function ShopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f0f11]">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}





