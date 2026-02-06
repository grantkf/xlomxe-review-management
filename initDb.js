const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      company_name TEXT,
      google_business_id TEXT,
      subscription_plan TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      review_id TEXT UNIQUE,
      author_name TEXT NOT NULL,
      author_email TEXT,
      rating INTEGER NOT NULL,
      review_text TEXT,
      review_date DATETIME NOT NULL,
      responded BOOLEAN DEFAULT 0,
      response_text TEXT,
      response_date DATETIME,
      source TEXT DEFAULT 'google',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Campaigns table
  db.run(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      send_delay_days INTEGER DEFAULT 0,
      message_template TEXT NOT NULL,
      total_sent INTEGER DEFAULT 0,
      total_collected INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Campaign Recipients table
  db.run(`
    CREATE TABLE IF NOT EXISTS campaign_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      status TEXT DEFAULT 'pending',
      sent_at DATETIME,
      review_submitted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    )
  `);

  // Automation Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS automation_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      auto_response_enabled BOOLEAN DEFAULT 1,
      ai_response_enabled BOOLEAN DEFAULT 1,
      review_request_enabled BOOLEAN DEFAULT 1,
      negative_alert_enabled BOOLEAN DEFAULT 1,
      negative_threshold INTEGER DEFAULT 3,
      response_templates TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Response Templates table
  db.run(`
    CREATE TABLE IF NOT EXISTS response_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      template_text TEXT NOT NULL,
      rating_range TEXT,
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Analytics table
  db.run(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date DATE NOT NULL,
      total_reviews INTEGER DEFAULT 0,
      average_rating REAL DEFAULT 0,
      responses_sent INTEGER DEFAULT 0,
      campaigns_sent INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables created successfully!');
  
  // Insert sample data for demo
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('demo123', 10);
  
  db.run(`
    INSERT OR IGNORE INTO users (email, password, name, company_name, subscription_plan)
    VALUES (?, ?, ?, ?, ?)
  `, ['demo@reviewflow.com', hashedPassword, 'Demo User', 'Demo Company', 'pro'], function(err) {
    if (err) {
      console.error('Error creating demo user:', err);
    } else {
      console.log('✅ Demo user created: demo@reviewflow.com / demo123');
      
      // Insert sample reviews
      const userId = this.lastID || 1;
      
      const sampleReviews = [
        ['John Davis', 5, 'Outstanding service! The team was professional, responsive, and went above and beyond. Highly recommend to anyone looking for quality work.', '2024-02-05 10:00:00'],
        ['Sarah Martinez', 5, 'Great experience from start to finish. Everything was handled professionally and the results exceeded my expectations!', '2024-02-05 07:00:00'],
        ['Michael Johnson', 4, 'Very satisfied with the service. Quick turnaround and excellent communication throughout the process.', '2024-02-04 14:30:00'],
        ['Emily Chen', 5, 'Absolutely fantastic! Would definitely use again and recommend to friends and family.', '2024-02-04 09:15:00'],
        ['Robert Williams', 3, 'Service was okay but took longer than expected. Could improve on communication.', '2024-02-03 16:45:00']
      ];
      
      sampleReviews.forEach((review, index) => {
        db.run(`
          INSERT INTO reviews (user_id, review_id, author_name, rating, review_text, review_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, `review_${index + 1}`, review[0], review[1], review[2], review[3], 'pending']);
      });
      
      // Insert sample campaigns
      db.run(`
        INSERT INTO campaigns (user_id, name, type, status, send_delay_days, message_template, total_sent, total_collected)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, 'Post-Purchase Review Request', 'email', 'active', 3, 
          'Hi {customer_name}, thank you for your recent purchase! We\'d love to hear about your experience.', 
          342, 87]);
      
      db.run(`
        INSERT INTO campaigns (user_id, name, type, status, send_delay_days, message_template, total_sent, total_collected)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, 'Service Completion Follow-up', 'email', 'active', 1, 
          'Hi {customer_name}, thank you for choosing our service! Please share your feedback.', 
          156, 42]);
      
      // Insert automation settings
      db.run(`
        INSERT INTO automation_settings (user_id)
        VALUES (?)
      `, [userId]);
      
      // Insert default response templates
      db.run(`
        INSERT INTO response_templates (user_id, name, template_text, rating_range, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, 'Positive Review Response', 
          'Thank you so much for taking the time to leave us such a wonderful review! We truly appreciate your business and look forward to serving you again.', 
          '4-5', 1]);
      
      db.run(`
        INSERT INTO response_templates (user_id, name, template_text, rating_range, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, 'Negative Review Response', 
          'Thank you for your feedback. We\'re sorry to hear about your experience. We\'d like to make this right. Please contact us directly so we can address your concerns.', 
          '1-3', 1]);
      
      console.log('✅ Sample data inserted successfully!');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('✅ Database initialization complete!');
  }
});
