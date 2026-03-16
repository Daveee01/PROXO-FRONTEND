package geo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const openMeteoForecastURL = "https://api.open-meteo.com/v1/forecast"

type openMeteoResponse struct {
	Current struct {
		Temperature2M      float64 `json:"temperature_2m"`
		RelativeHumidity2M int     `json:"relative_humidity_2m"`
		Precipitation      float64 `json:"precipitation"`
		WindSpeed10M       float64 `json:"wind_speed_10m"`
	} `json:"current"`
	Daily struct {
		Temperature2MMax []float64 `json:"temperature_2m_max"`
		Temperature2MMin []float64 `json:"temperature_2m_min"`
		PrecipitationSum []float64 `json:"precipitation_sum"`
	} `json:"daily"`
}

// EnrichClimateInfo overlays live weather from Open-Meteo on top of the static
// climate model. If the API call fails, the original climate data is returned.
func EnrichClimateInfo(ctx context.Context, climate ClimateInfo, lat, lng float64) ClimateInfo {
	requestCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(
		requestCtx,
		http.MethodGet,
		fmt.Sprintf(
			"%s?latitude=%.6f&longitude=%.6f&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=1&timezone=auto",
			openMeteoForecastURL,
			lat,
			lng,
		),
		nil,
	)
	if err != nil {
		return climate
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return climate
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return climate
	}

	var payload openMeteoResponse
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return climate
	}

	climate.HasLiveWeather = true
	climate.WeatherSource = "Open-Meteo"
	climate.CurrentTemperatureC = payload.Current.Temperature2M
	climate.CurrentPrecipitationMM = payload.Current.Precipitation
	climate.CurrentRelativeHumidityPct = payload.Current.RelativeHumidity2M
	climate.CurrentWindSpeedKPH = payload.Current.WindSpeed10M

	if len(payload.Daily.Temperature2MMax) > 0 {
		climate.ForecastMaxTemperatureC = payload.Daily.Temperature2MMax[0]
	}
	if len(payload.Daily.Temperature2MMin) > 0 {
		climate.ForecastMinTemperatureC = payload.Daily.Temperature2MMin[0]
	}
	if len(payload.Daily.PrecipitationSum) > 0 {
		climate.ForecastPrecipitationMM = payload.Daily.PrecipitationSum[0]
	}

	return climate
}
