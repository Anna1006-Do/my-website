export type PipelineStatus =
  | 'new_lead'
  | 'contacted'
  | 'discovery_call'
  | 'proposal'
  | 'won'
  | 'lost';

export type InquiryType =
  | 'product-info'
  | 'pricing'
  | 'promotion'
  | 'product-usage'
  | 'price-comparison';

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source_site: string | null;
  ok_to_contact: boolean;
  attributes: {
    skin_type?: string;
    referred_by?: string;
  };
  created_at: string;
}

export interface Contact {
  id: string;
  person_id: string;
  type: InquiryType;
  subject: string | null;
  message: string;
  source: string;
  status: PipelineStatus;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  contact_id: string;
  person_id: string;
  from_status: PipelineStatus;
  to_status: PipelineStatus;
  actor: string;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  person_id: string;
  product_name: string;
  amount_vnd: number;
  status: 'pending' | 'paid' | 'refunded';
  created_at: string;
}

export const STAGES: PipelineStatus[] = [
  'new_lead',
  'contacted',
  'discovery_call',
  'proposal',
  'won',
  'lost',
];

export const STAGE_LABELS: Record<PipelineStatus, string> = {
  new_lead: 'Mới',
  contacted: 'Đã liên hệ',
  discovery_call: 'Tư vấn',
  proposal: 'Báo giá',
  won: 'Chốt đơn',
  lost: 'Mất lead',
};

export const TYPE_LABELS: Record<InquiryType, string> = {
  'product-info': 'Thông tin SP',
  pricing: 'Hỏi giá',
  promotion: 'Khuyến mãi',
  'product-usage': 'Công dụng',
  'price-comparison': 'So sánh giá',
};

export const INQUIRY_TYPES: InquiryType[] = [
  'product-info',
  'pricing',
  'promotion',
  'product-usage',
  'price-comparison',
];

export const SKIN_TYPES = ['da sáng', 'da vừa', 'da ngăm'];
