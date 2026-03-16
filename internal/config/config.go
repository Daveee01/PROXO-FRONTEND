package config

import (
	"log"
	"os"
	"strings"
)

// Config holds all runtime configuration loaded from environment variables.
type Config struct {
	OpenAIAPIKey   string
	OpenAIModel    string
	ProxoAPIKey    string // optional: protects /api/v1 routes
	AllowedOrigins []string
	Port           string
}

// Load reads configuration from environment variables (and .env if present).
// .env loading must be done by the caller (main) before calling Load.
// It fatally logs if required variables are missing.
func Load() *Config {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		log.Fatal("OPENAI_API_KEY environment variable is required")
	}

	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	origins := parseOrigins(os.Getenv("ALLOWED_ORIGINS"))

	return &Config{
		OpenAIAPIKey:   apiKey,
		OpenAIModel:    model,
		ProxoAPIKey:    os.Getenv("PROXO_API_KEY"),
		AllowedOrigins: origins,
		Port:           port,
	}
}

func parseOrigins(raw string) []string {
	defaults := []string{"http://localhost:3000"}
	if raw == "" {
		return defaults
	}
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	if len(origins) == 0 {
		return defaults
	}
	return origins
}
