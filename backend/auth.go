package main

import (
    "fmt"
    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
    "time"
)

// Secret key for signing JWT tokens
var jwtSecret = []byte("your_secret_key")

// Signup handler
func Signup(c *fiber.Ctx) error {
    var data map[string]string

    if err := c.BodyParser(&data); err != nil {
        fmt.Println("BodyParser error:", err)
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    // Check if email already exists
    var existingUser User
    if err := DB.Where("email = ?", data["email"]).First(&existingUser).Error; err == nil {
        return c.Status(400).JSON(fiber.Map{"error": "Email already exists"})
    }

    // Create new user
    user := User{
        Email:    data["email"],
        Password: data["password"],
    }
    if err := user.HashPassword(); err != nil {
        fmt.Println("HashPassword error:", err)
        return c.Status(500).JSON(fiber.Map{"error": "Error hashing password"})
    }

    if err := DB.Create(&user).Error; err != nil {
        fmt.Println("DB.Create error:", err)
        return c.Status(500).JSON(fiber.Map{"error": "Error creating user"})
    }

    return c.JSON(fiber.Map{"message": "User created successfully"})
}

// Login handler
func Login(c *fiber.Ctx) error {
    var data map[string]string

    if err := c.BodyParser(&data); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    var user User
    if err := DB.Where("email = ?", data["email"]).First(&user).Error; err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid email or password"})
    }

    if !user.CheckPassword(data["password"]) {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid email or password"})
    }

    // Generate JWT token
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id": user.ID,
        "exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
    })
    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Error generating token"})
    }

    return c.JSON(fiber.Map{"token": tokenString})
}

// AuthMiddleware protects routes that require authentication.
func AuthMiddleware(c *fiber.Ctx) error {
    tokenString := c.Get("Authorization")
    if tokenString == "" {
        return c.Status(401).JSON(fiber.Map{"error": "Missing token"})
    }

    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    })
    if err != nil || !token.Valid {
        return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
    }

    return c.Next()
}
