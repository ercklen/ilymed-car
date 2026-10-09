'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import AdminNotificationBell, { NotificationData } from './AdminNotificationBell';

interface Props {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  staffPermissions?: string;
  notificationData?: NotificationData;
}

const ALL_NAV_ITEMS = [
  { key: 'dashboard', icon: '📊', labelFr: 'Dashboard', labelAr: 'لوحة التحكم', href: '/fr/admin' },
  { key: 'vehicles', icon: '🚗', labelFr: 'Véhicules', labelAr: 'السيارات', href: '/fr/admin/vehicles' },
  { key: 'vehicles_new', icon: '➕', labelFr: 'Ajouter un véhicule', labelAr: 'إضافة سيارة', href: '/fr/admin/vehicles/new' },
  { key: 'bookings', icon: '📅', labelFr: 'Réservations', labelAr: 'الحجوزات', href: '/fr/admin/bookings' },
  { key: 'calendar', icon: '🗓️', labelFr: 'Calendrier', labelAr: 'التقويم', href: '/fr/admin/calendar' },
  { key: 'customers', icon: '👥', labelFr: 'Clients', labelAr: 'العملاء', href: '/fr/admin/customers' },
  { key: 'staff', icon: '🛡️', labelFr: 'Équipe & Rôles', labelAr: 'فريق العمل والصلاحيات', href: '/fr/admin/staff' },
  { key: 'payments', icon: '💳', labelFr: 'Paiements', labelAr: 'المدفوعats', href: '/fr/admin/payments' },
  { key: 'revenue', icon: '📈', labelFr: 'Revenus', labelAr: 'الإيرادات', href: '/fr/admin/revenue' },
  { key: 'reviews', icon: '⭐', labelFr: 'Avis', labelAr: 'التقييمات', href: '/fr/admin/reviews' },
  { key: 'messages', icon: '✉️', labelFr: 'Messages', labelAr: 'الرسائل', href: '/fr/admin/messages' },
  { key: 'settings', icon: '⚙️', labelFr: 'Paramètres', labelAr: 'الإعدادات', href: '/fr/admin/settings' },
];

export default function AdminLayoutClient({
  children,
  userRole = 'ADMIN',
  userName = 'Admin',
  userEmail = 'admin@ilymedcar.com',
  staffPermissions = '',
  notificationData,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const perms = staffPermissions ? staffPermissions.split(',').map(p => p.trim()) : [];

  // Filter navigation items based on role & permissions
  const navItems = ALL_NAV_ITEMS.filter(item => {
    if (userRole === 'ADMIN') return true;
    if (item.key === 'dashboard') return true;
    if (item.key === 'staff' || item.key === 'settings') return false; // Reserved for full ADMIN
    if (item.key === 'vehicles_new') return perms.includes('vehicles');
    return perms.includes(item.key);
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${collapsed ? 'w-16' : 'w-64'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative z-30 h-full bg-[#111827] text-white flex flex-col transition-all duration-300
        `}
      >
        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-700`}>
          {!collapsed && (
            <div dir="ltr" className="text-left">
              <span className="text-xl font-bold text-[#D4A72C]">ILYMED</span>
              <span className="text-xl font-bold ml-1">CAR</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">Administration</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${userRole === 'ADMIN' ? 'bg-[#D4A72C] text-black' : 'bg-blue-600 text-white'}`}>
                  {userRole}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white p-1 rounded hidden lg:block"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const messageBadge = item.key === 'messages' && notificationData && notificationData.unreadMessagesCount > 0 ? notificationData.unreadMessagesCount : 0;
            const bookingBadge = item.key === 'bookings' && notificationData && (notificationData.expiringBookingsCount > 0 || notificationData.pendingBookingsCount > 0) ? (notificationData.expiringBookingsCount + notificationData.pendingBookingsCount) : 0;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 text-sm transition-colors relative
                  ${isActive ? 'bg-[#D4A72C]/20 text-[#D4A72C] border-r-2 border-[#D4A72C]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.labelFr : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.labelFr}</span>}
                </div>
                {!collapsed && (
                  <>
                    {messageBadge > 0 && (
                      <span className="bg-[#D4A72C] text-[#111827] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {messageBadge}
                      </span>
                    )}
                    {bookingBadge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                        {bookingBadge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && (messageBadge > 0 || bookingBadge > 0) && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className={`p-4 border-t border-gray-700 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
            </div>
          )}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className={`text-xs text-red-400 hover:text-red-300 flex items-center gap-1 w-full ${collapsed ? 'justify-center' : ''}`}
            >
              <span>🚪</span>
              {!collapsed && 'Déconnexion'}
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-6 py-3.5 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-[#111827]">
              {userRole === 'ADMIN' ? 'Panneau Administrateur' : 'Espace Collaborateur (Staff)'}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell with Dropdown */}
            {notificationData && (
              <AdminNotificationBell initialData={notificationData} />
            )}

            <Link href="/fr" target="_blank" className="text-xs font-medium text-gray-500 hover:text-[#D4A72C] transition-colors border border-gray-200 px-3 py-1.5 rounded-xl hover:border-[#D4A72C]">
              ↗ Voir le site
            </Link>
            <div className="w-9 h-9 bg-[#D4A72C] rounded-full flex items-center justify-center text-[#111827] font-bold text-sm shadow">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
