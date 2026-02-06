# 📚 API Documentation

Complete API reference for ReviewFlow SaaS Platform.

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "companyName": "Acme Inc"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "companyName": "Acme Inc"
  }
}
```

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "companyName": "Acme Inc",
    "subscriptionPlan": "free"
  }
}
```

### Get Current User

Get authenticated user's information.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "companyName": "Acme Inc",
    "subscriptionPlan": "free",
    "createdAt": "2024-02-05T10:00:00.000Z"
  }
}
```

---

## ⭐ Review Endpoints

### Get All Reviews

Retrieve all reviews for the authenticated user.

**Endpoint:** `GET /reviews`

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `responded`, `archived`)
- `limit` (optional): Number of reviews to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "reviews": [
    {
      "id": 1,
      "user_id": 1,
      "review_id": "review_1",
      "author_name": "John Davis",
      "author_email": null,
      "rating": 5,
      "review_text": "Outstanding service!",
      "review_date": "2024-02-05T10:00:00.000Z",
      "responded": 0,
      "response_text": null,
      "response_date": null,
      "source": "google",
      "status": "pending",
      "created_at": "2024-02-05T10:00:00.000Z"
    }
  ]
}
```

### Get Single Review

**Endpoint:** `GET /reviews/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "review": {
    "id": 1,
    "author_name": "John Davis",
    "rating": 5,
    "review_text": "Outstanding service!",
    // ... full review object
  }
}
```

### Create Review

Manually add a review.

**Endpoint:** `POST /reviews`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "authorName": "Jane Smith",
  "authorEmail": "jane@example.com",
  "rating": 5,
  "reviewText": "Excellent experience!",
  "reviewDate": "2024-02-05T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review added successfully",
  "reviewId": 6
}
```

### Respond to Review

Send a custom response to a review.

**Endpoint:** `POST /reviews/:id/respond`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "responseText": "Thank you for your wonderful review! We appreciate your business."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response sent successfully"
}
```

### Auto-Respond to Review

Automatically respond using a template.

**Endpoint:** `POST /reviews/:id/auto-respond`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Auto-response sent successfully",
  "responseText": "Thank you for your review! We appreciate your feedback."
}
```

### Update Review Status

**Endpoint:** `PATCH /reviews/:id/status`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "status": "archived"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review status updated"
}
```

### Delete Review

**Endpoint:** `DELETE /reviews/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## 🚀 Campaign Endpoints

### Get All Campaigns

**Endpoint:** `GET /campaigns`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "campaigns": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Post-Purchase Review Request",
      "type": "email",
      "status": "active",
      "send_delay_days": 3,
      "message_template": "Hi {customer_name}, thank you for your purchase!",
      "total_sent": 342,
      "total_collected": 87,
      "created_at": "2024-02-01T10:00:00.000Z",
      "updated_at": "2024-02-05T10:00:00.000Z"
    }
  ]
}
```

### Get Single Campaign

**Endpoint:** `GET /campaigns/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": 1,
    "name": "Post-Purchase Review Request",
    // ... campaign fields
    "recipients": [
      {
        "id": 1,
        "campaign_id": 1,
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "status": "sent",
        "sent_at": "2024-02-05T10:00:00.000Z"
      }
    ]
  }
}
```

### Create Campaign

**Endpoint:** `POST /campaigns`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "New Customer Follow-up",
  "type": "email",
  "sendDelayDays": 7,
  "messageTemplate": "Hi {customer_name}, how was your experience?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaignId": 4
}
```

### Update Campaign

**Endpoint:** `PUT /campaigns/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "Updated Campaign Name",
  "status": "paused"
}
```

### Update Campaign Status

**Endpoint:** `PATCH /campaigns/:id/status`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "status": "active"
}
```

### Add Recipients to Campaign

**Endpoint:** `POST /campaigns/:id/recipients`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "recipients": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 recipient(s) added successfully"
}
```

### Send Campaign

**Endpoint:** `POST /campaigns/:id/send`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Campaign sent to 50 recipient(s)"
}
```

### Delete Campaign

**Endpoint:** `DELETE /campaigns/:id`

**Headers:** `Authorization: Bearer TOKEN`

---

## ⚙️ Automation Endpoints

### Get Automation Settings

**Endpoint:** `GET /automation/settings`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "settings": {
    "id": 1,
    "user_id": 1,
    "auto_response_enabled": 1,
    "ai_response_enabled": 1,
    "review_request_enabled": 1,
    "negative_alert_enabled": 1,
    "negative_threshold": 3,
    "created_at": "2024-02-05T10:00:00.000Z",
    "updated_at": "2024-02-05T10:00:00.000Z"
  }
}
```

### Update Automation Settings

**Endpoint:** `PUT /automation/settings`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "autoResponseEnabled": 1,
  "aiResponseEnabled": 1,
  "reviewRequestEnabled": 0,
  "negativeAlertEnabled": 1,
  "negativeThreshold": 2
}
```

### Get Response Templates

**Endpoint:** `GET /automation/templates`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "templates": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Positive Review Response",
      "template_text": "Thank you for your wonderful review!",
      "rating_range": "4-5",
      "is_default": 1,
      "created_at": "2024-02-05T10:00:00.000Z"
    }
  ]
}
```

### Create Response Template

**Endpoint:** `POST /automation/templates`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "Professional Thank You",
  "templateText": "We appreciate your feedback and look forward to serving you again!",
  "ratingRange": "4-5",
  "isDefault": false
}
```

### Update Response Template

**Endpoint:** `PUT /automation/templates/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "Updated Template Name",
  "templateText": "Updated template text",
  "isDefault": true
}
```

### Delete Response Template

**Endpoint:** `DELETE /automation/templates/:id`

**Headers:** `Authorization: Bearer TOKEN`

---

## 📊 Analytics Endpoints

### Get Dashboard Statistics

**Endpoint:** `GET /analytics/dashboard`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalReviews": 1247,
    "totalReviewsChange": 23,
    "averageRating": 4.8,
    "averageRatingChange": 0.3,
    "responseRate": 98,
    "responseRateChange": 12,
    "activeCampaigns": 8,
    "activeCampaignsChange": 2
  }
}
```

### Get Review Trends

**Endpoint:** `GET /analytics/trends`

**Query Parameters:**
- `period`: Number of days (default: 30)

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "trends": [
    {
      "date": "2024-02-01",
      "count": 15,
      "avg_rating": 4.6
    },
    {
      "date": "2024-02-02",
      "count": 18,
      "avg_rating": 4.8
    }
  ]
}
```

### Get Rating Distribution

**Endpoint:** `GET /analytics/rating-distribution`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "distribution": [
    { "rating": 5, "count": 850 },
    { "rating": 4, "count": 300 },
    { "rating": 3, "count": 70 },
    { "rating": 2, "count": 20 },
    { "rating": 1, "count": 7 }
  ]
}
```

### Get Campaign Performance

**Endpoint:** `GET /analytics/campaign-performance`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "performance": [
    {
      "id": 1,
      "name": "Post-Purchase Review Request",
      "total_sent": 342,
      "total_collected": 87,
      "conversion_rate": 25.44
    }
  ]
}
```

### Get Monthly Report

**Endpoint:** `GET /analytics/monthly-report`

**Query Parameters:**
- `month`: Month number (1-12)
- `year`: Year (e.g., 2024)

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "report": {
    "month": 2,
    "year": 2024,
    "total_reviews": 145,
    "avg_rating": 4.75,
    "total_responses": 142,
    "positive_reviews": 130,
    "negative_reviews": 5
  }
}
```

---

## 👤 User Endpoints

### Get User Profile

**Endpoint:** `GET /user/profile`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "company_name": "Acme Inc",
    "google_business_id": null,
    "subscription_plan": "pro",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-02-05T10:00:00.000Z"
  }
}
```

### Update User Profile

**Endpoint:** `PUT /user/profile`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "name": "John Smith",
  "companyName": "New Company Inc",
  "googleBusinessId": "ChIJ..."
}
```

### Change Password

**Endpoint:** `PUT /user/change-password`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Update Subscription

**Endpoint:** `PUT /user/subscription`

**Headers:** `Authorization: Bearer TOKEN`

**Request Body:**
```json
{
  "plan": "pro"
}
```

**Valid plans:** `free`, `basic`, `pro`, `enterprise`

---

## 🔴 Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided, authorization denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Boolean fields use 0 (false) and 1 (true)
- All successful responses include `success: true`
- JWT tokens expire based on `JWT_EXPIRE` environment variable (default: 7 days)
