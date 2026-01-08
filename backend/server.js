import express from 'express';
import 'dotenv/config';
import connectDB from './src/db/db.js';
import authRoutes from './src/routes/auth.route.js';

const app = express();
const port = process.env.PORT || 3000

// Parse incoming requests with JSON payloads
app.use(express.json());

// Parse incoming requests with URL-encoded payloads (useful for HTML forms)
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World! 123')
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    connectDB();
    console.log(`Server is running at http://localhost:${port}`);
});