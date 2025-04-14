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

// Event Listeners
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

function signup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const university = document.getElementById('university').value;

    if (!username || !password || !university) {
        alert('Please fill in all fields');
        return;
    }

    if (localStorage.getItem(username)) {
        alert('Username already exists');
        return;
    }

    const user = { 
        username, 
        password, 
        university, 
        history: [],
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(username, JSON.stringify(user));
    alert('Account created successfully! Please login.');
    switchTab('login');
    document.getElementById('loginUsername').value = username;
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('university').value = '';
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    const user = JSON.parse(localStorage.getItem(username));
    
    if (!user) {
        alert('User not found');
        return;
    }

    if (user.password !== password) {
        alert('Incorrect password');
        return;
    }

    localStorage.setItem("currentUser", username);
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    showDashboard(username);
}

function showDashboard(username) {
    const user = JSON.parse(localStorage.getItem(username));
    authContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
    welcomeUser.textContent = `Welcome, ${username} (${user.university})`;
    updateHistory(user.history);
}

function logout() {
    localStorage.removeItem("currentUser");
    dashboardContainer.style.display = 'none';
    authContainer.style.display = 'block';
    switchTab('login');
}

function convertNow() {
    const inputValue = parseFloat(document.getElementById('inputValue').value);
    const direction = document.getElementById('direction').value;
    const username = localStorage.getItem("currentUser");
    const user = JSON.parse(localStorage.getItem(username));
    const uni = gradingSystems[user.university];

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

    const conversionType = direction === "cwa-to-cgpa" ? "CWA to CGPA" : "CGPA to CWA";
    const historyItem = {
        date: new Date().toISOString(),
        type: conversionType,
        input: inputValue,
        result: result,
        classification: classification
    };
    
    user.history.unshift(historyItem); // Add to beginning of array
    localStorage.setItem(username, JSON.stringify(user));
    updateHistory(user.history);
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

function clearHistory() {
    const username = localStorage.getItem("currentUser");
    const user = JSON.parse(localStorage.getItem(username));
    
    if (confirm('Are you sure you want to clear your conversion history?')) {
        user.history = [];
        localStorage.setItem(username, JSON.stringify(user));
        updateHistory(user.history);
    }
}