import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../components/PageHeader";
import { api } from "../lib/api";

type Notification = { id: string; title: string; message: string; readAt?: string; createdAt: string };

/** Renders the system notifications feed for the signed-in user. */
export function NotificationsPage() {
  const { data = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => api<Notification[]>("/notifications") });
  return <><PageHeader title="Notifications" description="Updates about inspections and system activity." /><div className="space-y-3">{data.map((item) => <article className={`rounded-xl border bg-white p-4 ${item.readAt ? "opacity-70" : "border-red-200"}`} key={item.id}><div className="flex justify-between gap-4"><p className="font-semibold">{item.title}</p><time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</time></div><p className="mt-1 text-sm text-slate-500">{item.message}</p></article>)}{!data.length && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-400">No notifications</div>}</div></>;
}
