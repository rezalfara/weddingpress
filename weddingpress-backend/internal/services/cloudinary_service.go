package services

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"os"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// UploadToCloudinary mengunggah file dan mengembalikan URL-nya
func UploadToCloudinary(file *multipart.FileHeader) (string, error) {
	// Ambil URL Cloudinary dari .env
	cldURL := os.Getenv("CLOUDINARY_URL")
	if cldURL == "" {
		return "", errors.New("CLOUDINARY_URL not found in environment")
	}

	cld, err := cloudinary.NewFromURL(cldURL)
	if err != nil {
		return "", fmt.Errorf("failed to initialize Cloudinary: %v", err)
	}

	// Atur konteks dengan timeout
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second) // 20 detik timeout
	defer cancel()

	// Buka file yang diupload
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %v", err)
	}
	defer src.Close()

	// Tentukan parameter upload
	uploadParams := uploader.UploadParams{
		Folder:       "weddingpress", // Nama folder di Cloudinary
		ResourceType: "auto",         // Deteksi tipe file otomatis (gambar, video, raw)
	}

	// Upload file
	uploadResult, err := cld.Upload.Upload(ctx, src, uploadParams)
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %v", err)
	}

	// Kembalikan URL aman (https)
	return uploadResult.SecureURL, nil
}
