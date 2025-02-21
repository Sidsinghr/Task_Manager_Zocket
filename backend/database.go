package main

import (
    "fmt"
    "log"
    "os"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDatabase initializes the database connection and auto-migrates models.
func ConnectDatabase() {
    host := os.Getenv("DB_HOST")
    port := os.Getenv("DB_PORT")
    user := os.Getenv("DB_USER")
    password := os.Getenv("DB_PASSWORD")
    dbname := os.Getenv("DB_NAME")

    // Check for missing environment variables and log which ones are missing.
    missing := []string{}
    if host == "" {
        missing = append(missing, "DB_HOST")
    }
    if port == "" {
        missing = append(missing, "DB_PORT")
    }
    if user == "" {
        missing = append(missing, "DB_USER")
    }
    if password == "" {
        missing = append(missing, "DB_PASSWORD")
    }
    if dbname == "" {
        missing = append(missing, "DB_NAME")
    }

    if len(missing) > 0 {
        log.Fatalf("Database environment variables not set properly. Missing: %v", missing)
    }

    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
        host, port, user, password, dbname,
    )

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to the database:", err)
    }
    fmt.Println("Connected to PostgreSQL successfully!")

    // Auto-migrate models
    db.AutoMigrate(&User{}, &Task{})

    DB = db
}
