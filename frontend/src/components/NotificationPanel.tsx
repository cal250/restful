import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, X } from "lucide-react";
import { api } from "../lib/api";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
};

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
};

/** Renders a right-side drawer with the signed-in user's notifications. */
export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const client = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<NotificationItem[]>("/notifications"),
    enabled: open
  });

  /** Marks one notification as read and refreshes the unread count. */
  async function markRead(id: string) {
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" });
      client.invalidateQueries({ queryKey: ["notifications"] });
    } catch {
      // Keep the panel usable even if one mark-read request fails.
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close notifications"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        type="button"
      />

      <aside className="relative flex h-full w-full max-w-md flex-col border-l bg-white shadow-2xl md:w-1/2 md:max-w-none">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Bell className="text-fire" size={20} />
            <h2 className="text-lg font-bold text-nav">Notifications</h2>
          </div>
          <button
            aria-label="Close panel"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading notifications...</p>
          ) : data.length ? (
            <div className="space-y-3">
              {data.map((item) => (
                <button
                  className={`w-full rounded-xl border bg-white p-4 text-left transition hover:border-red-200 ${
                    item.readAt ? "opacity-70" : "border-red-200 bg-red-50/40"
                  }`}
                  key={item.id}
                  onClick={() => !item.readAt && markRead(item.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold text-nav">{item.title}</p>
                    <time className="shrink-0 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                  {!item.readAt && (
                    <p className="mt-2 text-xs font-medium text-fire">Tap to mark as read</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-slate-50 p-8 text-center text-sm text-slate-400">
              No notifications yet
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

/** Returns the number of unread notifications in a list. */
export function unreadNotificationCount(items: NotificationItem[]) {
  return items.filter((item) => !item.readAt).length;
}
