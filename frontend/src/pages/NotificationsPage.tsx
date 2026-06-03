import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/PageHeader";
import { unreadNotificationCount, type NotificationItem } from "../components/NotificationPanel";
import { api } from "../lib/api";

/** Renders the full notifications page for the signed-in user. */
export function NotificationsPage() {
  const client = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<NotificationItem[]>("/notifications")
  });

  /** Marks one notification as read and refreshes the list. */
  async function markRead(id: string) {
    await api(`/notifications/${id}/read`, { method: "PATCH" });
    client.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`Updates about inspections and system activity. ${unreadNotificationCount(data)} unread.`}
      />
      <div className="space-y-3">
        {data.map((item) => (
          <article
            className={`rounded-xl border bg-white p-4 ${item.readAt ? "opacity-70" : "border-red-200"}`}
            key={item.id}
          >
            <div className="flex justify-between gap-4">
              <p className="font-semibold">{item.title}</p>
              <time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</time>
            </div>
            <p className="mt-1 text-sm text-slate-500">{item.message}</p>
            {!item.readAt && (
              <button className="mt-3 text-sm font-semibold text-fire" onClick={() => markRead(item.id)} type="button">
                Mark as read
              </button>
            )}
          </article>
        ))}
        {!data.length && (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-400">
            No notifications
          </div>
        )}
      </div>
    </>
  );
}
