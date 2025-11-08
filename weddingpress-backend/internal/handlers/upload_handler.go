package handlers

import (
	"log"
	"net/http"

	"weddingpress_backend/internal/services"

	"github.com/gin-gonic/gin"
)

// HandleUpload menangani upload file tunggal
func HandleUpload(c *gin.Context) {
	// Ambil file dari form-data dengan nama "file"
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded. Make sure the field name is 'file'"})
		return
	}

	// (Opsional) Cek userID dari context untuk logging
	userID, _ := c.Get("userID")
	log.Printf("User %d is uploading a file...", userID)

	// Panggil service upload
	url, err := services.UploadToCloudinary(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Kembalikan URL file yang sudah di-upload
	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"url":     url,
	})
}
