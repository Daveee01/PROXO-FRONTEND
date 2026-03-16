package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"proxo-backend/internal/models"
	aiservice "proxo-backend/internal/services/ai"
)

// Recommend returns the top 3 AI-powered tree recommendations for a location.
// POST /api/v1/recommend
//
// Request body:
//
//	{
//	  "location": { "latitude": 0.0, "longitude": 0.0 },
//	  "areaSqMeters": 100,
//	  "preferences": ["native", "fast-growing"]   // optional
//	}
//
// The response trees match the Tree interface consumed by the frontend's
// AIRecommendationCard and TreeInfoCard components directly (camelCase JSON).
func Recommend(svc *aiservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

		var req models.RecommendRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body", err.Error())
			return
		}

		if err := req.Location.Validate(); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		if req.AreaSqMeters <= 0 {
			req.AreaSqMeters = 100
		}

		ctx, cancel := context.WithTimeout(r.Context(), 90*time.Second)
		defer cancel()

		result, err := svc.RecommendTrees(ctx,
			req.Location.Latitude, req.Location.Longitude,
			req.AreaSqMeters, req.Preferences)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "tree recommendation failed", err.Error())
			return
		}

		writeJSON(w, http.StatusOK, result)
	}
}
