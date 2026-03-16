package models

// AnalyzeResponse is the payload returned by POST /api/v1/analyze.
// Field names use camelCase JSON tags to match the existing frontend conventions.
type AnalyzeResponse struct {
	ClimateZone        string  `json:"climateZone"`
	Region             string  `json:"region"`
	EstimatedCO2PPM    float64 `json:"estimatedCO2PPM"`
	AirQualityCategory string  `json:"airQualityCategory"`
	AnnualRainfallMM   float64 `json:"annualRainfallMM"`
	AvgTemperatureC    float64 `json:"avgTemperatureC"`
	BiomeType          string  `json:"biomeType"`
	PlantingViability  string  `json:"plantingViability"`
	AIAnalysis         string  `json:"aiAnalysis"`
}

// TreeRecommendation mirrors the Tree interface consumed by the frontend's
// AIRecommendationCard and TreeInfoCard components exactly.
type TreeRecommendation struct {
	// ID is assigned sequentially (1 = best match).
	ID             int     `json:"id"`
	Name           string  `json:"name"`
	ScientificName string  `json:"scientificName"`
	// CO2PerYear is kilograms of CO2 absorbed per year at maturity.
	CO2PerYear     float64 `json:"co2PerYear"`
	// WaterRetention is litres of water retained per year.
	WaterRetention float64 `json:"waterRetention"`
	// OxygenProduced is kilograms of O2 produced per year.
	OxygenProduced float64 `json:"oxygenProduced"`
	// MatchScore is 0–100 and reflects how well the species suits the location.
	MatchScore     int     `json:"matchScore"`
	// Reason is shown as the AI recommendation insight in the frontend cards.
	Reason         string  `json:"reason"`
	// Color is a CSS hex colour assigned by the backend for the tree indicator UI.
	Color          string  `json:"color"`
}

// RecommendResponse is the payload returned by POST /api/v1/recommend.
type RecommendResponse struct {
	Trees       []TreeRecommendation `json:"trees"`
	ClimateZone string               `json:"climateZone"`
	Region      string               `json:"region"`
	// AIReasoning is a brief narrative explaining the recommendation strategy.
	AIReasoning string               `json:"aiReasoning"`
}

// TimelinePoint represents the cumulative environmental impact at a given year.
type TimelinePoint struct {
	Year             int     `json:"year"`
	CO2AbsorbedKg    float64 `json:"co2AbsorbedKg"`
	OxygenProducedKg float64 `json:"oxygenProducedKg"`
}

// ImpactResponse is the payload returned by POST /api/v1/impact.
type ImpactResponse struct {
	TotalCO2PerYearKg           float64         `json:"totalCO2PerYearKg"`
	TotalOxygenPerDayKg         float64         `json:"totalOxygenPerDayKg"`
	OxygenImprovementPercent    float64         `json:"oxygenImprovementPercent"`
	AirQualityImprovementPts    int             `json:"airQualityImprovementPts"`
	WaterRetentionLitersPerYear float64         `json:"waterRetentionLitersPerYear"`
	TemperatureReductionC       float64         `json:"temperatureReductionC"`
	CarbonSequestration10YearKg float64         `json:"carbonSequestration10YearKg"`
	ProjectedTimeline           []TimelinePoint `json:"projectedTimeline"`
	AIAnalysis                  string          `json:"aiAnalysis"`
}

// ErrorResponse is returned for all 4xx/5xx responses.
type ErrorResponse struct {
	Error   string `json:"error"`
	Details string `json:"details,omitempty"`
}
