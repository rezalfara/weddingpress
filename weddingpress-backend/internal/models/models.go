package models

import (
	"time"
)

// User adalah admin/pasangan yang login
type User struct {
	ID           uint   `gorm:"primarykey" json:"id"`
	Name         string `gorm:"size:255;not null" json:"name"`
	Email        string `gorm:"size:255;not null;unique" json:"email"`
	PasswordHash string `gorm:"size:255;not null" json:"-"` // Sembunyikan dari JSON

	Wedding Wedding `json:"wedding"` // Relasi Has One

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Wedding adalah data utama undangan
type Wedding struct {
	ID            uint   `gorm:"primarykey" json:"id"`
	UserID        uint   `gorm:"not null" json:"user_id"` // Foreign key untuk User
	WeddingTitle  string `gorm:"size:255;not null" json:"wedding_title"`
	CoverImageURL string `gorm:"size:512" json:"cover_image_url"`
	MusicURL      string `gorm:"size:512" json:"music_url"`
	ThemeColor    string `gorm:"size:50" json:"theme_color"`

	// --- TAMBAHKAN FIELD KUSTOMISASI DI SINI ---
	// 'default:true' berarti semua bagian akan tampil secara default
	ShowEvents    bool `gorm:"default:true" json:"show_events"`
	ShowStory     bool `gorm:"default:true" json:"show_story"`
	ShowGallery   bool `gorm:"default:true" json:"show_gallery"`
	ShowGifts     bool `gorm:"default:true" json:"show_gifts"`
	ShowGuestBook bool `gorm:"default:true" json:"show_guest_book"`
	// ------------------------------------------

	// Relasi
	GroomBride   GroomBride    `gorm:"foreignKey:WeddingID" json:"groom_bride"`   // Has One
	Events       []Event       `gorm:"foreignKey:WeddingID" json:"events"`        // Has Many
	Stories      []Story       `gorm:"foreignKey:WeddingID" json:"stories"`       // Has Many
	Galleries    []Gallery     `gorm:"foreignKey:WeddingID" json:"galleries"`     // Has Many
	Guests       []Guest       `gorm:"foreignKey:WeddingID" json:"guests"`        // Has Many
	GiftAccounts []GiftAccount `gorm:"foreignKey:WeddingID" json:"gift_accounts"` // <-- TAMBAHKAN RELASI INI

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// GroomBride berisi detail pasangan
type GroomBride struct {
	ID            uint   `gorm:"primarykey" json:"id"`
	WeddingID     uint   `gorm:"not null;unique" json:"wedding_id"` // Pastikan unik untuk relasi 1:1
	GroomName     string `gorm:"size:255" json:"groom_name"`
	GroomPhotoURL string `gorm:"size:512" json:"groom_photo_url"`
	GroomBio      string `gorm:"type:text" json:"groom_bio"`
	BrideName     string `gorm:"size:255" json:"bride_name"`
	BridePhotoURL string `gorm:"size:512" json:"bride_photo_url"`
	BrideBio      string `gorm:"type:text" json:"bride_bio"`
}

// Event untuk acara (misal: Akad, Resepsi)
type Event struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	WeddingID uint      `gorm:"not null" json:"wedding_id"`
	Name      string    `gorm:"size:255;not null" json:"name"`
	Date      time.Time `gorm:"type:date" json:"date"`
	StartTime string    `gorm:"size:10" json:"start_time"` // Format "HH:MM"
	EndTime   string    `gorm:"size:10" json:"end_time"`
	Address   string    `gorm:"type:text" json:"address"`
	MapsURL   string    `gorm:"size:512" json:"maps_url"`
}

// Story adalah timeline cerita
type Story struct {
	ID          uint      `gorm:"primarykey" json:"id"`
	WeddingID   uint      `gorm:"not null" json:"wedding_id"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Date        time.Time `gorm:"type:date" json:"date"`
	Description string    `gorm:"type:text" json:"description"`
	Order       int       `gorm:"default:0" json:"order"`
}

// Gallery untuk foto/video
type Gallery struct {
	ID        uint   `gorm:"primarykey" json:"id"`
	WeddingID uint   `gorm:"not null" json:"wedding_id"`
	FileURL   string `gorm:"size:512;not null" json:"file_url"`
	FileType  string `gorm:"size:50;not null" json:"file_type"` // "image" atau "video"
	Caption   string `gorm:"size:255" json:"caption"`
}

// Guest adalah tamu undangan
type Guest struct {
	ID              uint   `gorm:"primarykey" json:"id"`
	WeddingID       uint   `gorm:"not null" json:"wedding_id"`
	Name            string `gorm:"size:255;not null" json:"name"`
	Slug            string `gorm:"size:100;not null;uniqueIndex" json:"slug"` // Pakai uniqueIndex
	Group           string `gorm:"size:100" json:"group"`
	IsRSVP          bool   `gorm:"default:false" json:"is_rsvp"`
	TotalAttendance int    `gorm:"default:0" json:"total_attendance"`

	GuestBook GuestBook `gorm:"foreignKey:GuestID" json:"guest_book"` // Has One

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// GuestBook untuk ucapan
type GuestBook struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	GuestID   uint      `gorm:"not null;uniqueIndex" json:"guest_id"` // Pastikan unik
	Message   string    `gorm:"type:text;not null" json:"message"`
	Status    string    `gorm:"size:50;default:'pending'" json:"status"` // "pending" atau "approved"
	CreatedAt time.Time `json:"created_at"`
}

// GiftAccount untuk rekening bank atau e-wallet
type GiftAccount struct {
	ID            uint   `gorm:"primarykey" json:"id"`
	WeddingID     uint   `gorm:"not null" json:"wedding_id"`              // Foreign key untuk Wedding
	BankName      string `gorm:"size:100;not null" json:"bank_name"`      // Misal: "BCA", "GoPay"
	AccountNumber string `gorm:"size:100;not null" json:"account_number"` // No. Rekening / No. HP
	AccountName   string `gorm:"size:255;not null" json:"account_name"`   // Atas Nama
	QRCodeURL     string `gorm:"size:512" json:"qr_code_url"`             // URL ke gambar QRIS (Opsional)
}
