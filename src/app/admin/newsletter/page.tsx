'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Person } from '@/types';

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function NewsletterPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('people')
        .select('*')
        .eq('ok_to_contact', true)
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setPeople((data as Person[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="empty">Đang tải...</div>;

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Newsletter</h2>
          <p>{people.length} người đăng ký nhận tin</p>
        </div>
      </div>

      <div className="table-wrap">
        {people.length === 0 && <div className="empty">Chưa có người đăng ký</div>}
        {people.map((p) => (
          <div key={p.id} className="nl-row">
            <div>
              <div style={{ fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {p.email} · {p.phone ?? '–'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {p.attributes?.skin_type && (
                <span className="badge badge-type">{p.attributes.skin_type}</span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{fmt(p.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
