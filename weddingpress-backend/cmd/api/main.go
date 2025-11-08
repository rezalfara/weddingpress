package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"weddingpress_backend/internal/config" // Import config
	"weddingpress_backend/internal/db"
	"weddingpress_backend/internal/routes" // Import routes
)

func init() {
	// 1. Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, assuming environment variables are set")
	}

	// 2. Init Database
	db.ConnectDatabase()
	db.RunMigrations()
}

func main() {
	// 3. Init Gin Router
	r := gin.Default()

	// 4. Terapkan Middleware CORS *sebelum* rute
	r.Use(config.CORSMiddleware())

	// 5. Setup Rute (dari file routes.go)
	routes.SetupRoutes(r)

	// 6. Run Server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080" // Default port
	}

	log.Printf("Server starting on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
