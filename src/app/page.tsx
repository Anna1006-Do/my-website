'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { INQUIRY_TYPES, TYPE_LABELS, SKIN_TYPES } from '@/types';

export default function PublicForm() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const fd = new FormData(form);

    const name = (fd.get('name') as string).trim();
    const email = (fd.get('email') as string).trim();
    const type = fd.get('type') as string;
    const message = (fd.get('message') as string).trim();

    if (!name || !email || !type || !message) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('people')
        .select('id')
        .eq('email', email)
        .single();

      let personId: string;

      if (existing) {
        personId = existing.id;
      } else {
        const { data: newPerson, error: personErr } = await supabase
          .from('people')
          .insert({
            name,
            email,
            phone: (fd.get('phone') as string).trim() || null,
            source_site: 'website',
            ok_to_contact: fd.get('ok_to_contact') === 'on',
            attributes: {
              skin_type: (fd.get('skin_type') as string) || undefined,
              referred_by: (fd.get('referred_by') as string).trim() || undefined,
            },
          })
          .select('id')
          .single();
        if (personErr) throw personErr;
        personId = newPerson.id;
      }

      const { error: contactErr } = await supabase.from('contacts').insert({
        person_id: personId,
        type,
        subject: `Inquiry từ ${name}`,
        message,
        source: 'website',
        status: 'new_lead',
      });
      if (contactErr) throw contactErr;

      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Có lỗi xảy ra, vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="topnav">
        <span className="nav-brand">M·O·I</span>
        <span className="nav-btn active">🌐 Liên hệ</span>
        <Link href="/admin" className="nav-btn">
          /admin
        </Link>
      </nav>

      <div
        style={{
          paddingTop: 52,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 20px 40px',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 48,
            maxWidth: 520,
            width: '100%',
            boxShadow: 'var(--shadow)',
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: 'var(--mint-light)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 22,
                }}
              >
                ✓
              </div>
              <h2 style={{ fontWeight: 500, fontSize: 18, marginBottom: 8 }}>
                Cảm ơn bạn đã liên hệ!
              </h2>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
                MOI sẽ phản hồi trong thời gian sớm nhất.
                <br />
                Hãy kiểm tra email để nhận xác nhận từ chúng mình nhé.
              </p>
              <button
                onClick={() => setSuccess(false)}
                style={{
                  marginTop: 24,
                  padding: '10px 32px',
                  background: 'var(--pink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Gửi thêm yêu cầu
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1
                style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 6 }}
              >
                Liên hệ với MOI 💄
              </h1>
              <p style={{ color: 'var(--text-3)', marginBottom: 32, fontSize: 14 }}>
                Chúng mình sẽ trả lời bạn trong vòng 2 giờ làm việc.
              </p>

              {error && (
                <div
                  style={{
                    background: '#fde8f2',
                    color: '#d6246a',
                    padding: '10px 14px',
                    borderRadius: 8,
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Họ tên *">
                  <input name="name" type="text" placeholder="Nguyễn Thị Lan" required />
                </Field>
                <Field label="Số điện thoại">
                  <input name="phone" type="tel" placeholder="0901 234 567" />
                </Field>
              </div>

              <Field label="Email *">
                <input name="email" type="email" placeholder="ban@email.com" required />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Loại câu hỏi *">
                  <select name="type" required defaultValue="">
                    <option value="" disabled>
                      -- Chọn --
                    </option>
                    {INQUIRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Loại da">
                  <select name="skin_type" defaultValue="">
                    <option value="">-- Chọn --</option>
                    {SKIN_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Biết đến MOI qua">
                <input
                  name="referred_by"
                  type="text"
                  placeholder="Facebook Ads / Bạn bè / TikTok..."
                />
              </Field>

              <Field label="Nội dung *">
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Bạn muốn hỏi gì? Càng chi tiết thì mình trả lời được chính xác hơn nhé!"
                  required
                />
              </Field>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input
                  type="checkbox"
                  name="ok_to_contact"
                  id="ok"
                  defaultChecked
                  style={{ accentColor: 'var(--pink)', width: 16, height: 16 }}
                />
                <label htmlFor="ok" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Đồng ý nhận thông tin ưu đãi từ MOI Cosmetics
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 13,
                  background: loading ? '#ccc' : 'var(--pink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity .15s',
                }}
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-2)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div className="field-wrap">{children}</div>
    </div>
  );
}
