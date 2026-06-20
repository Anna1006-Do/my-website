# Epics

---

## Epic 1 — Core Inquiry Pipeline

**Status:** 🟡 In Progress — approved for development  
**Owner:** developer agent  
**Priority:** P1 — nothing else starts until this ships

### Problem it solves

CS team has no central place to log and track customer inquiries. Leads come in via Facebook and the website and fall through the cracks.

### What we're building

A full-stack CRM with:

- **Public form** (`/`) — customers submit inquiries (name, email, phone, type, message, skin type, referral source)
- **Admin dashboard** (`/admin`) — CS team sees all leads, moves them through the pipeline, adds notes
- **Contact detail panel** — full inquiry history, pipeline stage control, activity log
- **People tab** — customer profiles (all their inquiries + orders in one place)
- **Orders tab** — log and track purchases per customer
- **Newsletter tab** — everyone who opted in to `ok_to_contact`

### Design

Follow the prototype at `docs/design/moi-crm-prototype.html` exactly:

- Pink `#F94C8B` + Mint `#9ECFBC` color scheme
- Inter font, Vietnamese UI (`lang="vi"`)
- Top nav: "M·O·I" brand + Public Form / Admin toggle
- Admin sidebar: Leads 📥 / People 👥 / Orders 🛒 / Newsletter 📧

### Data model (Supabase)

```sql
-- People (one row per unique customer email)
CREATE TABLE people (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text UNIQUE NOT NULL,
  phone       text,
  source_site text,           -- 'facebook' | 'website'
  ok_to_contact boolean DEFAULT true,
  attributes  jsonb DEFAULT '{}',  -- {skin_type, referred_by}
  created_at  timestamptz DEFAULT now()
);

-- Contacts (one row per inquiry)
CREATE TABLE contacts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   uuid REFERENCES people(id),
  type        text NOT NULL,   -- product-info | pricing | promotion | product-usage | price-comparison
  subject     text,
  message     text NOT NULL,
  source      text,            -- 'facebook' | 'website'
  status      text DEFAULT 'new_lead',  -- pipeline stage
  created_at  timestamptz DEFAULT now()
);

-- Activity log
CREATE TABLE activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id  uuid REFERENCES contacts(id),
  person_id   uuid REFERENCES people(id),
  from_status text,
  to_status   text,
  actor       text DEFAULT 'CS Team',
  note        text,
  created_at  timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id    uuid REFERENCES people(id),
  product_name text NOT NULL,
  amount_vnd   integer NOT NULL,  -- in VND, not cents
  status       text DEFAULT 'pending',  -- pending | paid | refunded
  created_at   timestamptz DEFAULT now()
);
```

### Routes

| Route               | Description                  |
| ------------------- | ---------------------------- |
| `/`                 | Public inquiry form          |
| `/admin`            | Admin dashboard (auth-gated) |
| `/admin/leads`      | Leads pipeline view          |
| `/admin/people`     | Customer profiles            |
| `/admin/orders`     | Orders list                  |
| `/admin/newsletter` | Newsletter subscribers       |

### Auth

Simple Supabase Magic Link auth. CS team members sign in with their email — no password needed.

### Acceptance criteria

- [ ] Customer can submit an inquiry via the public form and it saves to Supabase
- [ ] CS Executive can log in to `/admin` and see all leads
- [ ] CS Executive can move a lead through all 6 pipeline stages
- [ ] Each stage move is logged in activity_log with an optional note
- [ ] Customer profile page shows all their inquiries and orders in one place
- [ ] CS Executive can add an order to any person
- [ ] Newsletter tab shows everyone with `ok_to_contact = true`
- [ ] Stats row shows: new today / active / won / total
- [ ] All text is in Vietnamese
- [ ] Design matches the prototype (colors, fonts, layout)

### Definition of done

- All acceptance criteria pass
- Supabase tables created via migration
- App deployed to Vercel and accessible at production URL
- CS team can log in and use it without any instructions

### Estimated scope

Medium — 3–5 developer sessions. Most UI is already designed; work is wiring Supabase + Next.js App Router.

---

## Backlog

- Epic 2 — Follow-up Reminders (auto-remind CS if lead stays in same stage > N days)
- Epic 3 — Manager Dashboard (conversion rates, CS performance, revenue tracking)
- Epic 4 — Resend Email Integration (send newsletter to `ok_to_contact` list)
- Epic 5 — Facebook Messenger Integration (inquiries land directly from FB)
