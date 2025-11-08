package handlers

import (
	"net/http"

	"weddingpress_backend/internal/db"
	"weddingpress_backend/internal/models"
	"weddingpress_backend/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Struct untuk binding input JSON saat register
type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// Struct untuk binding input JSON saat login
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterAdmin membuat user admin baru
func RegisterAdmin(c *gin.Context) {
	var input RegisterInput
	// Validasi input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := services.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Buat user
	user := models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: hashedPassword,
	}

	// Simpan ke DB
	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// PENTING: Kita juga harus membuat data 'Wedding' yang terasosiasi
	wedding := models.Wedding{
		UserID:       user.ID,
		WeddingTitle: "My Wedding", // Judul default
	}
	if err := db.DB.Create(&wedding).Error; err != nil {
		// (Idealnya ini dalam satu transaksi, tapi untuk simpel kita pisah)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create initial wedding data"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}

// LoginAdmin memvalidasi kredensial dan mengembalikan JWT
func LoginAdmin(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	// Cari user berdasarkan email
	if err := db.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Cek password
	if !services.CheckPasswordHash(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT
	token, err := services.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Kirim token sebagai balasan
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}
