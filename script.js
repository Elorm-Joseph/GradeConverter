const gradingSystems = {
    KNUST: {
        toCgpa: (cwa) => (cwa * 4) / 100,
        toCwa: (cgpa) => (cgpa * 100) / 4,
        classify: (cwa) => {
            if (cwa >= 70) return "First Class";
            if (cwa >= 60) return "Second Class Upper";
            if (cwa >= 50) return "Second Class Lower";
            if (cwa >= 40) return "Pass";
            return "Fail";
        },
    },
    UG: {
        toCgpa: (cwa) => cwa / 25,
        toCwa: (cgpa) => cgpa * 25,
        classify: (cgpa) => {
            if (cgpa >= 3.6) return "First Class Honours";
            if (cgpa >= 3.0) return "Second Class Upper";
            if (cgpa >= 2.0) return "Second Class Lower";
            if (cgpa >= 1.5) return "Third Class";
            if (cgpa >= 1.0) return "Pass";
            return "Fail";
        },
    },
    UCC: {
        toCgpa: (cwa) => (cwa * 4) / 100,
        toCwa: (cgpa) => (cgpa * 100) / 4,
        classify: (cgpa) => {
            if (cgpa >= 3.6) return "First Class";
            if (cgpa >= 3.0) return "Second Class Upper";
            if (cgpa >= 2.0) return "Second Class Lower";
            if (cgpa >= 1.5) return "Third Class";
            if (cgpa >= 1.0) return "Pass";
            return "Fail";
        },
    }
};

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const showLogin = document.getElementById('showLogin');
const showSignup = document.getElementById('showSignup');
const welcomeUser = document.getElementById('welcomeUser');
const resultCard = document.getElementById('resultCard');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        showDashboard(currentUser);
    }
    
    // Tab switching
    loginTab.addEventListener('click', () => switchTab('login'));
    signupTab.addEventListener('click', () => switchTab('signup'));
    showLogin.addEventListener('click', () => switchTab('login'));
    showSignup.addEventListener('click', () => switchTab('signup'));
});

// Helper Functions
function switchTab(tab) {
    if (tab === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
    }
}

// Authentication Functions (Backend API)
async function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const university = document.getElementById('university').value;

    if (!username || !password || !university) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, university }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        alert('Account created successfully! Please login.');
        switchTab('login');
        document.getElementById('loginUsername').value = username;
        document.getElementById('signupUsername').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('university').value = '';
    } catch (error) {
        alert(error.message);
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem("currentUser", username);
        localStorage.setItem("userUniversity", data.university);
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        showDashboard(username);
    } catch (error) {
        alert(error.message);
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userUniversity");
    dashboardContainer.style.display = 'none';
    authContainer.style.display = 'block';
    switchTab('login');
}

// Grading Conversion Functions
function convertNow() {
    const inputValue = parseFloat(document.getElementById('inputValue').value);
    const direction = document.getElementById('direction').value;
    const username = localStorage.getItem("currentUser");
    const university = localStorage.getItem("userUniversity");
    const uni = gradingSystems[university];

    if (isNaN(inputValue)) {
        alert('Please enter a valid number');
        return;
    }

    let result, classification;
    if (direction === "cwa-to-cgpa") {
        if (inputValue < 0 || inputValue > 100) {
            alert('CWA must be between 0 and 100');
            return;
        }
        result = uni.toCgpa(inputValue).toFixed(2);
        classification = uni.classify(inputValue);
    } else {
        if (inputValue < 0 || inputValue > 4) {
            alert('CGPA must be between 0 and 4');
            return;
        }
        result = uni.toCwa(inputValue).toFixed(2);
        classification = uni.classify(parseFloat(result));
    }

    document.getElementById("result").innerText = `Result: ${result}`;
    document.getElementById("classification").innerText = `Classification: ${classification}`;
    resultCard.style.display = 'block';

    // Save to history (you may want to send this to your backend)
    const conversionType = direction === "cwa-to-cgpa" ? "CWA to CGPA" : "CGPA to CWA";
    const historyItem = {
        date: new Date().toISOString(),
        type: conversionType,
        input: inputValue,
        result: result,
        classification: classification
    };
    
    // Temporary local storage (replace with API call if needed)
    let history = JSON.parse(localStorage.getItem(`${username}_history`) || "[]");
    history.unshift(historyItem);
    localStorage.setItem(`${username}_history`, JSON.stringify(history));
    updateHistory(history);
}

async function showDashboard(username) {
    try {
        // Fetch user data from backend (optional)
        const response = await fetch(`/api/user/${username}`);
        const user = await response.json();
        
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        welcomeUser.textContent = `Welcome, ${username} (${user.university || localStorage.getItem("userUniversity")})`;
        
        // Load history (from backend or local storage)
        const history = user.history || JSON.parse(localStorage.getItem(`${username}_history`) || "[]");
        updateHistory(history);
    } catch (error) {
        console.error("Failed to load dashboard:", error);
        // Fallback to local storage if API fails
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        welcomeUser.textContent = `Welcome, ${username} (${localStorage.getItem("userUniversity")})`;
        const history = JSON.parse(localStorage.getItem(`${username}_history`) || "[]");
        updateHistory(history);
    }
}

function updateHistory(history) {
    const list = document.getElementById("history");
    list.innerHTML = "";
    
    if (history.length === 0) {
        list.innerHTML = "<li>No conversion history yet</li>";
        return;
    }
    
    history.forEach(item => {
        const li = document.createElement("li");
        const date = new Date(item.date).toLocaleString();
        
        li.innerHTML = `
            <div><strong>${item.type}</strong></div>
            <div>Input: ${item.input}</div>
            <div>Result: ${item.result}</div>
            <div>Classification: ${item.classification}</div>
            <div class="history-date">${date}</div>
        `;
        list.appendChild(li);
    });
}

async function clearHistory() {
    const username = localStorage.getItem("currentUser");
    if (!confirm('Are you sure you want to clear your conversion history?')) return;

    try {
        // Call backend API to clear history if applicable
        await fetch(`/api/user/${username}/history`, { method: 'DELETE' });
    } catch (error) {
        console.error("Failed to clear server history:", error);
    }
    
    // Clear local history
    localStorage.removeItem(`${username}_history`);
    updateHistory([]);
}
