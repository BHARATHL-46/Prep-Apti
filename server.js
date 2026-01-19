import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

const MONGODB_URI = process.env.MONGODB_URI;

console.log(`Connecting to MongoDB with URI type: ${typeof MONGODB_URI}`);
if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is undefined!");
}
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        ensureAdmin();
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });

const userSchema = new mongoose.Schema({
    id: String,
    email: { type: String, unique: true },
    fullName: String,
    gender: String,
    password: { type: String, required: true },
    status: { type: String, default: 'pending' },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Number, default: Date.now }
});

const testResultSchema = new mongoose.Schema({
    userId: String,
    score: Number,
    totalQuestions: Number,
    correctCount: Number,
    incorrectCount: Number,
    accuracy: Number,
    timeSpent: Number,
    date: { type: Number, default: Date.now },
    details: mongoose.Schema.Types.Mixed
});

const User = mongoose.model('User', userSchema);
const TestResult = mongoose.model('TestResult', testResultSchema);

// Initial admin setup if no users exist
const ensureAdmin = async () => {
    const count = await User.countDocuments();
    if (count === 0) {
        const admin = new User({
            id: 'admin-001',
            email: 'admin@preaptiai.com',
            fullName: 'System Administrator',
            gender: 'Other',
            password: 'admin123',
            status: 'approved',
            isAdmin: true,
            createdAt: Date.now()
        });
        await admin.save();
        console.log('Default admin created');
    }
};

// User Routes
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findOneAndDelete({ id: req.params.id });
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Test Result Routes
app.get('/api/tests', async (req, res) => {
    try {
        const query = req.query.userId ? { userId: req.query.userId } : {};
        const tests = await TestResult.find(query);
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tests', async (req, res) => {
    try {
        const test = new TestResult(req.body);
        await test.save();
        res.status(201).json(test);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/tests/:date', async (req, res) => {
    try {
        await TestResult.findOneAndDelete({ date: parseInt(req.params.date) });
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
