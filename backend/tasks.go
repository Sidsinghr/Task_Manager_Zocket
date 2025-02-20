package main

import (
    "strconv"
    "time"

    "github.com/gofiber/fiber/v2"
)

// GetTasks retrieves all tasks.
func GetTasks(c *fiber.Ctx) error {
    var tasks []Task
    if err := DB.Find(&tasks).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not retrieve tasks"})
    }
    return c.JSON(tasks)
}

// CreateTask creates a new task.
func CreateTask(c *fiber.Ctx) error {
    // Define a struct for the incoming request.
    type TaskRequest struct {
        Title       string `json:"Title"`
        Description string `json:"Description"`
        Status      string `json:"Status"`
        DueDate     string `json:"DueDate"` // Expecting format "YYYY-MM-DD"
    }
    var req TaskRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }

    // Parse DueDate string into time.Time.
    due, err := time.Parse("2006-01-02", req.DueDate)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid due date format. Please use YYYY-MM-DD"})
    }

    // Create a new task instance.
    // Here, we set CreatedBy to 1 for testing.
    // In production, decode the JWT to get the actual user ID.
    task := Task{
        Title:       req.Title,
        Description: req.Description,
        Status:      req.Status,
        DueDate:     due,
        CreatedBy:   1, // Replace with actual user ID from the token.
    }

    if err := DB.Create(&task).Error; err != nil {
        // Log the error for debugging.
        return c.Status(500).JSON(fiber.Map{"error": "Could not create task"})
    }

    // Broadcast a simple message to all connected WebSocket clients.
    broadcastMessage([]byte("A new task has been created!"))

    return c.JSON(task)
}

// UpdateTask updates an existing task.
func UpdateTask(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid task ID"})
    }

    var task Task
    if err := DB.First(&task, id).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
    }

    // Define a struct for the update request.
    type TaskUpdateRequest struct {
        Title       string `json:"Title"`
        Description string `json:"Description"`
        Status      string `json:"Status"`
        DueDate     string `json:"DueDate"` // Optional, format "YYYY-MM-DD"
    }
    var req TaskUpdateRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }

    // Update fields.
    task.Title = req.Title
    task.Description = req.Description
    task.Status = req.Status

    // If DueDate is provided, parse it.
    if req.DueDate != "" {
        due, err := time.Parse("2006-01-02", req.DueDate)
        if err != nil {
            return c.Status(400).JSON(fiber.Map{"error": "Invalid due date format. Please use YYYY-MM-DD"})
        }
        task.DueDate = due
    }

    if err := DB.Save(&task).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not update task"})
    }
    return c.JSON(task)
}

// DeleteTask deletes a task.
func DeleteTask(c *fiber.Ctx) error {
    id, err := strconv.Atoi(c.Params("id"))
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid task ID"})
    }
    if err := DB.Delete(&Task{}, id).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Could not delete task"})
    }
    return c.JSON(fiber.Map{"message": "Task deleted successfully"})
}
