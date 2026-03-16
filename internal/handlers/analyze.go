package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	aiservice "proxo-backend/internal/services/ai"
	"proxo-backend/internal/models"
)

// Analyze returns an environmental baseline analysis for a given location.
// POST /api/v1/analyze
//
// Request body:
//
//	{ "location": { "latitude": 0.0, "longitude": 0.0 }, "areaSqMeters": 100 }
func Analyze(svc *aiservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB limit

		var req models.AnalyzeRequest
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

		result, err := svc.AnalyzeLocation(ctx, req.Location.Latitude, req.Location.Longitude, req.AreaSqMeters)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "analysis failed", err.Error())
			return
		}

		writeJSON(w, http.StatusOK, result)
	}
}
