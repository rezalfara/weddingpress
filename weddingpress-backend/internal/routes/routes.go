package routes

import (
	"net/http"

	"weddingpress_backend/internal/handlers"
	"weddingpress_backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	// Grup rute /api/v1
	api := r.Group("/api/v1")
	{
		// --- Rute Autentikasi Admin ---
		api.POST("/register", handlers.RegisterAdmin)
		api.POST("/login", handlers.LoginAdmin)

		// --- Rute Admin (Terproteksi JWT) ---
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware()) // Terapkan middleware JWT
		{
			// Tes Auth
			admin.GET("/me", func(c *gin.Context) {
				userID, _ := c.Get("userID")
				c.JSON(http.StatusOK, gin.H{"message": "Authenticated", "user_id": userID})
			})

			// Upload
			admin.POST("/upload", handlers.HandleUpload)

			// Wedding (Data Utama & GroomBride)
			admin.GET("/wedding", handlers.GetMyWedding)
			admin.PUT("/wedding", handlers.UpdateMyWedding)

			// Gallery
			admin.GET("/gallery", handlers.GetGallery)
			admin.POST("/gallery", handlers.CreateGalleryItem)
			admin.DELETE("/gallery/:id", handlers.DeleteGalleryItem)

			// Event
			admin.GET("/events", handlers.GetEvents)
			admin.POST("/event", handlers.CreateEvent)
			admin.PUT("/event/:id", handlers.UpdateEvent)
			admin.DELETE("/event/:id", handlers.DeleteEvent)

			// Story
			admin.GET("/stories", handlers.GetStories)
			admin.POST("/story", handlers.CreateStory)
			admin.PUT("/story/:id", handlers.UpdateStory)
			admin.DELETE("/story/:id", handlers.DeleteStory)

			// Guest
			admin.GET("/guests", handlers.GetGuests)
			admin.GET("/guests/groups", handlers.GetGuestGroups) // <-- TAMBAHKAN RUTE INI
			admin.POST("/guest", handlers.CreateGuest)
			admin.PUT("/guest/:id", handlers.UpdateGuest)
			admin.DELETE("/guest/:id", handlers.DeleteGuest)

			// !!! INI BARIS YANG DITAMBAHKAN !!!
			admin.POST("/guests/import", handlers.ImportGuests)
			// !!! TAMBAHKAN BARIS INI !!!
			admin.DELETE("/guest/bulk", handlers.DeleteGuestsBulk)

			// GuestBook (Admin)
			admin.GET("/guestbook", handlers.GetGuestBookAdmin)
			admin.PUT("/guestbook/:id", handlers.UpdateGuestBookStatus) // Approve/Reject
			admin.DELETE("/guestbook/:id", handlers.DeleteGuestBook)

			// === TAMBAHKAN RUTE BARU DI SINI ===
			// Gift Accounts (Amplop Digital)
			admin.GET("/gift-accounts", handlers.GetGiftAccounts)
			admin.POST("/gift-account", handlers.CreateGiftAccount)
			admin.PUT("/gift-account/:id", handlers.UpdateGiftAccount)
			admin.DELETE("/gift-account/:id", handlers.DeleteGiftAccount)
		}

		// --- Rute Publik (Untuk Halaman Undangan) ---
		api.GET("/invitation/slug/:guest_slug", handlers.GetInvitationBySlug)
		api.POST("/rsvp/:guest_id", handlers.PostRSVP)
		api.POST("/guestbook/:guest_id", handlers.PostGuestBook)
		api.GET("/guestbook/:wedding_id", handlers.GetGuestBook) // Versi publik (hanya yg approved)
	}

	// Rute tes PING
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})
}
