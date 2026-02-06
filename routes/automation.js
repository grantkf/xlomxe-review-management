const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authMiddleware = require('../middleware/auth');

// Get automation settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const settings = await db.get(
      'SELECT * FROM automation_settings WHERE user_id = ?',
      [req.user.id]
    );
    
    if (!settings) {
      // Create default settings if none exist
      await db.run(
        'INSERT INTO automation_settings (user_id) VALUES (?)',
        [req.user.id]
      );
      
      const newSettings = await db.get(
        'SELECT * FROM automation_settings WHERE user_id = ?',
        [req.user.id]
      );
      
      return res.json({
        success: true,
        settings: newSettings
      });
    }
    
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get automation settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching automation settings' 
    });
  }
});

// Update automation settings
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const {
      autoResponseEnabled,
      aiResponseEnabled,
      reviewRequestEnabled,
      negativeAlertEnabled,
      negativeThreshold
    } = req.body;
    
    await db.run(
      `UPDATE automation_settings 
       SET auto_response_enabled = COALESCE(?, auto_response_enabled),
           ai_response_enabled = COALESCE(?, ai_response_enabled),
           review_request_enabled = COALESCE(?, review_request_enabled),
           negative_alert_enabled = COALESCE(?, negative_alert_enabled),
           negative_threshold = COALESCE(?, negative_threshold),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        autoResponseEnabled,
        aiResponseEnabled,
        reviewRequestEnabled,
        negativeAlertEnabled,
        negativeThreshold,
        req.user.id
      ]
    );
    
    res.json({
      success: true,
      message: 'Automation settings updated successfully'
    });
  } catch (error) {
    console.error('Update automation settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating automation settings' 
    });
  }
});

// Get response templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const templates = await db.all(
      'SELECT * FROM response_templates WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching templates' 
    });
  }
});

// Create response template
router.post('/templates', authMiddleware, async (req, res) => {
  try {
    const { name, templateText, ratingRange, isDefault } = req.body;
    
    if (!name || !templateText) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and template text are required' 
      });
    }
    
    // If setting as default, unset other defaults in same range
    if (isDefault && ratingRange) {
      await db.run(
        `UPDATE response_templates 
         SET is_default = 0 
         WHERE user_id = ? AND rating_range = ?`,
        [req.user.id, ratingRange]
      );
    }
    
    const result = await db.run(
      `INSERT INTO response_templates (user_id, name, template_text, rating_range, is_default)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, name, templateText, ratingRange || null, isDefault ? 1 : 0]
    );
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      templateId: result.id
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating template' 
    });
  }
});

// Update response template
router.put('/templates/:id', authMiddleware, async (req, res) => {
  try {
    const { name, templateText, ratingRange, isDefault } = req.body;
    
    // Check if template exists and belongs to user
    const template = await db.get(
      'SELECT * FROM response_templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }
    
    // If setting as default, unset other defaults in same range
    if (isDefault && ratingRange) {
      await db.run(
        `UPDATE response_templates 
         SET is_default = 0 
         WHERE user_id = ? AND rating_range = ? AND id != ?`,
        [req.user.id, ratingRange, req.params.id]
      );
    }
    
    await db.run(
      `UPDATE response_templates 
       SET name = COALESCE(?, name),
           template_text = COALESCE(?, template_text),
           rating_range = COALESCE(?, rating_range),
           is_default = COALESCE(?, is_default)
       WHERE id = ?`,
      [name, templateText, ratingRange, isDefault ? 1 : 0, req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating template' 
    });
  }
});

// Delete response template
router.delete('/templates/:id', authMiddleware, async (req, res) => {
  try {
    await db.run(
      'DELETE FROM response_templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting template' 
    });
  }
});

module.exports = router;
