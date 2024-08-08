const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET, POST',
  credentials: true
}));
app.use(express.json());
const port = 3044;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Motioncut-login', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('Connected to database'))
  .catch((err) => console.error('Error connecting to database:', err));

// Define login schema
const Schema = mongoose.Schema;
const loginSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create login model
const LoginModel = mongoose.model('LoginModel', loginSchema);

// Middleware to hash passwords
const hashPassword = async (req, res, next) => {
  try {
    const password = req.body.password;
    if (!password) return res.status(400).send('Password is required.');
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(password, salt);
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error.');
  }
};

// Middleware to authenticate JWT tokens
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    const decoded = jwt.verify(token, 'divya'); // Replace with your actual secret key
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(400).send('Invalid token.');
  }
};

// Register API
app.post('/api/register', hashPassword, (req, res) => {
  const { username, password } = req.body;
  LoginModel.findOne({ username }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(400).send('Error registering user: ' + err.message);
    }
    if (user) return res.status(400).send('Username already exists.');
    const newUser = new LoginModel({ username, password });
    newUser.save()
      .then(() => res.send(`User created with username: ${username}`))
      .catch((err) => {
        console.error(err);
        res.status(400).send('Error registering user: ' + err.message);
      });
  });
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  LoginModel.findOne({ username }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(400).send('Login error: ' + err.message);
    }
    if (!user) return res.status(400).send('Invalid username or password.');
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(400).send('Login error: ' + err.message);
      }
      if (!isMatch) return res.status(400).send('Invalid username or password.');
      const token = jwt.sign({ _id: user._id }, 'divya', { expiresIn: '1h' }); // Replace with your actual secret key
      res.header('x-auth-token', token).send(`Logged in as ${username}`);
    });
  });
});

// Protected API
app.get('/api/protected', authenticate, (req, res) => {
  res.send(`Welcome, ${req.user._id}!`);
});

// App listener
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});