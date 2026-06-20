'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import type { Contact, Person, ActivityLog, PipelineStatus } from '@/types';
import { STAGES, STAGE_LABELS, TYPE_LABELS } from '@/types';

function fmt(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
}

function stageBadge(s: PipelineStatus) {
  const cls: Record<PipelineStatus, string> = {
    new_lead: 'badge-new',
    contacted: 'badge-contacted',
    discovery_call: 'badge-discovery',
    proposal: 'badge-proposal',
    won: 'badge-won',
    lost: 'badge-lost',
  };
  return <span className={`badge ${cls[s]}`}>{STAGE_LABELS[s]}</span>;
}

function typeBadge(t: string) {
  return (
    <span className="badge badge-type">{TYPE_LABELS[t as keyof typeof TYPE_LABELS] ?? t}</span>
  );
}

export default function LeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<PipelineStatus | 'all'>('all');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: c }, { data: p }, { data: l }] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('people').select('*'),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setContacts((c as Contact[]) ?? []);
      setPeople((p as Person[]) ?? []);
      setLogs((l as ActivityLog[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const personOf = (pid: string) => people.find((p) => p.id === pid);
  const filtered = filter === 'all' ? contacts : contacts.filter((c) => c.status === filter);

  async function moveStage(contact: Contact, toStatus: PipelineStatus) {
    if (contact.status === toStatus) return;
    const note = noteInput.trim();
    await supabase.from('contacts').update({ status: toStatus }).eq('id', contact.id);
    await supabase.from('activity_log').insert({
      contact_id: contact.id,
      person_id: contact.person_id,
      from_status: contact.status,
      to_status: toStatus,
      actor: 'CS Team',
      note: note || null,
    });
    setNoteInput('');
    setSelected((prev) => (prev?.id === contact.id ? { ...prev, status: toStatus } : prev));
    toast(`✓ Chuyển sang "${STAGE_LABELS[toStatus]}"`);
    refresh();
  }

  if (loading) return <div className="empty">Đang tải...</div>;

  const newCount = contacts.filter((c) => c.status === 'new_lead').length;
  const wonCount = contacts.filter((c) => c.status === 'won').length;
  const activeCount = contacts.filter((c) => !['won', 'lost'].includes(c.status)).length;
  const contactLogs = selected ? logs.filter((l) => l.contact_id === selected.id) : [];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Leads</h2>
          <p>{contacts.length} inquiries tổng cộng</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card pink">
          <div className="val">{newCount}</div>
          <div className="lbl">Mới hôm nay</div>
        </div>
        <div className="stat-card">
          <div className="val">{activeCount}</div>
          <div className="lbl">Đang xử lý</div>
        </div>
        <div className="stat-card mint">
          <div className="val">{wonCount}</div>
          <div className="lbl">Chốt đơn</div>
        </div>
        <div className="stat-card">
          <div className="val">{contacts.length}</div>
          <div className="lbl">Tổng inquiry</div>
        </div>
      </div>

      <div className="pipeline-bar">
        <button
          className={`pipe-pill${filter === 'all' ? ' active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả <span>{contacts.length}</span>
        </button>
        {STAGES.map((s) => (
          <button
            key={s}
            className={`pipe-pill${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {STAGE_LABELS[s]} <span>{contacts.filter((c) => c.status === s).length}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Loại</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  Không có leads
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const p = personOf(c.person_id);
              return (
                <tr
                  key={c.id}
                  onClick={() => {
                    setSelected(c);
                    setNoteInput('');
                  }}
                >
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p?.name ?? '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{p?.email}</div>
                  </td>
                  <td>{typeBadge(c.type)}</td>
                  <td
                    style={{
                      maxWidth: 220,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.message}
                  </td>
                  <td>{stageBadge(c.status)}</td>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-3)' }}>
                    {fmt(c.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      <div
        className={`detail-overlay${selected ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <div className="detail-panel">
          {selected &&
            (() => {
              const p = personOf(selected.person_id);
              const curIdx = STAGES.indexOf(selected.status);
              return (
                <>
                  <div className="panel-header">
                    <div>
                      <h3>{p?.name ?? '—'}</h3>
                      <div style={{ marginTop: 4, display: 'flex', gap: 8 }}>
                        {typeBadge(selected.type)} {stageBadge(selected.status)}
                      </div>
                    </div>
                    <button className="close-btn" onClick={() => setSelected(null)}>
                      ✕
                    </button>
                  </div>

                  <div className="panel-body">
                    <div className="panel-section">
                      <h4>Pipeline</h4>
                      <div className="pipeline-steps">
                        {STAGES.map((s, i) => {
                          let cls = 'step';
                          if (s === 'won' && selected.status === 'won') cls = 'step won-step';
                          else if (s === 'lost' && selected.status === 'lost')
                            cls = 'step lost-step';
                          else if (i < curIdx) cls = 'step past';
                          else if (i === curIdx) cls = 'step current';
                          return (
                            <button key={s} className={cls} onClick={() => moveStage(selected, s)}>
                              {STAGE_LABELS[s]}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Ghi chú (tuỳ chọn)..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 13,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            minHeight: 70,
                            outline: 'none',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = 'var(--pink)')}
                          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                        />
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            marginTop: 8,
                            justifyContent: 'flex-end',
                          }}
                        >
                          <button
                            className="btn-sm outline"
                            onClick={() => {
                              const idx = STAGES.indexOf(selected.status);
                              if (idx < STAGES.length - 2) moveStage(selected, STAGES[idx + 1]);
                            }}
                          >
                            Chuyển bước tiếp →
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="panel-section">
                      <h4>Nội dung inquiry</h4>
                      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                        {selected.message}
                      </p>
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)' }}>
                        {fmt(selected.created_at)} · via {selected.source}
                      </div>
                    </div>

                    <div className="panel-section">
                      <h4>Thông tin khách hàng</h4>
                      <div className="kv-list">
                        <div className="k">Email</div>
                        <div className="v">{p?.email}</div>
                        <div className="k">Điện thoại</div>
                        <div className="v">{p?.phone ?? '–'}</div>
                        <div className="k">Nguồn</div>
                        <div className="v">{p?.source_site ?? '–'}</div>
                        <div className="k">Loại da</div>
                        <div className="v">{p?.attributes?.skin_type ?? '–'}</div>
                        <div className="k">Biết MOI qua</div>
                        <div className="v">{p?.attributes?.referred_by ?? '–'}</div>
                        <div className="k">Newsletter</div>
                        <div className="v">{p?.ok_to_contact ? '✓ Có đăng ký' : '–'}</div>
                      </div>
                    </div>

                    <div className="panel-section">
                      <h4>Lịch sử hoạt động</h4>
                      {contactLogs.length === 0 && (
                        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Chưa có hoạt động</p>
                      )}
                      {contactLogs.map((l) => (
                        <div key={l.id} className="activity-item">
                          <div className="act-dot" />
                          <div>
                            <div className="act-text">
                              <strong>{STAGE_LABELS[l.from_status]}</strong> →{' '}
                              <strong>{STAGE_LABELS[l.to_status]}</strong> · {l.actor}
                              {l.note && (
                                <>
                                  <br />
                                  <span style={{ color: 'var(--text-3)' }}>{l.note}</span>
                                </>
                              )}
                            </div>
                            <div className="act-time">{fmt(l.created_at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
        </div>
      </div>
    </>
  );
}
