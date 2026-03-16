// Package geo provides location-based climate and regional analysis.
// It uses a simplified Köpper climate classification derived from coordinates so
// that no external API key is needed for basic operation. Accuracy is sufficient
// for tree recommendation purposes; swap in a proper climate API for production.
package geo

import (
	"fmt"
	"math"
)

// ClimateInfo contains the environmental context inferred from a coordinate pair.
type ClimateInfo struct {
	Zone                       string
	Region                     string
	BiomeType                  string
	AnnualRainfallMM           float64
	AvgTemperatureC            float64
	HardinessZone              string
	Description                string
	HasLiveWeather             bool
	CurrentTemperatureC        float64
	CurrentPrecipitationMM     float64
	CurrentRelativeHumidityPct int
	CurrentWindSpeedKPH        float64
	ForecastMaxTemperatureC    float64
	ForecastMinTemperatureC    float64
	ForecastPrecipitationMM    float64
	WeatherSource              string
}

// GetClimateInfo returns a ClimateInfo for the given latitude and longitude.
func GetClimateInfo(lat, lng float64) ClimateInfo {
	absLat := math.Abs(lat)
	region := regionName(lat, lng)
	arid := isArid(lat, lng)

	var info ClimateInfo
	info.Region = region

	switch {
	case absLat < 10:
		info.Zone = "Tropical Rainforest (Af)"
		info.BiomeType = "Tropical Rainforest"
		info.AnnualRainfallMM = 2200
		info.AvgTemperatureC = 27
		info.HardinessZone = "13"

	case absLat < 23.5:
		if arid {
			info.Zone = "Tropical Savanna / Semi-Arid (Aw/BSh)"
			info.BiomeType = "Savanna"
			info.AnnualRainfallMM = 700
			info.AvgTemperatureC = 28
			info.HardinessZone = "12"
		} else {
			info.Zone = "Tropical Monsoon (Am)"
			info.BiomeType = "Tropical Monsoon Forest"
			info.AnnualRainfallMM = 1600
			info.AvgTemperatureC = 25
			info.HardinessZone = "12–13"
		}

	case absLat < 35:
		if arid {
			info.Zone = "Hot Desert (BWh)"
			info.BiomeType = "Desert"
			info.AnnualRainfallMM = 150
			info.AvgTemperatureC = 24
			info.HardinessZone = "10–11"
		} else {
			info.Zone = "Humid Subtropical (Cfa)"
			info.BiomeType = "Subtropical Forest"
			info.AnnualRainfallMM = 1100
			info.AvgTemperatureC = 18
			info.HardinessZone = "9–10"
		}

	case absLat < 50:
		if arid {
			info.Zone = "Semi-Arid Steppe (BSk)"
			info.BiomeType = "Temperate Grassland"
			info.AnnualRainfallMM = 350
			info.AvgTemperatureC = 10
			info.HardinessZone = "6–7"
		} else {
			info.Zone = "Temperate Oceanic / Continental (Cfb/Dfb)"
			info.BiomeType = "Temperate Deciduous Forest"
			info.AnnualRainfallMM = 800
			info.AvgTemperatureC = 10
			info.HardinessZone = "6–8"
		}

	case absLat < 60:
		info.Zone = "Humid Continental / Subarctic (Dfb/Dfc)"
		info.BiomeType = "Boreal Forest (Taiga)"
		info.AnnualRainfallMM = 450
		info.AvgTemperatureC = 2
		info.HardinessZone = "3–5"

	default:
		info.Zone = "Tundra / Polar (ET/EF)"
		info.BiomeType = "Tundra"
		info.AnnualRainfallMM = 200
		info.AvgTemperatureC = -6
		info.HardinessZone = "1–3"
	}

	info.Description = fmt.Sprintf(
		"%s in %s — ~%.0f mm rainfall/yr, avg %.1f°C",
		info.Zone, info.Region, info.AnnualRainfallMM, info.AvgTemperatureC,
	)
	return info
}

// WeatherSummary returns a short prompt-ready description of the live weather
// context when available, otherwise a note that the climate values are derived
// from broad regional estimates.
func (c ClimateInfo) WeatherSummary() string {
	if !c.HasLiveWeather {
		return "Live weather unavailable; rely on climate-zone estimates for current conditions."
	}

	return fmt.Sprintf(
		"Live weather from %s: current %.1f°C, precipitation %.1f mm, humidity %d%%, wind %.1f km/h; today %.1f°C to %.1f°C with %.1f mm forecast precipitation.",
		c.WeatherSource,
		c.CurrentTemperatureC,
		c.CurrentPrecipitationMM,
		c.CurrentRelativeHumidityPct,
		c.CurrentWindSpeedKPH,
		c.ForecastMinTemperatureC,
		c.ForecastMaxTemperatureC,
		c.ForecastPrecipitationMM,
	)
}

// isArid returns a rough estimate of whether the coordinates fall in a
// well-known arid region (Sahara, Arabian peninsula, Australian outback, etc.).
func isArid(lat, lng float64) bool {
	// Sahara & Arabian Desert: 15–35°N, 15–60°E
	if lat > 15 && lat < 35 && lng > 15 && lng < 60 {
		return true
	}
	// Australian Outback: 20–35°S, 115–145°E
	if lat < -20 && lat > -35 && lng > 115 && lng < 145 {
		return true
	}
	// Atacama / Patagonian: 20–40°S, 65–75°W
	if lat < -20 && lat > -40 && lng > -75 && lng < -60 {
		return true
	}
	// Sonoran & Chihuahuan deserts (North America): 25–40°N, 105–120°W
	if lat > 25 && lat < 40 && lng > -120 && lng < -105 {
		return true
	}
	// Central Asian steppe: 40–55°N, 55–90°E
	if lat > 40 && lat < 55 && lng > 55 && lng < 90 {
		return true
	}
	return false
}

// regionName maps coordinates to a broad geographic region name.
func regionName(lat, lng float64) string {
	switch {
	case lat > 15 && lat < 75 && lng > -170 && lng < -50:
		return "North America"
	case lat > 5 && lat < 25 && lng > -95 && lng < -60:
		return "Central America & Caribbean"
	case lat < 15 && lat > -60 && lng > -85 && lng < -30:
		return "South America"
	case lat > 35 && lat < 75 && lng > -30 && lng < 45:
		return "Europe"
	case lat < 40 && lat > -40 && lng > -20 && lng < 55:
		return "Africa"
	case lat > 15 && lat < 45 && lng > 35 && lng < 65:
		return "Middle East"
	case lat > 5 && lat < 40 && lng > 60 && lng < 90:
		return "South Asia"
	case lat > -10 && lat < 30 && lng > 90 && lng < 145:
		return "Southeast Asia"
	case lat > 20 && lat < 55 && lng > 100 && lng < 145:
		return "East Asia"
	case lat < 0 && lat > -55 && lng > 110 && lng < 180:
		return "Australia & Oceania"
	case lat > 50 && lng > 45 && lng < 180:
		return "Russia & Central Asia"
	default:
		return "Global"
	}
}
