package config

import (
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	// Ambil origin client dari .env
	clientOrigin := os.Getenv("CLIENT_ORIGIN")
	if clientOrigin == "" {
		clientOrigin = "http://localhost:3000" // Default fallback
	}

	return cors.New(cors.Config{
		// Izinkan frontend Anda
		AllowOrigins: []string{clientOrigin},
		// Izinkan metode HTTP
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		// Izinkan header
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		// Expose header tertentu
		ExposeHeaders: []string{"Content-Length"},
		// Izinkan kredensial (cookies)
		AllowCredentials: true,
		// Cache preflight request
		MaxAge: 12 * time.Hour,
	})
}
