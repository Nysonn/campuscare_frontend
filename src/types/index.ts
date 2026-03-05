export type UserRole = 'student' | 'counselor' | 'admin';

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
}

export interface CounselorProfile {
  id: string;
  email: string;
  role: 'counselor';
  full_name: string;
  specialization: string;
  bio: string;
  phone: string;
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
  attachments?: string[];
}

export interface Counselor {
  id: string;
  full_name: string;
  specialization: string;
  bio: string;
}

export interface Booking {
  id: string;
  counselor_id: string;
  counselor_name: string;
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
  created_at: string;
}

export interface AdminCampaign {
  id: string;
  student_id: string;
  title: string;
  description: string;
  target_amount: number;
  category: string;
  created_at: string;
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
  amount: number;
  status: string;
  created_at: string;
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
