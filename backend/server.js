require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

console.log('Attempting to connect to MongoDB:', process.env.MONGODB_URI);

// MongoDB Connection with detailed logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/woocommerce-proxy', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

// Route Schema
const RouteSchema = new mongoose.Schema({
    path: { type: String, required: true, unique: true },
    targetUrl: { type: String, required: true },
    isEnabled: { type: Boolean, default: false },
    description: String
});

const Route = mongoose.model('Route', RouteSchema);

// Route Management API Endpoints
app.get('/api/routes', async (req, res) => {
    console.log('GET /api/routes - Fetching routes');
    try {
        const routes = await Route.find();
        console.log('Found routes:', routes);
        res.json({ 
            data: routes || [] 
        });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ 
            error: error.message,
            data: [] 
        });
    }
});

app.post('/api/routes', async (req, res) => {
    console.log('POST /api/routes - Creating route:', req.body);
    try {
        const route = new Route(req.body);
        await route.save();
        console.log('Route created:', route);
        res.status(201).json({ data: route });
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/routes/:id', async (req, res) => {
    console.log(`PUT /api/routes/${req.params.id} - Updating route:`, req.body);
    try {
        const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!route) {
            console.log('Route not found');
            return res.status(404).json({ error: 'Route not found' });
        }
        console.log('Route updated:', route);
        res.json({ data: route });
    } catch (error) {
        console.error('Error updating route:', error);
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/routes/:id', async (req, res) => {
    console.log(`DELETE /api/routes/${req.params.id}`);
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        if (!route) {
            console.log('Route not found');
            return res.status(404).json({ error: 'Route not found' });
        }
        console.log('Route deleted:', route);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(400).json({ error: error.message });
    }
});

// Dynamic Proxy Configuration
const setupProxyMiddleware = async () => {
    try {
        console.log('Setting up proxy middleware');
        const routes = await Route.find({ isEnabled: true });
        console.log('Found enabled routes:', routes);
        
        routes.forEach(route => {
            app.use(route.path, createProxyMiddleware({
                target: route.targetUrl,
                changeOrigin: true,
                pathRewrite: {
                    [`^${route.path}`]: '',
                },
                onProxyReq: (proxyReq, req, res) => {
                    proxyReq.setHeader('User-Agent', 'WooCommerce Proxy');
                },
                onError: (err, req, res) => {
                    console.error('Proxy Error:', err);
                    res.status(500).json({ error: 'Proxy Error', details: err.message });
                }
            }));
            console.log(`Proxy route configured: ${route.path} -> ${route.targetUrl}`);
        });

        // Default WooCommerce.com proxy for unmatched routes
        app.use('/', createProxyMiddleware({
            target: 'https://woocommerce.com',
            changeOrigin: true,
            onProxyReq: (proxyReq, req, res) => {
                proxyReq.setHeader('User-Agent', 'WooCommerce Proxy');
            }
        }));
        console.log('Default proxy route configured');
    } catch (error) {
        console.error('Error setting up proxy middleware:', error);
    }
};

// Initial proxy setup
setupProxyMiddleware();

// Refresh proxy configuration every 5 minutes
setInterval(setupProxyMiddleware, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
