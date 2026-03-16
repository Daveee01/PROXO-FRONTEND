package handlers

import (
	"encoding/json"
	"net/http"

	"proxo-backend/internal/models"
)

// writeJSON serialises v as JSON and writes it with the given HTTP status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// writeError writes a JSON error response.
func writeError(w http.ResponseWriter, status int, message string, details ...string) {
	resp := models.ErrorResponse{Error: message}
	if len(details) > 0 {
		resp.Details = details[0]
	}
	writeJSON(w, status, resp)
}
