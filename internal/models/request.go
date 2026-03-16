package models

import "fmt"

// Location represents a geographic coordinate pair.
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address,omitempty"`
}

// Validate returns an error if the coordinates are outside valid ranges.
func (l Location) Validate() error {
	if l.Latitude < -90 || l.Latitude > 90 {
		return fmt.Errorf("latitude must be between -90 and 90, got %f", l.Latitude)
	}
	if l.Longitude < -180 || l.Longitude > 180 {
		return fmt.Errorf("longitude must be between -180 and 180, got %f", l.Longitude)
	}
	return nil
}

// AnalyzeRequest is the input for the POST /api/v1/analyze endpoint.
type AnalyzeRequest struct {
	Location     Location `json:"location"`
	AreaSqMeters float64  `json:"areaSqMeters,omitempty"`
}

// RecommendRequest is the input for the POST /api/v1/recommend endpoint.
type RecommendRequest struct {
	Location     Location `json:"location"`
	AreaSqMeters float64  `json:"areaSqMeters,omitempty"`
	// Preferences is an optional list of desired traits, e.g. "fast-growing", "native", "drought-resistant".
	Preferences []string `json:"preferences,omitempty"`
}

// PlantedTree describes a tree species and quantity that the user intends to plant.
type PlantedTree struct {
	TreeID   string `json:"treeId"`
	TreeName string `json:"treeName"`
	Count    int    `json:"count"`
}

// ImpactRequest is the input for the POST /api/v1/impact endpoint.
type ImpactRequest struct {
	Location Location      `json:"location"`
	Trees    []PlantedTree `json:"trees"`
}
