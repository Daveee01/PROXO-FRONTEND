package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"proxo-backend/internal/config"
	"proxo-backend/internal/handlers"
	"proxo-backend/internal/middleware"
	aiservice "proxo-backend/internal/services/ai"
)

func main() {
	// Load .env if present (ignored in production where env vars are injected).
	_ = godotenv.Load()

	cfg := config.Load()
	svc := aiservice.New(cfg.OpenAIAPIKey, cfg.OpenAIModel)

	r := chi.NewRouter()

	// ── Standard middleware ──────────────────────────────────────────────────
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	// Give the entire request (including slow LLM calls) up to 95 seconds.
	r.Use(chimiddleware.Timeout(95 * time.Second))

	// ── CORS ─────────────────────────────────────────────────────────────────
	// AllowOriginFunc lets us accept any *.vercel.app subdomain in addition to
	// the explicit origins listed in ALLOWED_ORIGINS.
	frontendURL := os.Getenv("FRONTEND_URL")
	c := cors.New(cors.Options{
		AllowOriginFunc: func(origin string) bool {
			if strings.HasSuffix(origin, ".vercel.app") {
				return true
			}
			if frontendURL != "" && origin == frontendURL {
				return true
			}
			for _, allowed := range cfg.AllowedOrigins {
				if origin == allowed {
					return true
				}
			}
			return false
		},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "X-API-Key"},
		AllowCredentials: false,
		MaxAge:           300,
	})
	r.Use(c.Handler)

	// ── Routes ────────────────────────────────────────────────────────────────
	r.Get("/health", handlers.Health)

	r.Route("/api/v1", func(r chi.Router) {
		// Optional API key guard — set PROXO_API_KEY env var to enable.
		r.Use(middleware.APIKeyAuth(cfg.ProxoAPIKey))

		r.Post("/analyze", handlers.Analyze(svc))
		r.Post("/recommend", handlers.Recommend(svc))
		r.Post("/impact", handlers.Impact(svc))
	})

	log.Printf("PROXO Backend listening on :%s  (model: %s)", cfg.Port, cfg.OpenAIModel)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
