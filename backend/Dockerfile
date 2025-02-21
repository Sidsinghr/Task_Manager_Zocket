# --- Builder Stage: Use Go 1.24.0 ---
    FROM golang:1.24-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy dependency files first for caching
    COPY go.mod go.sum ./
    RUN go mod download
    
    # Copy the rest of your source code
    COPY . .
    
    # Build the binary; adjust flags as needed
    RUN go build -tags netgo -ldflags '-s -w' -o app .
    
    # --- Final Stage: Create a minimal runtime image ---
    FROM alpine:latest
    
    WORKDIR /app
    
    # Copy the compiled binary from the builder stage
    COPY --from=builder /app/app .
    
    # Expose the port your app listens on (ensure your code uses the PORT env variable)
    EXPOSE 3000
    
    # Run the application
    CMD ["./app"]
    