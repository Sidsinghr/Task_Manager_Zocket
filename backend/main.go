package main

import (
    "bytes"
    "encoding/json"
    "io/ioutil"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/websocket/v2"
    "github.com/joho/godotenv"
)

// Load environment variables from .env file.
func init() {
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: No .env file found")
    }
}

// aiSuggestHandler calls the Gemini API with the provided prompt and returns the generated content.
func aiSuggestHandler(c *fiber.Ctx) error {
    // Define a struct to parse the incoming JSON.
    type Request struct {
        Prompt string `json:"prompt"`
    }
    var req Request
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }

    // Get the Gemini API key from environment variables.
    apiKey := os.Getenv("GEMINI_API_KEY")
    if apiKey == "" {
        return c.Status(500).JSON(fiber.Map{"error": "Gemini API key not set"})
    }

    // Prepare the request payload as per the example.
    geminiReqBody := map[string]interface{}{
        "contents": []map[string]interface{}{
            {
                "parts": []map[string]string{
                    {"text": req.Prompt},
                },
            },
        },
    }

    // Marshal the payload to JSON.
    requestBody, err := json.Marshal(geminiReqBody)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to create request"})
    }

    // Build the Gemini API endpoint URL using the key as a query parameter.
    geminiURL := "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey

    httpReq, err := http.NewRequest("POST", geminiURL, bytes.NewReader(requestBody))
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to create request"})
    }

    // Set the required header.
    httpReq.Header.Set("Content-Type", "application/json")

    // Create an HTTP client with a timeout.
    client := &http.Client{
        Timeout: 30 * time.Second,
    }

    // Make the HTTP request.
    resp, err := client.Do(httpReq)
    if err != nil {
        log.Println("Error calling Gemini API:", err)
        return c.Status(500).JSON(fiber.Map{"error": "Error calling Gemini API"})
    }
    defer resp.Body.Close()

    // Check if the API returned an error status.
    if resp.StatusCode != http.StatusOK {
        bodyBytes, _ := ioutil.ReadAll(resp.Body)
        log.Println("Gemini API error:", string(bodyBytes))
        return c.Status(resp.StatusCode).JSON(fiber.Map{"error": string(bodyBytes)})
    }

    // Decode the response from Gemini.
    var geminiResp map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Error decoding Gemini response"})
    }

    // Log the full response for debugging.
    log.Printf("Gemini Response: %+v\n", geminiResp)

    // Extract the generated suggestion from the response.
    // Expected structure:
    // {
    //    "candidates": [
    //         {
    //            "content": {
    //                "parts": [
    //                     {"text": "Your generated text here"}
    //                ]
    //            },
    //            ... other fields ...
    //         }
    //    ],
    //    ... other fields ...
    // }
    var suggestion string
    if candidates, ok := geminiResp["candidates"].([]interface{}); ok && len(candidates) > 0 {
        if candidate, ok := candidates[0].(map[string]interface{}); ok {
            if content, ok := candidate["content"].(map[string]interface{}); ok {
                if parts, ok := content["parts"].([]interface{}); ok && len(parts) > 0 {
                    if firstPart, ok := parts[0].(map[string]interface{}); ok {
                        if text, ok := firstPart["text"].(string); ok && text != "" {
                            suggestion = text
                        }
                    }
                }
            }
        }
    }

    if suggestion == "" {
        return c.Status(500).JSON(fiber.Map{"error": "No output returned"})
    }

    // Return the generated suggestion.
    return c.JSON(fiber.Map{"suggestions": suggestion})
}


func main() {
    // Connect to the database.
    ConnectDatabase()

    // Initialize Fiber app.
    app := fiber.New()

    // Enable CORS for all origins.
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))

    // Public Routes.
    app.Post("/api/signup", Signup)
    app.Post("/api/login", Login)

    // Protected Routes for Task CRUD.
    app.Get("/api/tasks", AuthMiddleware, GetTasks)
    app.Post("/api/tasks", AuthMiddleware, CreateTask)
    app.Put("/api/tasks/:id", AuthMiddleware, UpdateTask)
    app.Delete("/api/tasks/:id", AuthMiddleware, DeleteTask)

    // WebSocket Endpoint (no authentication for demo purposes).
    app.Get("/ws", websocket.New(wsHandler))

    // AI Suggest Endpoint using Gemini.
    app.Post("/api/ai/suggest", aiSuggestHandler)

    // Example Protected Route (for testing middleware).
    app.Get("/api/protected", AuthMiddleware, func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"message": "Welcome to the protected route!"})
    })

    // Start the server on port 3000.
    log.Fatal(app.Listen(":3000"))
}
