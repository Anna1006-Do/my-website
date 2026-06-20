'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    supabase
      .from('contacts')
      .select('id', { count: 'exact' })
      .eq('status', 'new_lead')
      .then(({ count }) => setNewCount(count ?? 0));
  }, []);

  const tabs = [
    { href: '/admin/leads', icon: '📥', label: 'Leads', badge: newCount > 0 ? newCount : null },
    { href: '/admin/people', icon: '👥', label: 'People' },
    { href: '/admin/orders', icon: '🛒', label: 'Orders' },
    { href: '/admin/newsletter', icon: '📧', label: 'Newsletter' },
  ];

  return (
    <>
      <nav className="topnav">
        <span className="nav-brand">M·O·I</span>
        <Link href="/" className="nav-btn">
          🌐 Public Form
        </Link>
        <span className="nav-btn active">/admin</span>
      </nav>

      <div className="admin-wrap">
        <div className="sidebar">
          <div className="sidebar-label">CRM</div>
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`sidebar-item${path.startsWith(t.href) ? ' active' : ''}`}
            >
              <span>{t.icon}</span>
              {t.label}
              {t.badge ? <span className="sidebar-badge">{t.badge}</span> : null}
            </Link>
          ))}
        </div>
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
