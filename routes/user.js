const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const authMiddleware = require('../middleware/auth');

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.get(
      `SELECT id, email, name, company_name, google_business_id, 
              subscription_plan, created_at, updated_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile' 
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, companyName, googleBusinessId } = req.body;
    
    await db.run(
      `UPDATE users 
       SET name = COALESCE(?, name),
           company_name = COALESCE(?, company_name),
           google_business_id = COALESCE(?, google_business_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, companyName, googleBusinessId, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile' 
    });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }
    
    // Get current user with password
    const user = await db.get(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error changing password' 
    });
  }
});

// Update subscription plan
router.put('/subscription', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['free', 'basic', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid subscription plan' 
      });
    }
    
    await db.run(
      'UPDATE users SET subscription_plan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [plan, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      plan
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating subscription' 
    });
  }
});

module.exports = router;
