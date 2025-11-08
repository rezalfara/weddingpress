// Diterjemahkan dari internal/models/models.go

// User adalah admin/pasangan yang login
export interface User {
    id: number;
    name: string;
    email: string;
    wedding: Wedding; // Relasi Has One
    created_at: string;
    updated_at: string;
  }
  
  // Wedding adalah data utama undangan
  export interface Wedding {
    id: number;
    user_id: number;
    wedding_title: string;
    cover_image_url: string;
    music_url: string;
    theme_color: string;
    groom_bride: GroomBride; // Relasi Has One
    events: Event[]; // Relasi Has Many
    stories: Story[]; // Relasi Has Many
    galleries: Gallery[]; // Relasi Has Many
    guests: Guest[]; // Relasi Has Many
    created_at: string;
    updated_at: string;
  }
  
  // GroomBride berisi detail pasangan
  export interface GroomBride {
    id: number;
    wedding_id: number;
    groom_name: string;
    groom_photo_url: string;
    groom_bio: string;
    bride_name: string;
    bride_photo_url: string;
    bride_bio: string;
  }
  
  // Event untuk acara (misal: Akad, Resepsi)
  export interface Event {
    id: number;
    wedding_id: number;
    name: string;
    date: string; // Tipe time.Time menjadi string di JSON
    start_time: string;
    end_time: string;
    address: string;
    maps_url: string;
  }
  
  // Story adalah timeline cerita
  export interface Story {
    id: number;
    wedding_id: number;
    title: string;
    date: string; // Tipe time.Time menjadi string di JSON
    description: string;
    order: number;
  }
  
  // Gallery untuk foto/video
  export interface Gallery {
    id: number;
    wedding_id: number;
    file_url: string;
    file_type: "image" | "video"; // Tipe "image" atau "video"
    caption: string;
  }
  
  // Guest adalah tamu undangan
  export interface Guest {
    id: number;
    wedding_id: number;
    name: string;
    slug: string;
    group: string;
    is_rsvp: boolean;
    total_attendance: number;
    guest_book: GuestBook; // Relasi Has One
    created_at: string;
    updated_at: string;
  }
  
  // GuestBook untuk ucapan
  export interface GuestBook {
    id: number;
    guest_id: number;
    message: string;
    status: "pending" | "approved"; // "pending" atau "approved"
    created_at: string;
  }
  
  // =======================================================
  // Tipe Tambahan dari Handler
  // =======================================================
  
  // InvitationData adalah struct gabungan untuk respons publik
  // dari internal/handlers/public_handler.go
  export interface InvitationData {
    guest: Guest;
    wedding: Wedding; // Termasuk semua relasi (GroomBride, Events, dll)
  }
  
  // Tipe untuk response login admin
  // dari internal/handlers/auth_handler.go
  export interface LoginResponse {
    message: string;
    token: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }