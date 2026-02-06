const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authMiddleware = require('../middleware/auth');

// Get all reviews for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM reviews WHERE user_id = ?';
    const params = [req.user.id];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY review_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const reviews = await db.all(query, params);
    
    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching reviews' 
    });
  }
});

// Get single review
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await db.get(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching review' 
    });
  }
});

// Create review (manually add)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { authorName, authorEmail, rating, reviewText, reviewDate } = req.body;
    
    if (!authorName || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Author name and rating are required' 
      });
    }
    
    const result = await db.run(
      `INSERT INTO reviews (user_id, author_name, author_email, rating, review_text, review_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        authorName,
        authorEmail || null,
        rating,
        reviewText || null,
        reviewDate || new Date().toISOString(),
        'pending'
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      reviewId: result.id
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating review' 
    });
  }
});

// Respond to review
router.post('/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { responseText } = req.body;
    
    if (!responseText) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response text is required' 
      });
    }
    
    // Check if review exists and belongs to user
    const review = await db.get(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    // Update review with response
    await db.run(
      `UPDATE reviews 
       SET responded = 1, response_text = ?, response_date = ?, status = 'responded'
       WHERE id = ?`,
      [responseText, new Date().toISOString(), req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error responding to review' 
    });
  }
});

// Auto-respond to review (uses template)
router.post('/:id/auto-respond', authMiddleware, async (req, res) => {
  try {
    // Check if review exists and belongs to user
    const review = await db.get(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }
    
    // Get appropriate template based on rating
    const ratingRange = review.rating >= 4 ? '4-5' : '1-3';
    const template = await db.get(
      `SELECT template_text FROM response_templates 
       WHERE user_id = ? AND rating_range = ? AND is_default = 1
       LIMIT 1`,
      [req.user.id, ratingRange]
    );
    
    const responseText = template 
      ? template.template_text 
      : 'Thank you for your review! We appreciate your feedback.';
    
    // Update review with auto-response
    await db.run(
      `UPDATE reviews 
       SET responded = 1, response_text = ?, response_date = ?, status = 'responded'
       WHERE id = ?`,
      [responseText, new Date().toISOString(), req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Auto-response sent successfully',
      responseText
    });
  } catch (error) {
    console.error('Auto-respond error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending auto-response' 
    });
  }
});

// Update review status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'responded', 'archived'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    await db.run(
      'UPDATE reviews SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Review status updated'
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating review status' 
    });
  }
});

// Delete review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.run(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting review' 
    });
  }
});

module.exports = router;
