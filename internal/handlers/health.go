package handlers

import (
	"net/http"
	"time"
)

// Health handles GET /health.
// It returns a simple liveness response so load balancers and deployment
// platforms (Railway, Render, Cloud Run) can confirm the service is up.
func Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"service": "proxo-backend",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}
