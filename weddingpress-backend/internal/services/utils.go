package services

import (
	"math/rand"
	"regexp"
	"strings"
	"time"
)

// Definisikan regex untuk karakter non-alphanumeric
// Ini akan mencocokkan apa pun yang BUKAN huruf a-z, angka 0-9
var nonAlphanumericRegex = regexp.MustCompile(`[^a-z0-9]+`)

// Slugify mengubah string menjadi slug yang ramah URL
func Slugify(s string) string {
	s = strings.ToLower(s)                            // Ubah ke lowercase
	s = nonAlphanumericRegex.ReplaceAllString(s, "-") // Ganti non-alphanum dengan strip
	s = strings.Trim(s, "-")                          // Hapus strip di awal/akhir
	return s
}

// Buat seeded random generator
// Kita gunakan sumber acak baru yang di-seed dengan waktu saat ini
var seededRand *rand.Rand = rand.New(rand.NewSource(time.Now().UnixNano()))

const charset = "abcdefghijklmnopqrstuvwxyz0123456789"

// RandomString membuat string acak dengan panjang tertentu
func RandomString(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}
