// API Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication
async function login(email, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    } catch (error) {
        throw error;
    }
}

async function register(email, password, name, companyName) {
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, companyName })
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    } catch (error) {
        throw error;
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function isLoggedIn() {
    return !!authToken;
}

// Dashboard Data
async function getDashboardStats() {
    try {
        const data = await apiRequest('/analytics/dashboard');
        updateDashboardUI(data.stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

function updateDashboardUI(stats) {
    // Update stat cards
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = stats.totalReviews;
    document.querySelector('.stat-card:nth-child(1) .stat-change span:first-child').textContent = `↑ ${stats.totalReviewsChange}%`;

    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = stats.averageRating;
    document.querySelector('.stat-card:nth-child(2) .stat-change span:first-child').textContent = `↑ ${stats.averageRatingChange}`;

    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = `${stats.responseRate}%`;
    document.querySelector('.stat-card:nth-child(3) .stat-change span:first-child').textContent = `↑ ${stats.responseRateChange}%`;

    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = stats.activeCampaigns;
    document.querySelector('.stat-card:nth-child(4) .stat-change span:first-child').textContent = `↑ ${stats.activeCampaignsChange}`;
}

// Reviews
async function getReviews(status = null) {
    try {
        const endpoint = status ? `/reviews?status=${status}` : '/reviews';
        const data = await apiRequest(endpoint);
        displayReviews(data.reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function displayReviews(reviews) {
    const reviewList = document.getElementById('reviewList');
    if (!reviewList) return;

    reviewList.innerHTML = '';

    if (reviews.length === 0) {
        reviewList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No reviews found</p>';
        return;
    }

    reviews.forEach(review => {
        const stars = '⭐'.repeat(review.rating);
        const timeAgo = getTimeAgo(review.review_date);
        const initials = review.author_name.split(' ').map(n => n[0]).join('').toUpperCase();

        const reviewHTML = `
            <div class="review-item" data-review-id="${review.id}">
                <div class="review-header">
                    <div class="review-author">
                        <div class="avatar">${initials}</div>
                        <div class="author-info">
                            <h4>${review.author_name}</h4>
                            <span class="review-date">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="stars">${stars}</div>
                </div>
                <p class="review-text">${review.review_text || 'No review text provided'}</p>
                ${review.responded ? `
                    <div style="background: var(--dark); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                        <strong style="color: var(--success);">Your Response:</strong>
                        <p style="color: var(--text-muted); margin-top: 0.5rem;">${review.response_text}</p>
                    </div>
                ` : `
                    <div class="review-actions">
                        <button class="review-btn" onclick="autoRespondToReview(${review.id})">Auto Respond</button>
                        <button class="review-btn" onclick="showCustomResponseModal(${review.id})">Custom Response</button>
                        <button class="review-btn" onclick="markAsRead(${review.id})">Mark as Read</button>
                    </div>
                `}
            </div>
        `;

        reviewList.insertAdjacentHTML('beforeend', reviewHTML);
    });
}

async function autoRespondToReview(reviewId) {
    try {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.innerHTML = '<span class="loading"></span>';
        btn.disabled = true;

        const data = await apiRequest(`/reviews/${reviewId}/auto-respond`, {
            method: 'POST'
        });

        btn.textContent = '✓ Responded';
        btn.style.background = 'var(--success)';
        btn.style.borderColor = 'var(--success)';

        setTimeout(() => {
            getReviews(); // Refresh reviews
        }, 1000);
    } catch (error) {
        alert('Error sending auto-response: ' + error.message);
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function respondToReview(reviewId, responseText) {
    try {
        await apiRequest(`/reviews/${reviewId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ responseText })
        });

        return true;
    } catch (error) {
        throw error;
    }
}

function showCustomResponseModal(reviewId) {
    const modal = document.getElementById('respondModal');
    modal.dataset.reviewId = reviewId;
    modal.classList.add('active');
}

async function submitCustomResponse() {
    const modal = document.getElementById('respondModal');
    const reviewId = modal.dataset.reviewId;
    const textarea = modal.querySelector('textarea');
    const responseText = textarea.value.trim();

    if (!responseText) {
        alert('Please enter a response');
        return;
    }

    const btn = event.target;
    const originalText = btn.textContent;
    btn.innerHTML = '<span class="loading"></span>';
    btn.disabled = true;

    try {
        await respondToReview(reviewId, responseText);
        modal.classList.remove('active');
        textarea.value = '';
        getReviews(); // Refresh reviews
        alert('Response sent successfully!');
    } catch (error) {
        alert('Error sending response: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function markAsRead(reviewId) {
    try {
        await apiRequest(`/reviews/${reviewId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'archived' })
        });

        getReviews(); // Refresh reviews
    } catch (error) {
        alert('Error updating review: ' + error.message);
    }
}

// Campaigns
async function getCampaigns() {
    try {
        const data = await apiRequest('/campaigns');
        displayCampaigns(data.campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
    }
}

function displayCampaigns(campaigns) {
    // Implementation for displaying campaigns
    // Similar to displayReviews
}

async function createCampaign(campaignData) {
    try {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.innerHTML = '<span class="loading"></span>';
        btn.disabled = true;

        await apiRequest('/campaigns', {
            method: 'POST',
            body: JSON.stringify(campaignData)
        });

        hideModal('newCampaign');
        getCampaigns(); // Refresh campaigns
        alert('Campaign created successfully!');
    } catch (error) {
        alert('Error creating campaign: ' + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Automation Settings
async function getAutomationSettings() {
    try {
        const data = await apiRequest('/automation/settings');
        updateAutomationUI(data.settings);
    } catch (error) {
        console.error('Error fetching automation settings:', error);
    }
}

function updateAutomationUI(settings) {
    // Update toggle switches based on settings
    document.querySelectorAll('.automation-card').forEach((card, index) => {
        const toggle = card.querySelector('input[type="checkbox"]');
        if (toggle) {
            switch(index) {
                case 0:
                    toggle.checked = settings.auto_response_enabled;
                    break;
                case 1:
                    toggle.checked = settings.ai_response_enabled;
                    break;
                case 2:
                    toggle.checked = settings.review_request_enabled;
                    break;
                case 3:
                    toggle.checked = settings.negative_alert_enabled;
                    break;
            }
        }
    });
}

async function updateAutomationSettings(settings) {
    try {
        await apiRequest('/automation/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    } catch (error) {
        console.error('Error updating automation settings:', error);
    }
}

// Utility Functions
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }

    return 'just now';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        // Load dashboard data
        getDashboardStats();
        getReviews();
        getCampaigns();
        getAutomationSettings();
    } else {
        // Show login/register UI
        // In production, you'd redirect to a login page
        console.log('User not logged in');
    }

    // Setup automation toggle listeners
    document.querySelectorAll('.toggle-switch input').forEach((toggle, index) => {
        toggle.addEventListener('change', async (e) => {
            const settings = {};
            const settingNames = [
                'autoResponseEnabled',
                'aiResponseEnabled',
                'reviewRequestEnabled',
                'negativeAlertEnabled'
            ];
            
            settings[settingNames[index]] = e.target.checked ? 1 : 0;
            await updateAutomationSettings(settings);
        });
    });
});

// Export functions for global use
window.login = login;
window.register = register;
window.logout = logout;
window.autoRespondToReview = autoRespondToReview;
window.submitCustomResponse = submitCustomResponse;
window.showCustomResponseModal = showCustomResponseModal;
window.markAsRead = markAsRead;
window.createCampaign = createCampaign;
