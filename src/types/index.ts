export type EventCategory =
  | 'academic'
  | 'cultural'
  | 'sports'
  | 'social'
  | 'workshop'
  | 'general';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id: string | null;
  department: string | null;
  phone: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string | null;
  venue: string;
  capacity: number;
  available_seats: number;
  price: number;
  image_url: string | null;
  category: EventCategory;
  status: EventStatus;
  organizer: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  event_id: string;
  seat_number: number;
  booking_code: string;
  status: BookingStatus;
  checked_in: boolean;
  created_at: string;
  event?: Event;
}

export interface WaitlistEntry {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}
