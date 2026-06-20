# Product Strategy — MOI Cosmetics CRM

## What We're Building

An internal Customer Service CRM for MOI Cosmetics — a Vietnamese cosmetics brand.  
Built for CS Executives and Managers to track customer inquiries, move them through a pipeline, and follow up before deals go cold.

---

## The Problem

MOI's CS team receives inquiries from Facebook and the website (product questions, pricing, promotions, usage help). Without a central system:

- Inquiries get lost between channels
- Follow-ups happen too late or not at all
- Lost deals and unhappy customers

**Cost:** time wasted + lost revenue from untracked leads.

---

## The User

**Primary:** Customer Service Executive (daily use — logs inquiries, moves pipeline stages, adds notes)  
**Secondary:** CS Manager (overview — stats, pipeline health, team performance)

**Context:** Vietnamese team, handles inquiries from Facebook + website. Currently tracking in chat threads or spreadsheets.

---

## The Solution

A web CRM where CS Executives log every customer inquiry, move it through a pipeline (Mới → Đã liên hệ → Tư vấn → Báo giá → Chốt đơn / Mất lead), and add notes at each step — so nothing falls through the cracks.

---

## Values Delivered

1. **Tracks every customer inquiry** automatically from both Facebook and website form
2. **Shows pipeline status at a glance** so CS knows exactly what needs attention
3. **Logs all CS activity** so managers can review what happened on any inquiry
4. **Stores customer profile** (skin type, referral source, order history, newsletter opt-in)
5. **Surfaces newsletter subscribers** for Resend email campaigns
6. **Converts inquiries into orders** by keeping the CS team on top of every lead

---

## Why Not HubSpot / Notion / Spreadsheets

- **HubSpot:** overkill and expensive for a small CS team, English-first UI
- **Notion:** no pipeline view, no activity log, not built for inquiry tracking
- **Spreadsheets:** no pipeline stages, no activity log, no customer form, no order tracking

This CRM is Vietnamese-first, cosmetics-specific, and costs nothing beyond hosting.

---

## Design Reference

Prototype: `docs/design/moi-crm-prototype.html`

**Color palette:**

- Pink: `#F94C8B` (primary brand color)
- Pink light: `#fde8f2`
- Mint: `#9ECFBC`
- Background: `#fafafa`
- Font: Inter

**Language:** Vietnamese UI (`lang="vi"`)

---

## Pipeline Stages

| Stage            | Vietnamese | Meaning                  |
| ---------------- | ---------- | ------------------------ |
| `new_lead`       | Mới        | Just submitted           |
| `contacted`      | Đã liên hệ | CS has responded         |
| `discovery_call` | Tư vấn     | Consultation in progress |
| `proposal`       | Báo giá    | Quote sent               |
| `won`            | Chốt đơn   | Order placed             |
| `lost`           | Mất lead   | Not converted            |

## Inquiry Types

- `product-info` — Thông tin sản phẩm
- `pricing` — Hỏi giá
- `promotion` — Khuyến mãi
- `product-usage` — Công dụng
- `price-comparison` — So sánh giá

## Customer Attributes

- `skin_type`: da sáng / da vừa / da ngăm
- `source_site`: facebook / website
- `referred_by`: free text (Facebook Ads, bạn bè, TikTok, etc.)
- `ok_to_contact`: boolean — newsletter opt-in

---

## Success Metrics

| Type     | Metric                                        | Target                  |
| -------- | --------------------------------------------- | ----------------------- |
| Leading  | Inquiries logged per day                      | > 0 (adoption baseline) |
| Trailing | % inquiries reaching "Chốt đơn" within 7 days | ≥ 30%                   |

---

## Status

- [x] Discovery complete
- [x] Design prototype done
- [ ] Epic 1: Core Inquiry Pipeline — in progress
- [ ] MVP live
