/**
 * Admin layout: no global auth check here; each page/route handles auth.
 * This layout only wraps admin UI.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      {children}
    </div>
  );
}
