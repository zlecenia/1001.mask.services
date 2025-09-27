#!/usr/bin/env node

/**
 * Device History Component Development Server
 * 
 * This script provides a development server with hot-reload for the DeviceHistory component.
 * It serves the component in a standalone environment with mock data and API endpoints.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createServer as createViteServer } from 'vite';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3009;
const HOST = process.env.HOST || '0.0.0.0';
const IS_DEV = process.env.NODE_ENV !== 'production';

// Initialize Express app
const app = express();
const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load configuration and data
const config = JSON.parse(fs.readFileSync(join(__dirname, 'config/config.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(join(__dirname, 'config/data.json'), 'utf8'));

// API Routes
app.get('/api/device-history', (req, res) => {
  try {
    const { page = 1, limit = config.itemsPerPage, sortBy = 'lastTest', sortOrder = 'desc' } = req.query;
    
    // Apply sorting
    const sortedDevices = [...data.devices].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedDevices = sortedDevices.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedDevices,
      pagination: {
        total: data.devices.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(data.devices.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching device history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device history'
    });
  }
});

app.get('/api/device-history/:id', (req, res) => {
  try {
    const device = data.devices.find(d => d.id === parseInt(req.params.id));
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found'
      });
    }
    
    // Get test results for this device
    const testResults = data.testResults.filter(t => t.deviceId === device.id);
    
    res.json({
      success: true,
      data: {
        ...device,
        testResults
      }
    });
  } catch (error) {
    console.error('Error fetching device details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device details'
    });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Send initial data
  ws.send(JSON.stringify({
    type: 'INIT',
    data: {
      devices: data.devices,
      lastUpdated: new Date().toISOString()
    }
  }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const { type, payload } = JSON.parse(message);
      
      switch (type) {
        case 'REFRESH':
          // Broadcast updated data to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'UPDATE',
                data: {
                  devices: data.devices,
                  lastUpdated: new Date().toISOString()
                }
              }));
            }
          });
          break;
          
        default:
          console.log('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve the standalone HTML file for development
app.get('/', async (req, res) => {
  try {
    // In development, use Vite's HTML transformation
    if (IS_DEV) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom'
      });
      
      app.use(vite.middlewares);
      
      const template = fs.readFileSync(join(__dirname, 'standalone.html'), 'utf-8');
      const html = await vite.transformIndexHtml('/standalone.html', template);
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } else {
      // In production, serve the built files
      res.sendFile(join(__dirname, 'dist/standalone.html'));
    }
  } catch (error) {
    console.error('Error serving standalone page:', error);
    res.status(500).send('Error loading application');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: IS_DEV ? err.message : undefined
  });
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 Device History Dev Server running at:`);
  console.log(`   Local:    http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`   Network:  http://${getLocalIpAddress()}:${PORT}`);
  console.log(`\n📊 API Endpoints:`);
  console.log(`   GET    /api/device-history      - List all devices with pagination`);
  console.log(`   GET    /api/device-history/:id  - Get device details and test history`);
  console.log(`   WS     /ws                     - WebSocket for real-time updates`);
  console.log('\n⚡️  Press Ctrl+C to stop the server\n');
});

// Helper function to get local IP address
function getLocalIpAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const { address, family, internal } = iface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
  return 'localhost';
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🔴 Shutting down dev server...');
  wss.close(() => {
    console.log('WebSocket server closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
