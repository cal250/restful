/** Renders a modal overlay with a titled form or content area. */
export function ModalForm({ title, children, onClose }: {
  title: string; children: React.ReactNode; onClose(): void;
}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-nav">{title}</h2><button className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100" onClick={onClose}>Close</button></div>{children}</section></div>;
}
