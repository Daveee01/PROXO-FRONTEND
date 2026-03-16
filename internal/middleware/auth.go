package middleware

import (
	"net/http"
)

// APIKeyAuth returns a middleware that validates the X-API-Key request header.
// If apiKey is empty (not configured), the middleware is a no-op — useful for
// local development without authentication.
func APIKeyAuth(apiKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if apiKey == "" {
				// Auth disabled — skip. Set PROXO_API_KEY in production.
				next.ServeHTTP(w, r)
				return
			}

			key := r.Header.Get("X-API-Key")
			if key == "" {
				// Accept query param as a fallback for browser-based testing.
				key = r.URL.Query().Get("api_key")
			}

			if key != apiKey {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte(`{"error":"unauthorized","details":"valid X-API-Key header required"}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
