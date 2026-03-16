// Package ai provides an LLM-backed service for environmental analysis and
// tree recommendations. It calls the OpenAI Chat Completions API in JSON mode
// so that every response is a well-formed JSON object that can be decoded
// directly into the backend's model types.
package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"proxo-backend/internal/models"
	"proxo-backend/internal/services/geo"

	"github.com/sashabaranov/go-openai"
)

// treeColors is the UI colour palette assigned to recommended trees by rank.
// Index 0 = best match (emerald), 1 = second (blue), 2 = third (violet).
var treeColors = []string{"#22c55e", "#3b82f6", "#a855f7"}

// Service wraps an OpenAI client and exposes domain-specific AI methods.
type Service struct {
	client *openai.Client
	model  string
}

// New creates a Service using the given OpenAI API key and model identifier.
func New(apiKey, model string) *Service {
	return &Service{
		client: openai.NewClient(apiKey),
		model:  model,
	}
}

// AnalyzeLocation returns an environmental baseline analysis for the given
// coordinates and optional planting area.
func (s *Service) AnalyzeLocation(ctx context.Context, lat, lng, areaSqM float64) (*models.AnalyzeResponse, error) {
	climate := geo.EnrichClimateInfo(ctx, geo.GetClimateInfo(lat, lng), lat, lng)

	prompt := fmt.Sprintf(`You are an expert environmental scientist. Analyze the environmental baseline for this location.

Coordinates: %.6f°, %.6f°
Climate Zone: %s
Region: %s
Biome: %s
Estimated Annual Rainfall: %.0f mm
Estimated Average Temperature: %.1f°C
Current Weather: %s
Planting Area: %.0f sq meters

Respond ONLY with valid JSON using exactly these keys:
{
  "estimatedCO2PPM": <number — typical urban ~420–450, rural ~415, industrial area ~450–500>,
  "airQualityCategory": "<Excellent|Good|Moderate|Poor|Very Poor>",
  "plantingViability": "<Excellent|Good|Fair|Challenging|Very Challenging>",
  "biomeType": "<refined biome description, 2–4 words>",
  "aiAnalysis": "<2–3 sentences describing the current environmental state, challenges, and planting opportunity specific to this region>"
}`,
		lat, lng,
		climate.Zone, climate.Region, climate.BiomeType,
		climate.AnnualRainfallMM, climate.AvgTemperatureC,
		climate.WeatherSummary(),
		areaSqM,
	)

	content, err := s.callJSON(ctx,
		"You are an environmental analysis API. Respond only with valid JSON.",
		prompt, 400)
	if err != nil {
		return nil, err
	}

	var data struct {
		EstimatedCO2PPM    float64 `json:"estimatedCO2PPM"`
		AirQualityCategory string  `json:"airQualityCategory"`
		PlantingViability  string  `json:"plantingViability"`
		BiomeType          string  `json:"biomeType"`
		AIAnalysis         string  `json:"aiAnalysis"`
	}
	if err := json.Unmarshal([]byte(content), &data); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &models.AnalyzeResponse{
		ClimateZone:        climate.Zone,
		Region:             climate.Region,
		EstimatedCO2PPM:    data.EstimatedCO2PPM,
		AirQualityCategory: data.AirQualityCategory,
		AnnualRainfallMM:   climate.AnnualRainfallMM,
		AvgTemperatureC:    climate.AvgTemperatureC,
		BiomeType:          data.BiomeType,
		PlantingViability:  data.PlantingViability,
		AIAnalysis:         data.AIAnalysis,
	}, nil
}

// RecommendTrees returns exactly 3 ranked tree recommendations for the given
// location. The returned tree objects match the Tree interface used by the
// frontend's AIRecommendationCard and TreeInfoCard components.
func (s *Service) RecommendTrees(ctx context.Context, lat, lng, areaSqM float64, preferences []string) (*models.RecommendResponse, error) {
	climate := geo.EnrichClimateInfo(ctx, geo.GetClimateInfo(lat, lng), lat, lng)

	prefStr := "none specified"
	if len(preferences) > 0 {
		prefStr = strings.Join(preferences, ", ")
	}

	prompt := fmt.Sprintf(`You are an expert arborist specialising in urban forestry and sustainable planting.

Location: %.6f°, %.6f°
Climate Zone: %s
Region: %s
Biome: %s
Annual Rainfall: %.0f mm
Average Temperature: %.1f°C
Hardiness Zone: %s
Current Weather: %s
Planting Area: %.0f sq meters
User Preferences: %s

Recommend exactly 3 tree species best suited for this location. Order them from best to least suitable — the first must have the highest matchScore.

Respond ONLY with valid JSON using exactly these keys:
{
  "trees": [
    {
      "name": "<common name>",
      "scientificName": "<Genus species>",
      "co2PerYear": <number — realistic kg CO2 absorbed per mature tree per year>,
      "waterRetention": <number — litres of water retained per year>,
      "oxygenProduced": <number — kg O2 produced per year>,
      "matchScore": <integer 75–99, strictly decreasing across the three trees>,
      "reason": "<1–2 sentences: why this tree is ideal for THIS exact region and its standout environmental benefit>"
    }
  ],
  "aiReasoning": "<2–3 sentences explaining the overall recommendation strategy for this climate and region>"
}`,
		lat, lng,
		climate.Zone, climate.Region, climate.BiomeType,
		climate.AnnualRainfallMM, climate.AvgTemperatureC, climate.HardinessZone,
		climate.WeatherSummary(),
		areaSqM, prefStr,
	)

	content, err := s.callJSON(ctx,
		"You are a tree recommendation API. Respond only with valid JSON containing accurate botanical and environmental data.",
		prompt, 1200)
	if err != nil {
		return nil, err
	}

	var data struct {
		Trees       []models.TreeRecommendation `json:"trees"`
		AIReasoning string                      `json:"aiReasoning"`
	}
	if err := json.Unmarshal([]byte(content), &data); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	// Assign sequential IDs and brand colours (not provided by the LLM).
	for i := range data.Trees {
		data.Trees[i].ID = i + 1
		if i < len(treeColors) {
			data.Trees[i].Color = treeColors[i]
		}
	}

	return &models.RecommendResponse{
		Trees:       data.Trees,
		ClimateZone: climate.Zone,
		Region:      climate.Region,
		AIReasoning: data.AIReasoning,
	}, nil
}

// CalculateImpact returns a detailed environmental impact projection for a
// planned tree-planting scenario.
func (s *Service) CalculateImpact(ctx context.Context, lat, lng float64, trees []models.PlantedTree) (*models.ImpactResponse, error) {
	climate := geo.EnrichClimateInfo(ctx, geo.GetClimateInfo(lat, lng), lat, lng)

	treesJSON, _ := json.Marshal(trees)

	prompt := fmt.Sprintf(`You are an environmental impact scientist specialising in carbon sequestration and urban forestry.

Location: %.6f°, %.6f° — %s (%s)
Biome: %s
Annual Rainfall: %.0f mm
Average Temperature: %.1f°C
Hardiness Zone: %s
Current Weather: %s
Trees to plant: %s

Calculate the real-world environmental impact of this planting plan at full maturity. Use realistic, species-appropriate figures. Respond ONLY with valid JSON:
{
  "totalCO2PerYearKg": <total kg CO2 absorbed per year>,
  "totalOxygenPerDayKg": <total kg O2 produced per day>,
	"oxygenImprovementPercent": <localised air oxygen improvement %%, realistic range 0.01–2.0>,
  "airQualityImprovementPts": <AQI improvement integer, realistic range 1–20>,
  "waterRetentionLitersPerYear": <total litres of water retained per year>,
  "temperatureReductionC": <local temperature reduction in °C, realistic range 0.2–3.0>,
  "carbonSequestration10YearKg": <total carbon sequestered over 10 years>,
  "projectedTimeline": [
    {"year": 1,  "co2AbsorbedKg": <number>, "oxygenProducedKg": <number>},
    {"year": 3,  "co2AbsorbedKg": <number>, "oxygenProducedKg": <number>},
    {"year": 5,  "co2AbsorbedKg": <number>, "oxygenProducedKg": <number>},
    {"year": 10, "co2AbsorbedKg": <number>, "oxygenProducedKg": <number>},
    {"year": 20, "co2AbsorbedKg": <number>, "oxygenProducedKg": <number>}
  ],
  "aiAnalysis": "<2–3 sentences about the long-term environmental impact specifically in this region, mentioning airflow, biodiversity, or local climate benefits>"
		`,
		lat, lng, climate.Region, climate.Zone,
		climate.BiomeType,
		climate.AnnualRainfallMM,
		climate.AvgTemperatureC,
		climate.HardinessZone,
		climate.WeatherSummary(),
		string(treesJSON),
	)

	content, err := s.callJSON(ctx,
		"You are an environmental impact calculation API. Respond only with valid JSON containing realistic scientific values.",
		prompt, 900)
	if err != nil {
		return nil, err
	}

	var impact models.ImpactResponse
	if err := json.Unmarshal([]byte(content), &impact); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %w", err)
	}

	return &impact, nil
}

// callJSON sends a chat completion request in JSON mode and returns the raw
// JSON content string from the first choice. The caller is responsible for
// unmarshalling the result into the appropriate type.
func (s *Service) callJSON(ctx context.Context, system, user string, maxTokens int) (string, error) {
	resp, err := s.client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
		Model: s.model,
		Messages: []openai.ChatCompletionMessage{
			{Role: openai.ChatMessageRoleSystem, Content: system},
			{Role: openai.ChatMessageRoleUser, Content: user},
		},
		ResponseFormat: &openai.ChatCompletionResponseFormat{
			Type: openai.ChatCompletionResponseFormatTypeJSONObject,
		},
		MaxTokens:   maxTokens,
		Temperature: 0.3,
	})
	if err != nil {
		return "", fmt.Errorf("openai API error: %w", err)
	}
	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("openai returned no choices")
	}
	return resp.Choices[0].Message.Content, nil
}
