export type UserRole = 'student' | 'counselor' | 'admin';

export interface Blog {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  student_id: string;
  display_name: string;
  avatar_url: string;
  university: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'visa';

export interface StudentProfile {
  id: string;
  email: string;
  role: 'student';
  first_name: string;
  last_name: string;
  display_name: string;
  bio: string;
  university: string;
  course: string;
  year: string;
  location: string;
  avatar_url: string;
  is_anonymous: boolean;
  is_sponsor?: boolean;
}

// ── Sponsor feature types ─────────────────────────────────────────────────────

export interface SponsorProfile {
  id: string;
  display_name: string;
  bio: string;
  university: string;
  course: string;
  avatar_url: string;
  what_i_offer: string;
  has_pending_request: boolean;
  is_my_sponsor: boolean;
  sponsor_is_busy: boolean;
}

export interface SponsorRequest {
  id: string;
  requester_id?: string;
  sponsor_id?: string;
  display_name: string;
  bio?: string;
  university: string;
  course?: string;
  avatar_url: string;
  what_i_offer?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Sponsorship {
  channel_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar: string;
  partner_role: 'sponsor' | 'sponsee';
  created_at: string;
}

export interface MySponsorStatus {
  is_sponsor: boolean;
  what_i_offer: string;
}

export interface StreamTokenResponse {
  token: string;
  user_id: string;
  api_key: string;
}

export interface AdminSponsor {
  id: string;
  display_name: string;
  university: string;
  avatar_url: string;
  what_i_offer: string;
  is_active: boolean;
  created_at: string;
  sponsee: {
    id: string;
    display_name: string;
    avatar_url: string;
    since: string;
  } | null;
}

export interface CounselorProfile {
  id: string;
  email: string;
  role: 'counselor';
  full_name: string;
  specialization: string;
  bio: string;
  phone: string;
  avatar_url: string;
  location: string;
  age: number | null;
  years_of_experience: string;
  licence_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
}

export interface AdminProfile {
  id: string;
  email: string;
  role: 'admin';
  full_name?: string;
}

export type UserProfile = StudentProfile | CounselorProfile | AdminProfile;

export interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  created_at: string;
  is_anonymous: boolean;
  author: string;
  avatar_url: string;
  category?: string;
  status?: string;
  account_status?: string;
  urgency_level?: string;
  beneficiary_type?: string;
  beneficiary_name?: string;
  beneficiary_org_name?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  attachments?: CampaignAttachment[];
  direct_amount?: number;
  pool_amount?: number;
}

export interface CampaignAttachment {
  url: string;
  label: string;
  name?: string; // display filename (client-only, stripped before API call)
}

export interface MyCampaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  category: string;
  created_at: string;
  is_anonymous: boolean;
  status?: string;
  account_status?: string;
  attachments?: CampaignAttachment[];
  urgency_level?: string;
  beneficiary_type?: string;
  beneficiary_name?: string;
  verification_contact_name?: string;
  verification_contact_info?: string;
  beneficiary_org_name?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
}

export interface Counselor {
  id: string;
  full_name: string;
  specialization: string;
  bio: string;
  avatar_url: string;
  location: string;
  age: number | null;
  years_of_experience: string;
}

export interface AdminCounselor {
  id: string;
  email: string;
  full_name: string;
  specialization: string;
  bio: string;
  phone: string;
  avatar_url: string;
  location: string;
  age: number | null;
  years_of_experience: string;
  licence_url: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Booking {
  id: string;
  counselor_id: string;
  counselor_name: string;
  counselor_avatar: string;
  type: 'online' | 'physical';
  start_time: string;
  end_time: string;
  location: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
}

export interface CounselorBooking {
  id: string;
  student_id: string;
  student_name: string;
  student_email?: string;
  type: 'online' | 'physical';
  start_time: string;
  end_time: string;
  location: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  phone?: string;
  created_at: string;
}

export interface AdminCampaign {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  category: string;
  created_at: string;
  status: string;
  is_anonymous: boolean;
  urgency_level: string;
  beneficiary_type: string;
  beneficiary_name: string;
  verification_contact_name: string;
  verification_contact_info: string;
  beneficiary_org_name: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  account_status: string;
  attachments: CampaignAttachment[];
}

export interface AdminBooking {
  id: string;
  student_id: string;
  student_name: string;
  counselor_id: string;
  counselor_name: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface AdminContribution {
  id: string;
  campaign_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export interface ContributionCreateResponse {
  contribution_id: string;
  status: 'success' | 'pending';
}

export interface AdminDashboard {
  users: number;
  campaigns: number;
  bookings: number;
  total_raised: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  crisis_flagged?: boolean;
  timestamp: Date;
}

export interface ChatHistoryItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// ── Behaviour Tracking types ──────────────────────────────────────────────────

export interface BehaviourLog {
  log_date: string; // YYYY-MM-DD
  did_it: boolean;
}

export interface BehaviourGoal {
  id: string;
  title: string;
  direction: 'build' | 'quit';
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status: 'active' | 'completed';
  created_at: string;
}

export interface BehaviourGoalWithLogs extends BehaviourGoal {
  logs: BehaviourLog[];
}

export interface BehaviourStats {
  title: string;
  direction: 'build' | 'quit';
  start_date: string;
  end_date: string;
  status: string;
  total_days: number;
  days_logged: number;
  days_succeeded: number;
  success_rate: number;
}

// ── Self-Evaluation types ─────────────────────────────────────────────────────

export interface EvaluationQuestion {
  id: number;
  text: string;
  options: string[]; // index 0 = score 1 (worst), index 3 = score 4 (best)
}

export interface EvaluationResult {
  id: string;
  score: number;
  category: string;
  message: string;
  recommendations?: string[];
}

export interface EvaluationHistoryItem {
  id: string;
  score: number;
  category: string;
  taken_at: string;
}
