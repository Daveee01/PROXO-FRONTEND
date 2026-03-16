package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"proxo-backend/internal/models"
	aiservice "proxo-backend/internal/services/ai"
)

// Impact calculates the projected environmental impact of a tree-planting plan.
// POST /api/v1/impact
//
// Request body:
//
//	{
//	  "location": { "latitude": 0.0, "longitude": 0.0 },
//	  "trees": [
//	    { "treeId": "oak-1", "treeName": "White Oak", "count": 3 }
//	  ]
//	}
func Impact(svc *aiservice.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

		var req models.ImpactRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid request body", err.Error())
			return
		}

		if err := req.Location.Validate(); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		if len(req.Trees) == 0 {
			writeError(w, http.StatusBadRequest, "at least one tree is required")
			return
		}

		// Sanity-check individual tree entries.
		for _, t := range req.Trees {
			if t.TreeName == "" {
				writeError(w, http.StatusBadRequest, "each tree must have a treeName")
				return
			}
			if t.Count <= 0 {
				writeError(w, http.StatusBadRequest, "tree count must be greater than zero")
				return
			}
		}

		ctx, cancel := context.WithTimeout(r.Context(), 90*time.Second)
		defer cancel()

		result, err := svc.CalculateImpact(ctx,
			req.Location.Latitude, req.Location.Longitude,
			req.Trees)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "impact calculation failed", err.Error())
			return
		}

		writeJSON(w, http.StatusOK, result)
	}
}
