// server.js (Backend)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Assuming you have a User model

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Twilio configuration
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Route for sending the reset code
app.post('/api/forgot-password', async (req, res) => {
  const { phoneNumber } = req.body; // or email

  try {
    // Find the user by phone/email
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

    // Save the reset code in the database or session for later validation
    user.resetCode = resetCode;
    await user.save();

    // Send SMS with Twilio
    await client.messages.create({
      body: `Your password reset code is: ${resetCode}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber, // User's phone number
    });

    return res.status(200).json({ message: 'Verification code sent!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

// Route for resetting the password
app.post('/api/reset-password', async (req, res) => {
  const { phoneNumber, resetCode, newPassword } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the reset code matches
    if (user.resetCode !== parseInt(resetCode)) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Hash and update the password
    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetCode = null; // Clear reset code after use
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});



// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetCode: { type: Number, default: null },
});

module.exports = mongoose.model('User', UserSchema);






// Frontend
// ForgotPassword.js (Frontend)
import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post('/api/forgot-password', { phoneNumber });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error: ' + error.response.data.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post('/api/reset-password', { phoneNumber, resetCode, newPassword });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error: ' + error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <div>
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <button onClick={handleForgotPassword}>Send Reset Code</button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Reset Code"
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handleResetPassword}>Reset Password</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;
