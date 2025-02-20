package main

import (
    "log"
    "sync"

    "github.com/gofiber/websocket/v2"
)

var (
    // wsConns holds all active WebSocket connections.
    wsConns = make(map[*websocket.Conn]bool)
    // wsMutex protects wsConns from concurrent access.
    wsMutex = sync.Mutex{}
)

// wsHandler handles WebSocket connections.
func wsHandler(c *websocket.Conn) {
    // Add connection to our list.
    wsMutex.Lock()
    wsConns[c] = true
    wsMutex.Unlock()

    defer func() {
        wsMutex.Lock()
        delete(wsConns, c)
        wsMutex.Unlock()
        c.Close()
    }()

    // Listen for messages from this connection.
    for {
        _, msg, err := c.ReadMessage()
        if err != nil {
            log.Println("WebSocket read error:", err)
            break
        }
        log.Println("Received message:", string(msg))
        // Here you could process incoming messages if needed.
    }
}

// broadcastMessage sends a message to all active WebSocket clients.
func broadcastMessage(message []byte) {
    wsMutex.Lock()
    defer wsMutex.Unlock()
    for conn := range wsConns {
        if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
            log.Println("WebSocket write error:", err)
            conn.Close()
            delete(wsConns, conn)
        }
    }
}
