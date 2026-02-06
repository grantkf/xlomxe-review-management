const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authMiddleware = require('../middleware/auth');

// Get all campaigns for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const campaigns = await db.all(
      'SELECT * FROM campaigns WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching campaigns' 
    });
  }
});

// Get single campaign
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await db.get(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    // Get recipients for this campaign
    const recipients = await db.all(
      'SELECT * FROM campaign_recipients WHERE campaign_id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      campaign: {
        ...campaign,
        recipients
      }
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching campaign' 
    });
  }
});

// Create new campaign
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, sendDelayDays, messageTemplate } = req.body;
    
    if (!name || !type || !messageTemplate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, type, and message template are required' 
      });
    }
    
    const result = await db.run(
      `INSERT INTO campaigns (user_id, name, type, send_delay_days, message_template, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name,
        type,
        sendDelayDays || 0,
        messageTemplate,
        'active'
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaignId: result.id
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating campaign' 
    });
  }
});

// Update campaign
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, type, sendDelayDays, messageTemplate, status } = req.body;
    
    // Check if campaign exists and belongs to user
    const campaign = await db.get(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    await db.run(
      `UPDATE campaigns 
       SET name = COALESCE(?, name),
           type = COALESCE(?, type),
           send_delay_days = COALESCE(?, send_delay_days),
           message_template = COALESCE(?, message_template),
           status = COALESCE(?, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, type, sendDelayDays, messageTemplate, status, req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating campaign' 
    });
  }
});

// Update campaign status (pause/activate)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    await db.run(
      'UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Campaign status updated'
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating campaign status' 
    });
  }
});

// Add recipients to campaign
router.post('/:id/recipients', authMiddleware, async (req, res) => {
  try {
    const { recipients } = req.body; // Array of {name, email, phone}
    
    if (!recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipients array is required' 
      });
    }
    
    // Check if campaign exists and belongs to user
    const campaign = await db.get(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    // Insert recipients
    for (const recipient of recipients) {
      await db.run(
        `INSERT INTO campaign_recipients (campaign_id, customer_name, customer_email, customer_phone)
         VALUES (?, ?, ?, ?)`,
        [req.params.id, recipient.name, recipient.email || null, recipient.phone || null]
      );
    }
    
    res.json({
      success: true,
      message: `${recipients.length} recipient(s) added successfully`
    });
  } catch (error) {
    console.error('Add recipients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding recipients' 
    });
  }
});

// Send campaign to recipients
router.post('/:id/send', authMiddleware, async (req, res) => {
  try {
    // Check if campaign exists and belongs to user
    const campaign = await db.get(
      'SELECT * FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!campaign) {
      return res.status(404).json({ 
        success: false, 
        message: 'Campaign not found' 
      });
    }
    
    // Get pending recipients
    const recipients = await db.all(
      'SELECT * FROM campaign_recipients WHERE campaign_id = ? AND status = ?',
      [req.params.id, 'pending']
    );
    
    // In production, this would send actual emails/SMS
    // For now, we'll just mark them as sent
    for (const recipient of recipients) {
      await db.run(
        `UPDATE campaign_recipients 
         SET status = 'sent', sent_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [recipient.id]
      );
    }
    
    // Update campaign stats
    await db.run(
      `UPDATE campaigns 
       SET total_sent = total_sent + ?
       WHERE id = ?`,
      [recipients.length, req.params.id]
    );
    
    res.json({
      success: true,
      message: `Campaign sent to ${recipients.length} recipient(s)`
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending campaign' 
    });
  }
});

// Delete campaign
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.run(
      'DELETE FROM campaigns WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting campaign' 
    });
  }
});

module.exports = router;
