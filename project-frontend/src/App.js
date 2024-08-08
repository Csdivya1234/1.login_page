import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import cycleImage from './images/cycle3.png'; // Ensure the image path is correct

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3044/api/login', {
        username,
        password,
      });

      console.log(`Logged in as ${username}`);
      setError(null);
    } catch (error) {
      setError(error.response.data.message || error.message);
      console.error(error);
    }
  };

  // Generate falling leaves
  const generateLeaves = () => {
    const leaves = [];
    const numberOfLeaves = 10; // Adjust the number of leaves as needed

    for (let i = 0; i < numberOfLeaves; i++) {
      const leftPosition = Math.random() * 100; // Random horizontal position
      const animationDelay = Math.random() * 10; // Random delay for staggered effect
      const animationDuration = 10 + Math.random() * 10; // Random duration for different speeds

      leaves.push(
        <div
          key={i}
          className="falling-leaf"
          style={{
            left: `${leftPosition}%`,
            animationDelay: `${animationDelay}s`,
            animationDuration: `${animationDuration}s`,
          }}
        />
      );
    }

    return leaves;
  };

  return (
    <div className="App">
      <div className="background-animation">
        <img src={cycleImage} className="cycle-image" alt="Moving Cycle" />
        {generateLeaves()} {/* Render falling leaves */}
      </div>
      <div className="login-form">
        <h1>Sign In</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Username"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Password"
            required
          />

          <input
            type="submit"
            value="Login"
          />

          {/* Links for forgot password and signup */}
          <a href="/forgotpassword">Forgot Password</a><br />
          <a href="/signup">Signup</a>
        </form>
        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>
    </div>
  );
};

export default App;