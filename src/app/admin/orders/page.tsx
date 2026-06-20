'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, Person } from '@/types';

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: o }, { data: p }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('people').select('*'),
      ]);
      if (cancelled) return;
      setOrders((o as Order[]) ?? []);
      setPeople((p as Person[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="empty">Đang tải...</div>;

  const personOf = (id: string) => people.find((p) => p.id === id);
  const totalPaid = orders.filter((o) => o.status === 'paid').reduce((s, o) => s + o.amount_vnd, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>
            {orders.length} đơn hàng · {fmtMoney(totalPaid)} đã thu
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  Chưa có đơn hàng
                </td>
              </tr>
            )}
            {orders.map((o) => {
              const p = personOf(o.person_id);
              return (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p?.name ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{p?.email}</div>
                  </td>
                  <td>{o.product_name}</td>
                  <td style={{ color: 'var(--pink)', fontWeight: 500 }}>
                    {fmtMoney(o.amount_vnd)}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color:
                          o.status === 'paid'
                            ? '#15803d'
                            : o.status === 'pending'
                              ? '#b45309'
                              : '#6b7280',
                      }}
                    >
                      {o.status === 'paid'
                        ? '✓ Đã thanh toán'
                        : o.status === 'pending'
                          ? '⏳ Chờ TT'
                          : '↩ Hoàn tiền'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-3)' }}>{fmt(o.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
