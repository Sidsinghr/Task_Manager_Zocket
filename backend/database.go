package main

import (
    "fmt"
    "log"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

// ConnectDatabase initializes the database connection and auto-migrates models.
func ConnectDatabase() {
    dsn := "host=localhost user=siddhantsingh dbname=taskmanager sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to the database:", err)
    }
    fmt.Println("Connected to PostgreSQL successfully!")

    // Auto-migrate models
    db.AutoMigrate(&User{}, &Task{})

    DB = db
}
