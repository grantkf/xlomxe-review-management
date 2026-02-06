const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authMiddleware = require('../middleware/auth');

// Get dashboard statistics
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Get total reviews
    const totalReviews = await db.get(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [req.user.id]
    );
    
    // Get reviews from last month for comparison
    const lastMonthReviews = await db.get(
      `SELECT COUNT(*) as count FROM reviews 
       WHERE user_id = ? AND review_date >= date('now', '-1 month')`,
      [req.user.id]
    );
    
    // Get average rating
    const avgRating = await db.get(
      'SELECT AVG(rating) as avg FROM reviews WHERE user_id = ?',
      [req.user.id]
    );
    
    // Get response rate
    const responseStats = await db.get(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN responded = 1 THEN 1 ELSE 0 END) as responded
       FROM reviews WHERE user_id = ?`,
      [req.user.id]
    );
    
    const responseRate = responseStats.total > 0 
      ? Math.round((responseStats.responded / responseStats.total) * 100)
      : 0;
    
    // Get active campaigns
    const activeCampaigns = await db.get(
      'SELECT COUNT(*) as count FROM campaigns WHERE user_id = ? AND status = ?',
      [req.user.id, 'active']
    );
    
    // Get recent reviews (last 7 days) for trending
    const recentReviews = await db.get(
      `SELECT COUNT(*) as count FROM reviews 
       WHERE user_id = ? AND review_date >= date('now', '-7 days')`,
      [req.user.id]
    );
    
    // Calculate percentage changes (mock for now)
    const reviewsChange = lastMonthReviews.count > 0 ? 23 : 0;
    const ratingChange = 0.3;
    const responseChange = 12;
    const campaignsChange = 2;
    
    res.json({
      success: true,
      stats: {
        totalReviews: totalReviews.count || 0,
        totalReviewsChange: reviewsChange,
        averageRating: avgRating.avg ? parseFloat(avgRating.avg.toFixed(1)) : 0,
        averageRatingChange: ratingChange,
        responseRate: responseRate,
        responseRateChange: responseChange,
        activeCampaigns: activeCampaigns.count || 0,
        activeCampaignsChange: campaignsChange
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard statistics' 
    });
  }
});

// Get review trends over time
router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    
    const trends = await db.all(
      `SELECT 
         DATE(review_date) as date,
         COUNT(*) as count,
         AVG(rating) as avg_rating
       FROM reviews 
       WHERE user_id = ? AND review_date >= date('now', '-${period} days')
       GROUP BY DATE(review_date)
       ORDER BY date ASC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching trends' 
    });
  }
});

// Get rating distribution
router.get('/rating-distribution', authMiddleware, async (req, res) => {
  try {
    const distribution = await db.all(
      `SELECT 
         rating,
         COUNT(*) as count
       FROM reviews 
       WHERE user_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      distribution
    });
  } catch (error) {
    console.error('Get rating distribution error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching rating distribution' 
    });
  }
});

// Get campaign performance
router.get('/campaign-performance', authMiddleware, async (req, res) => {
  try {
    const performance = await db.all(
      `SELECT 
         id,
         name,
         total_sent,
         total_collected,
         CASE 
           WHEN total_sent > 0 THEN ROUND((total_collected * 100.0 / total_sent), 2)
           ELSE 0
         END as conversion_rate
       FROM campaigns 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    
    res.json({
      success: true,
      performance
    });
  } catch (error) {
    console.error('Get campaign performance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching campaign performance' 
    });
  }
});

// Get monthly report
router.get('/monthly-report', authMiddleware, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    const report = await db.get(
      `SELECT 
         COUNT(*) as total_reviews,
         AVG(rating) as avg_rating,
         SUM(CASE WHEN responded = 1 THEN 1 ELSE 0 END) as total_responses,
         SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_reviews,
         SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative_reviews
       FROM reviews 
       WHERE user_id = ? 
         AND strftime('%m', review_date) = ?
         AND strftime('%Y', review_date) = ?`,
      [req.user.id, currentMonth.toString().padStart(2, '0'), currentYear.toString()]
    );
    
    res.json({
      success: true,
      report: {
        month: currentMonth,
        year: currentYear,
        ...report,
        avg_rating: report.avg_rating ? parseFloat(report.avg_rating.toFixed(2)) : 0
      }
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching monthly report' 
    });
  }
});

module.exports = router;
