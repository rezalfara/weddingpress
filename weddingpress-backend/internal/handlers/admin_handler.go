package handlers

import (
	"net/http"
	"time"

	"weddingpress_backend/internal/db"
	"weddingpress_backend/internal/models"
	"weddingpress_backend/internal/services" // Import utils kita

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Helper untuk mengambil WeddingID dari UserID yang terautentikasi
// Ini adalah KUNCI dari multi-tenancy kita (admin hanya bisa edit data miliknya)
func getWeddingIDFromAuth(c *gin.Context) (uint, error) {
	// Ambil userID yang diset oleh middleware
	userIDInterface, exists := c.Get("userID")
	if !exists {
		return 0, gorm.ErrRecordNotFound
	}

	// Konversi interface ke uint
	userID, ok := userIDInterface.(uint)
	if !ok {
		return 0, gorm.ErrRecordNotFound
	}

	var wedding models.Wedding
	// Cari wedding yang dimiliki oleh user ini
	if err := db.DB.Where("user_id = ?", userID).First(&wedding).Error; err != nil {
		return 0, err
	}
	return wedding.ID, nil
}

// --- Wedding Handler ---

// GetMyWedding mengambil data wedding & groom/bride milik admin
func GetMyWedding(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found for this user"})
		return
	}

	var wedding models.Wedding
	// Ambil Wedding dan preload GroomBride
	if err := db.DB.
		Preload("GroomBride").
		First(&wedding, weddingID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Failed to fetch wedding data"})
		return
	}
	c.JSON(http.StatusOK, wedding)
}

// UpdateMyWedding memperbarui data wedding (termasuk GroomBride)
type UpdateWeddingInput struct {
	WeddingTitle  string            `json:"wedding_title"`
	CoverImageURL string            `json:"cover_image_url"`
	MusicURL      string            `json:"music_url"`
	ThemeColor    string            `json:"theme_color"`
	GroomBride    models.GroomBride `json:"groom_bride"`
}

func UpdateMyWedding(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var input UpdateWeddingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Gunakan Transaksi untuk memastikan konsistensi data
	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Update data Wedding
	wedding := models.Wedding{ID: weddingID}
	if err := tx.Model(&wedding).Updates(models.Wedding{
		WeddingTitle:  input.WeddingTitle,
		CoverImageURL: input.CoverImageURL,
		MusicURL:      input.MusicURL,
		ThemeColor:    input.ThemeColor,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update wedding"})
		return
	}

	// 2. Update data GroomBride (Upsert)
	groomBride := input.GroomBride
	groomBride.WeddingID = weddingID

	// FirstOrCreate: Cari berdasarkan WeddingID, jika tidak ada, buat baru.
	// Assign: Jika ditemukan, update dengan data groomBride.
	if err := tx.Where(models.GroomBride{WeddingID: weddingID}).Assign(groomBride).FirstOrCreate(&groomBride).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update groom/bride"})
		return
	}

	// Commit transaksi
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Wedding updated successfully"})
}

// --- Gallery Handlers ---

// GetGallery mengambil semua item galeri untuk wedding ini
func GetGallery(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var galleries []models.Gallery
	if err := db.DB.Where("wedding_id = ?", weddingID).Find(&galleries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch gallery"})
		return
	}

	c.JSON(http.StatusOK, galleries)
}

type CreateGalleryInput struct {
	FileURL  string `json:"file_url" binding:"required"`
	FileType string `json:"file_type" binding:"required"` // "image" atau "video"
	Caption  string `json:"caption"`
}

func CreateGalleryItem(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var input CreateGalleryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	galleryItem := models.Gallery{
		WeddingID: weddingID,
		FileURL:   input.FileURL,
		FileType:  input.FileType,
		Caption:   input.Caption,
	}

	if err := db.DB.Create(&galleryItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save gallery item"})
		return
	}
	c.JSON(http.StatusCreated, galleryItem)
}

func DeleteGalleryItem(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	galleryID := c.Param("id") // Ambil ID galeri dari URL

	var galleryItem models.Gallery
	// PENTING: Cek apakah item ini milik wedding yang sedang login
	if err := db.DB.Where("id = ? AND wedding_id = ?", galleryID, weddingID).First(&galleryItem).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gallery item not found"})
		return
	}

	if err := db.DB.Delete(&galleryItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Gallery item deleted"})
}

// --- Event Handlers ---

func GetEvents(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var events []models.Event
	if err := db.DB.Where("wedding_id = ?", weddingID).Order("date ASC").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

type EventInput struct {
	Name      string    `json:"name" binding:"required"`
	Date      time.Time `json:"date" binding:"required"`
	StartTime string    `json:"start_time"`
	EndTime   string    `json:"end_time"`
	Address   string    `json:"address"`
	MapsURL   string    `json:"maps_url"`
}

func CreateEvent(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var input EventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event := models.Event{
		WeddingID: weddingID,
		Name:      input.Name,
		Date:      input.Date,
		StartTime: input.StartTime,
		EndTime:   input.EndTime,
		Address:   input.Address,
		MapsURL:   input.MapsURL,
	}

	if err := db.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}
	c.JSON(http.StatusCreated, event)
}

func UpdateEvent(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	eventID := c.Param("id")
	var input EventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var event models.Event
	// Cek apakah event ada dan milik wedding ini
	if err := db.DB.Where("id = ? AND wedding_id = ?", eventID, weddingID).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Update model
	event.Name = input.Name
	event.Date = input.Date
	event.StartTime = input.StartTime
	event.EndTime = input.EndTime
	event.Address = input.Address
	event.MapsURL = input.MapsURL

	if err := db.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}
	c.JSON(http.StatusOK, event)
}

func DeleteEvent(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	eventID := c.Param("id")
	var event models.Event
	if err := db.DB.Where("id = ? AND wedding_id = ?", eventID, weddingID).First(&event).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if err := db.DB.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Event deleted"})
}

// --- Story Handlers ---

func GetStories(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var stories []models.Story
	// Perhatikan: "order" adalah keyword SQL, perlu di-escape
	if err := db.DB.Where("wedding_id = ?", weddingID).Order("\"order\" ASC").Find(&stories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stories"})
		return
	}

	c.JSON(http.StatusOK, stories)
}

type StoryInput struct {
	Title       string    `json:"title" binding:"required"`
	Date        time.Time `json:"date" binding:"required"`
	Description string    `json:"description"`
	Order       int       `json:"order"`
}

func CreateStory(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var input StoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	story := models.Story{
		WeddingID:   weddingID,
		Title:       input.Title,
		Date:        input.Date,
		Description: input.Description,
		Order:       input.Order,
	}

	if err := db.DB.Create(&story).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create story"})
		return
	}
	c.JSON(http.StatusCreated, story)
}

func UpdateStory(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	storyID := c.Param("id")
	var input StoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var story models.Story
	if err := db.DB.Where("id = ? AND wedding_id = ?", storyID, weddingID).First(&story).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Story not found"})
		return
	}

	story.Title = input.Title
	story.Date = input.Date
	story.Description = input.Description
	story.Order = input.Order

	if err := db.DB.Save(&story).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update story"})
		return
	}
	c.JSON(http.StatusOK, story)
}

func DeleteStory(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	storyID := c.Param("id")
	var story models.Story
	if err := db.DB.Where("id = ? AND wedding_id = ?", storyID, weddingID).First(&story).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Story not found"})
		return
	}

	if err := db.DB.Delete(&story).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete story"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Story deleted"})
}

// --- Guest Handlers ---

func GetGuests(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var guests []models.Guest
	if err := db.DB.Where("wedding_id = ?", weddingID).Order("created_at DESC").Find(&guests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch guests"})
		return
	}

	c.JSON(http.StatusOK, guests)
}

type GuestInput struct {
	Name  string `json:"name" binding:"required"`
	Group string `json:"group"`
}

func CreateGuest(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var input GuestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buat slug unik
	baseSlug := services.Slugify(input.Name)
	slug := baseSlug
	var count int64

	// Loop untuk memastikan slug unik
	for i := 1; ; i++ {
		db.DB.Model(&models.Guest{}).Where("slug = ?", slug).Count(&count)
		if count == 0 {
			break // Slug unik ditemukan
		}
		// Jika sudah ada, tambahkan suffix acak
		slug = baseSlug + "-" + services.RandomString(4)
	}

	guest := models.Guest{
		WeddingID: weddingID,
		Name:      input.Name,
		Slug:      slug,
		Group:     input.Group,
	}

	if err := db.DB.Create(&guest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create guest"})
		return
	}

	c.JSON(http.StatusCreated, guest)
}

func UpdateGuest(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	guestID := c.Param("id")
	var input GuestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var guest models.Guest
	if err := db.DB.Where("id = ? AND wedding_id = ?", guestID, weddingID).First(&guest).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guest not found"})
		return
	}

	guest.Name = input.Name
	guest.Group = input.Group
	// (Note: Slug tidak di-update untuk menjaga stabilitas URL)

	if err := db.DB.Save(&guest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update guest"})
		return
	}
	c.JSON(http.StatusOK, guest)
}

func DeleteGuest(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	guestID := c.Param("id")
	var guest models.Guest
	if err := db.DB.Where("id = ? AND wedding_id = ?", guestID, weddingID).First(&guest).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guest not found"})
		return
	}

	// Hapus juga guestbook terkait (opsional, tergantung GORM/DB constraint)
	// GORM akan error jika ada foreign key constraint, jadi lebih baik hapus manual
	db.DB.Where("guest_id = ?", guest.ID).Delete(&models.GuestBook{})

	if err := db.DB.Delete(&guest).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete guest"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Guest deleted"})
}

// --- GuestBook Admin Handlers ---

type AdminGuestBookResponse struct {
	ID        uint      `json:"id"`
	GuestID   uint      `json:"guest_id"`
	GuestName string    `json:"guest_name"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// GetGuestBookAdmin mengambil semua ucapan (pending & approved)
func GetGuestBookAdmin(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	var results []AdminGuestBookResponse

	err = db.DB.Table("guest_books").
		Select("guest_books.id, guest_books.guest_id, guests.name as guest_name, guest_books.message, guest_books.status, guest_books.created_at").
		Joins("JOIN guests ON guests.id = guest_books.guest_id").
		Where("guests.wedding_id = ?", weddingID).
		Order("guest_books.created_at DESC").
		Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch guestbook entries"})
		return
	}

	c.JSON(http.StatusOK, results)
}

type UpdateGuestBookStatusInput struct {
	Status string `json:"status" binding:"required"` // "pending" atau "approved"
}

// UpdateGuestBookStatus mengubah status ucapan (approve/reject)
func UpdateGuestBookStatus(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	guestBookID := c.Param("id")
	var input UpdateGuestBookStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validasi status
	if input.Status != "approved" && input.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	var guestBook models.GuestBook
	// Query untuk memastikan admin hanya bisa update guestbook milik wedding-nya
	err = db.DB.Joins("JOIN guests ON guests.id = guest_books.guest_id").
		Where("guests.wedding_id = ? AND guest_books.id = ?", weddingID, guestBookID).
		First(&guestBook).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guestbook entry not found"})
		return
	}

	guestBook.Status = input.Status
	if err := db.DB.Save(&guestBook).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Guestbook status updated"})
}

// DeleteGuestBook menghapus ucapan (jika spam, dll)
func DeleteGuestBook(c *gin.Context) {
	weddingID, err := getWeddingIDFromAuth(c)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wedding not found"})
		return
	}

	guestBookID := c.Param("id")
	var guestBook models.GuestBook

	err = db.DB.Joins("JOIN guests ON guests.id = guest_books.guest_id").
		Where("guests.wedding_id = ? AND guest_books.id = ?", weddingID, guestBookID).
		First(&guestBook).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Guestbook entry not found"})
		return
	}

	if err := db.DB.Delete(&guestBook).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete guestbook entry"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Guestbook entry deleted"})
}
