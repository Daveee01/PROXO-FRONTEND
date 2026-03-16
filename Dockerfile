# ── Build stage ──────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Download dependencies first (layer-cached unless go.mod/go.sum change).
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build a statically-linked binary.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o proxo-backend ./main.go

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.19

# ca-certificates: needed for HTTPS calls to OpenAI.
# tzdata: lets the service report times in the correct timezone.
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/proxo-backend .

EXPOSE 8080

CMD ["./proxo-backend"]
