package handlers

import (
	"net/http"
	"strings"
	"time"

	"weddingpress_backend/internal/db"
	"weddingpress_backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// InvitationData adalah struct gabungan untuk respons JSON
type InvitationData struct {
	Guest   models.Guest   `json:"guest"`
	Wedding models.Wedding `json:"wedding"` // Termasuk semua relasi (GroomBride, Events, dll)
}

// GetInvitationBySlug adalah handler publik utama
func GetInvitationBySlug(c *gin.Context) {
	slug := c.Param("guest_slug")

	var guest models.Guest
	// 1. Cari tamu berdasarkan slug
	// Kita juga preload GuestBook milik tamu ini
	if err := db.DB.Preload("GuestBook").Where("slug = ?", slug).First(&guest).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Undangan tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error saat mencari tamu"})
		return
	}

	var wedding models.Wedding
	// 2. Ambil data Wedding terkait, dan PRELOAD semua relasi
	if err := db.DB.
		Preload("GroomBride").
		Preload("Events").
		Preload("Stories", func(db *gorm.DB) *gorm.DB {
			return db.Order("stories.\"order\" ASC") // Urutkan story
		}).
		Preload("Galleries").
		Preload("GiftAccounts"). // <-- TAMBAHKAN PRELOAD INI
		First(&wedding, guest.WeddingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data pernikahan tidak ditemukan"})
		return
	}

	// 3. Gabungkan data
	data := InvitationData{
		Guest:   guest,
		Wedding: wedding,
	}

	c.JSON(http.StatusOK, data)
}

// Struct untuk input RSVP
type RSVPInput struct {
	TotalAttendance int `json:"total_attendance"`
}

// PostRSVP untuk tamu mengkonfirmasi kehadiran
func PostRSVP(c *gin.Context) {
	guestID := c.Param("guest_id")

	var input RSVPInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	var guest models.Guest
	if err := db.DB.First(&guest, guestID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tamu tidak ditemukan"})
		return
	}

	// Update data tamu
	guest.IsRSVP = true
	// Pastikan jumlah tamu tidak negatif
	if input.TotalAttendance < 0 {
		input.TotalAttendance = 0
	}
	guest.TotalAttendance = input.TotalAttendance

	if err := db.DB.Save(&guest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan RSVP"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "RSVP berhasil disimpan"})
}

// Struct untuk input GuestBook
type GuestBookInput struct {
	Message string `json:"message" binding:"required"`
}

// PostGuestBook untuk tamu mengirim ucapan
func PostGuestBook(c *gin.Context) {
	guestID := c.Param("guest_id")

	var input GuestBookInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesan tidak boleh kosong"})
		return
	}

	// Cek apakah tamu valid
	var guest models.Guest
	if err := db.DB.First(&guest, guestID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tamu tidak ditemukan"})
		return
	}

	// Buat entri GuestBook baru
	guestBook := models.GuestBook{
		GuestID: guest.ID,
		Message: input.Message,
		Status:  "pending", // Admin harus approve
	}

	// Cek jika sudah pernah post, update saja (Upsert)
	// GORM akan otomatis update jika ada konflik di GuestID (karena unique)
	// Kita gunakan Save() yang bertindak sebagai Upsert untuk struct
	if err := db.DB.Save(&guestBook).Error; err != nil {
		// Jika error bukan karena duplikat, tampilkan error
		if !strings.Contains(err.Error(), "duplicate key") {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan ucapan"})
			return
		}
		// Jika duplikat, kita update saja pesan dan set status kembali ke pending
		guestBook.Status = "pending"
		if err := db.DB.Where("guest_id = ?", guest.ID).Updates(&guestBook).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui ucapan"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Ucapan berhasil dikirim, menunggu persetujuan"})
}

// GetGuestBook mengambil ucapan yang sudah "approved"
func GetGuestBook(c *gin.Context) {
	weddingID := c.Param("wedding_id")

	type GuestBookResponse struct {
		GuestName string    `json:"guest_name"`
		Message   string    `json:"message"`
		CreatedAt time.Time `json:"created_at"`
	}

	var results []GuestBookResponse

	// Query ini join tabel guest_books dengan guests
	// lalu filter berdasarkan wedding_id DAN status 'approved'
	err := db.DB.Table("guest_books").
		Select("guests.name as guest_name, guest_books.message, guest_books.created_at").
		Joins("JOIN guests ON guests.id = guest_books.guest_id").
		Where("guests.wedding_id = ? AND guest_books.status = ?", weddingID, "approved").
		Order("guest_books.created_at DESC").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil ucapan"})
		return
	}

	c.JSON(http.StatusOK, results)
}
