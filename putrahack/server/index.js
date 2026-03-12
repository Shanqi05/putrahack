import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root API
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to TripleGain API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            crops: '/api/crops',
            marketplace: '/api/marketplace',
            diseases: '/api/diseases',
            leftover: '/api/leftover'
        }
    });
});

// Routes (to be implemented)
app.get('/api/crops', (req, res) => {
    res.json({ message: 'Crops endpoint', data: [] });
});

app.get('/api/marketplace', (req, res) => {
    res.json({ message: 'Marketplace endpoint', data: [] });
});

app.get('/api/diseases', (req, res) => {
    res.json({ message: 'Disease detection endpoint', data: [] });
});

app.get('/api/leftover', (req, res) => {
    res.json({ message: 'Leftover management endpoint', data: [] });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════╗
║   TripleGain API Server Running    ║
║   🌱 Protecting Crops, Growing    ║
║   Port: ${PORT}                       ║
╚═══════════════════════════════════╝
  `);
});

export default app;
