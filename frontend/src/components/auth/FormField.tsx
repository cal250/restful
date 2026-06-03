/** Renders a labeled form field with optional validation error text. */
export function FormField({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return <label className="block text-sm font-medium text-slate-700">{label}{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
