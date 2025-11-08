package db

import (
	"fmt"
	"log"
	"os"

	"weddingpress_backend/internal/models" // Import models kita

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Membangun Data Source Name (DSN) dari .env
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASS"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
		os.Getenv("SSL_MODE"),
	)

	// Membuka koneksi ke database
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Log semua kueri SQL di console
	})

	if err != nil {
		log.Fatal("Failed to connect to database!", err)
	}

	log.Println("Database connection successful.")
	DB = database // Assign koneksi ke variabel global DB
}

func RunMigrations() {
	log.Println("Running database migrations...")

	// AutoMigrate akan membuat/memperbarui tabel berdasarkan struct model
	err := DB.AutoMigrate(
		&models.User{},
		&models.Wedding{},
		&models.GroomBride{},
		&models.Event{},
		&models.Story{},
		&models.Gallery{},
		&models.Guest{},
		&models.GuestBook{},
	)

	if err != nil {
		log.Fatal("Failed to run migrations!", err)
	}

	log.Println("Database migrations successful.")
}
