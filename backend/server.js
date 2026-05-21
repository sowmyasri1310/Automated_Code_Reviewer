import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB database.'))
  .catch(err => {
    console.error('Database connection error occurred:', err);
    process.exit(1);
  });

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'Automated Code Reviewer API' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected server error occurred' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in development mode on port ${PORT}`);
});

// Export app for Vercel Serverless Functions
export default app;
