'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Person, Contact, Order, PipelineStatus } from '@/types';
import { STAGE_LABELS, TYPE_LABELS } from '@/types';

function fmt(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
}

function fmtMoney(vnd: number) {
  return vnd.toLocaleString('vi-VN') + 'đ';
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(-2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Person | null>(null);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: p }, { data: c }, { data: o }] = await Promise.all([
        supabase.from('people').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setPeople((p as Person[]) ?? []);
      setContacts((c as Contact[]) ?? []);
      setOrders((o as Order[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
     
  }, [tick]);

  const filtered = query
    ? people.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase())
      )
    : people;

  async function addOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const product = (fd.get('product') as string).trim();
    const amount = parseInt(fd.get('amount') as string);
    const status = fd.get('status') as string;
    if (!product || !amount) return;
    await supabase
      .from('orders')
      .insert({ person_id: selected.id, product_name: product, amount_vnd: amount, status });
    setShowAddOrder(false);
    refresh();
  }

  if (loading) return <div className="empty">Đang tải...</div>;

  const personContacts = selected ? contacts.filter((c) => c.person_id === selected.id) : [];
  const personOrders = selected ? orders.filter((o) => o.person_id === selected.id) : [];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>People</h2>
          <p>{people.length} contacts</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          className="search-input"
          placeholder="Tìm theo tên hoặc email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 && <div className="empty">Không tìm thấy</div>}

      <div className="person-grid">
        {filtered.map((p) => {
          const inquiries = contacts.filter((c) => c.person_id === p.id).length;
          return (
            <div
              key={p.id}
              className="person-card"
              onClick={() => {
                setSelected(p);
                setShowAddOrder(false);
              }}
            >
              <div className="person-avatar">{initials(p.name)}</div>
              <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{p.name}</h4>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  marginBottom: 8,
                  wordBreak: 'break-all',
                }}
              >
                {p.email}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {p.attributes?.skin_type && (
                  <span className="badge badge-type">{p.attributes.skin_type}</span>
                )}
                {p.ok_to_contact && (
                  <span className="badge" style={{ background: '#edf7f3', color: '#2a9d7f' }}>
                    Newsletter
                  </span>
                )}
                <span className="badge" style={{ background: '#f3f4f6', color: '#666' }}>
                  {inquiries} inquiry
                </span>
              </div>
              {p.attributes?.referred_by && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                  via {p.attributes.referred_by}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <div
        className={`detail-overlay${selected ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <div className="detail-panel">
          {selected && (
            <>
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    className="person-avatar"
                    style={{ width: 44, height: 44, fontSize: 17, marginBottom: 0 }}
                  >
                    {initials(selected.name)}
                  </div>
                  <div>
                    <h3>{selected.name}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{selected.email}</div>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setSelected(null)}>
                  ✕
                </button>
              </div>

              <div className="panel-body">
                <div className="panel-section">
                  <h4>Thông tin</h4>
                  <div className="kv-list">
                    <div className="k">Điện thoại</div>
                    <div className="v">{selected.phone ?? '–'}</div>
                    <div className="k">Nguồn</div>
                    <div className="v">{selected.source_site ?? '–'}</div>
                    <div className="k">Loại da</div>
                    <div className="v">{selected.attributes?.skin_type ?? '–'}</div>
                    <div className="k">Biết MOI qua</div>
                    <div className="v">{selected.attributes?.referred_by ?? '–'}</div>
                    <div className="k">Newsletter</div>
                    <div className="v">{selected.ok_to_contact ? '✓ Đăng ký' : '–'}</div>
                    <div className="k">Ngày tạo</div>
                    <div className="v">{fmt(selected.created_at)}</div>
                  </div>
                </div>

                <div className="panel-section">
                  <h4>Inquiries ({personContacts.length})</h4>
                  {personContacts.length === 0 && (
                    <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Chưa có inquiry</p>
                  )}
                  {personContacts.map((c) => (
                    <div
                      key={c.id}
                      style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span className="badge badge-type">
                          {TYPE_LABELS[c.type as keyof typeof TYPE_LABELS] ?? c.type}
                        </span>
                        <span className={`badge badge-${c.status.replace(/_/g, '-')}`}>
                          {STAGE_LABELS[c.status as PipelineStatus]}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--text-2)',
                          marginTop: 6,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.message}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                        {fmt(c.created_at)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel-section">
                  <h4>Orders ({personOrders.length})</h4>
                  {personOrders.map((o) => (
                    <div
                      key={o.id}
                      style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{o.product_name}</div>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--pink)' }}>
                          {fmtMoney(o.amount_vnd)}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color:
                              o.status === 'paid'
                                ? '#15803d'
                                : o.status === 'pending'
                                  ? '#b45309'
                                  : '#6b7280',
                          }}
                        >
                          {o.status === 'paid'
                            ? 'Đã TT'
                            : o.status === 'pending'
                              ? 'Chờ TT'
                              : 'Hoàn'}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                        {fmt(o.created_at)}
                      </div>
                    </div>
                  ))}

                  {showAddOrder ? (
                    <form className="inline-form" onSubmit={addOrder}>
                      <h5>Thêm đơn hàng</h5>
                      <div className="fg">
                        <label>Sản phẩm</label>
                        <input name="product" placeholder="Tên sản phẩm" required />
                      </div>
                      <div className="fg">
                        <label>Giá (VND)</label>
                        <input name="amount" type="number" placeholder="350000" required />
                      </div>
                      <div className="fg">
                        <label>Trạng thái</label>
                        <select name="status">
                          <option value="pending">Chờ thanh toán</option>
                          <option value="paid">Đã thanh toán</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button type="submit" className="btn-sm">
                          Lưu
                        </button>
                        <button
                          type="button"
                          className="btn-sm outline"
                          onClick={() => setShowAddOrder(false)}
                        >
                          Huỷ
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className="btn-sm outline"
                      style={{ marginTop: 12 }}
                      onClick={() => setShowAddOrder(true)}
                    >
                      + Thêm đơn hàng
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
