package main

import (
    "time"
    "golang.org/x/crypto/bcrypt"
)

// User model
type User struct {
    ID        uint           `gorm:"primaryKey"`
    Email     string         `gorm:"unique;not null"`
    Password  string         `gorm:"not null"`
    CreatedAt time.Time      `gorm:"default:CURRENT_TIMESTAMP"`
}

// HashPassword encrypts the password before storing.
func (user *User) HashPassword() error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    user.Password = string(hashedPassword)
    return nil
}

// CheckPassword verifies user password.
func (user *User) CheckPassword(password string) bool {
    return bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)) == nil
}

// Task model
type Task struct {
    ID          uint      `gorm:"primaryKey"`
    Title       string    `gorm:"not null"`
    Description string
    Status      string    `gorm:"not null"`
    DueDate     time.Time `gorm:"type:date"`  // New field for due date
    CreatedBy   uint
    AssignedTo  *uint
    CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP"`
}

