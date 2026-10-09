'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface NotificationData {
  unreadMessagesCount: number;
  pendingBookingsCount: number;
  expiringBookingsCount: number;
  expiringBookings: Array<{
    id: string;
    bookingNumber: string;
    customerName: string;
    customerPhone: string | null;
    vehicleName: string;
    registration: string;
    returnDate: string;
    diffHours: number;
    isOverdue: boolean;
  }>;
  latestMessages: Array<{
    id: string;
    name: string;
    subject: string;
    message: string;
    createdAt: string;
  }>;
}

export default function AdminNotificationBell({
  initialData,
}: {
  initialData: NotificationData;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData>(initialData);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalNotifications =
    data.unreadMessagesCount +
    data.pendingBookingsCount +
    data.expiringBookingsCount;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
        title="Notifications"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {totalNotifications > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-[10px] font-bold text-white items-center justify-center">
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 z-50 text-gray-800 animate-fade-in">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#111827]">Centre de Notifications</span>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalNotifications}
              </span>
            </div>
            <button
              onClick={() => {
                router.refresh();
              }}
              className="text-[11px] text-gray-400 hover:text-[#D4A72C]"
            >
              🔄 Actualiser
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 px-2">
            {/* 1. Return Limit / Due Bookings Alert */}
            {data.expiringBookings.length > 0 && (
              <div className="py-2.5 px-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    Véhicules en fin de contrat ({data.expiringBookingsCount})
                  </span>
                  <Link
                    href="/fr/admin/bookings"
                    onClick={() => setOpen(false)}
                    className="text-[10px] text-amber-700 font-bold hover:underline"
                  >
                    Voir tout →
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {data.expiringBookings.map((b) => (
                    <Link
                      key={b.id}
                      href="/fr/admin/bookings"
                      onClick={() => setOpen(false)}
                      className={`block p-2.5 rounded-xl border text-xs transition ${
                        b.isOverdue
                          ? 'bg-red-50/80 border-red-200 hover:bg-red-100/70'
                          : 'bg-amber-50/60 border-amber-200/60 hover:bg-amber-100/60'
                      }`}
                    >
                      <div className="flex items-start justify-between font-bold">
                        <span className="text-gray-900">
                          {b.vehicleName}{' '}
                          <span className="text-gray-400 font-normal">({b.registration})</span>
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            b.isOverdue
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {b.isOverdue
                            ? `Dépassé de ${Math.abs(b.diffHours)}h`
                            : `Rendu dans ~${b.diffHours}h`}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1">
                        👤 {b.customerName} {b.customerPhone ? `• 📞 ${b.customerPhone}` : ''}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                        Date limite: {new Date(b.returnDate).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Unread Messages Alert */}
            {data.unreadMessagesCount > 0 && (
              <div className="py-2.5 px-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Messages de contact ({data.unreadMessagesCount})
                  </span>
                  <Link
                    href="/fr/admin/messages"
                    onClick={() => setOpen(false)}
                    className="text-[10px] text-blue-700 font-bold hover:underline"
                  >
                    Boîte de réception →
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {data.latestMessages.map((m) => (
                    <Link
                      key={m.id}
                      href="/fr/admin/messages"
                      onClick={() => setOpen(false)}
                      className="block p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-100/50 transition text-xs"
                    >
                      <div className="flex justify-between items-center font-bold text-gray-900 mb-0.5">
                        <span className="truncate pr-2">{m.name}</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {new Date(m.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 font-medium truncate">
                        {m.subject}
                      </p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {m.message}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Pending Bookings Alert */}
            {data.pendingBookingsCount > 0 && (
              <div className="py-2.5 px-3">
                <Link
                  href="/fr/admin/bookings?status=PENDING"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-yellow-50 border border-yellow-200 hover:bg-yellow-100/70 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⏳</span>
                    <div>
                      <p className="text-xs font-bold text-yellow-900">
                        {data.pendingBookingsCount} réservation(s) en attente
                      </p>
                      <p className="text-[11px] text-yellow-700">
                        Des clients attendent votre validation.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-900">Examiner →</span>
                </Link>
              </div>
            )}

            {totalNotifications === 0 && (
              <div className="py-10 text-center text-gray-400 text-xs">
                <span className="text-3xl block mb-2">🎉</span>
                Tout est à jour ! Aucune notification urgente.
              </div>
            )}
          </div>

          <div className="px-5 pt-3 border-t border-gray-100 flex justify-between items-center text-[11px]">
            <Link
              href="/fr/admin/bookings"
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              📅 Gérer réservations
            </Link>
            <Link
              href="/fr/admin/messages"
              onClick={() => setOpen(false)}
              className="text-[#D4A72C] hover:underline font-bold"
            >
              ✉️ Ouvrir les messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
