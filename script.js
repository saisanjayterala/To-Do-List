let currentUser = null;
let tasks = [];

// DOM Elements
const authPage = document.getElementById('auth-page');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const darkModeToggle = document.getElementById('darkModeToggle');
const taskList = document.getElementById('taskList');
const taskViewBtn = document.getElementById('task-view-btn');
const calendarViewBtn = document.getElementById('calendar-view-btn');
const analyticsViewBtn = document.getElementById('analytics-view-btn');
const taskView = document.getElementById('task-view');
const calendarView = document.getElementById('calendar-view');
const analyticsView = document.getElementById('analytics-view');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
loginTab.addEventListener('click', () => showAuthForm('login'));
registerTab.addEventListener('click', () => showAuthForm('register'));
logoutBtn.addEventListener('click', handleLogout);
darkModeToggle.addEventListener('click', toggleDarkMode);
taskViewBtn.addEventListener('click', () => switchView('task'));
calendarViewBtn.addEventListener('click', () => switchView('calendar'));
analyticsViewBtn.addEventListener('click', () => switchView('analytics'));

// Flatpickr Initialization
flatpickr("#dueDateInput", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

flatpickr("#reminderInput", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

// Auth Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulating a successful login
    currentUser = { name: 'John Doe', email: email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showMainApp();
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Simulating a successful registration
    currentUser = { name: name, email: email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showMainApp();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAuthPage();
}

function showAuthForm(form) {
    loginForm.classList.toggle('hidden', form !== 'login');
    registerForm.classList.toggle('hidden', form !== 'register');
    loginTab.classList.toggle('active', form === 'login');
    registerTab.classList.toggle('active', form === 'register');
}

function showAuthPage() {
    authPage.classList.remove('hidden');
    mainApp.classList.add('hidden');
}

function showMainApp() {
    authPage.classList.add('hidden');
    mainApp.classList.remove('hidden');
    userNameSpan.textContent = currentUser.name;
    loadTasks();
    renderTasks();
    updateStats();
    initializeCalendar();
    renderAnalytics();
}

// Task Management Functions
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    const categoryInput = document.getElementById('categoryInput');
    const reminderInput = document.getElementById('reminderInput');
    const taskNotes = document.getElementById('taskNotes');
    
    if (taskInput.value.trim() !== '') {
        const task = {
            id: Date.now(),
            text: taskInput.value,
            completed: false,
            dueDate: dueDateInput.value,
            priority: priorityInput.value,
            category: categoryInput.value,
            reminder: reminderInput.value,
            notes: taskNotes.value,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        updateStats();
        updateCalendar();
        renderAnalytics();
        
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';
        categoryInput.value = 'personal';
        reminderInput.value = '';
        taskNotes.value = '';

        if (task.reminder) {
            scheduleReminder(task);
        }

        showConfetti();
    }
}

function renderTasks(filteredTasks = tasks) {
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-details">
                    <span class="due-date">${formatDate(task.dueDate)}</span>
                    <span class="priority">${task.priority}</span>
                    <span class="category">${task.category}</span>
                    ${task.reminder ? `<span class="reminder">🔔 ${formatDate(task.reminder)}</span>` : ''}
                </div>
                ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
            </div>
            <div class="task-actions">
                <button onclick="toggleTask(${task.id})" class="toggle-btn">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button onclick="editTask(${task.id})" class="edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask(${task.id})" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });

    // Initialize drag and drop
    new Sortable(taskList, {
        animation: 150,
        onEnd: function(evt) {
            const taskId = parseInt(evt.item.querySelector('.toggle-btn').getAttribute('onclick').match(/\d+/)[0]);
            const task = tasks.find(t => t.id === taskId);
            tasks.splice(tasks.indexOf(task), 1);
            tasks.splice(evt.newIndex, 0, task);
            saveTasks();
        }
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
        updateCalendar();
        renderAnalytics();

        if (task.completed) {
            showConfetti();
        }
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null) {
            task.text = newText;
            saveTasks();
            renderTasks();
            updateCalendar();
            renderAnalytics();
        }
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    updateCalendar();
    renderAnalytics();
}

function filterTasks(filter) {
    let filteredTasks;
    switch(filter) {
        case 'active':
            filteredTasks = tasks.filter(t => !t.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(t => t.completed);
            break;
        default:
            filteredTasks = tasks;
    }
    renderTasks(filteredTasks);
}

function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const filteredTasks = category === 'all' ? tasks : tasks.filter(t => t.category === category);
    renderTasks(filteredTasks);
}

function searchTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredTasks = tasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm) ||
        task.category.toLowerCase().includes(searchTerm) ||
        task.priority.toLowerCase().includes(searchTerm)
    );
    renderTasks(filteredTasks);
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    animateNumber('totalTasks', totalTasks);
    animateNumber('completedTasks', completedTasks);
    animateNumber('pendingTasks', pendingTasks);
}

function animateNumber(elementId, finalValue) {
    const element = document.getElementById(elementId);
    const startValue = parseInt(element.textContent, 10);
    gsap.to(element, {
        innerHTML: finalValue,
        duration: 1,
        ease: "power2.out",
        snap: { innerHTML: 1 }
    });
}

function saveTasks() {
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem(`tasks_${currentUser.email}`);
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('dateTime').textContent = now.toLocaleDateString(undefined, options);
}

function showConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function scheduleReminder(task) {
    const reminderTime = new Date(task.reminder).getTime();
    const now = new Date().getTime();
    const timeUntilReminder = reminderTime - now;

    if (timeUntilReminder > 0) {
        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification("Task Reminder", {
                    body: task.text,
                    icon: "path/to/icon.png" // Add your icon path here
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification("Task Reminder", {
                            body: task.text,
                            icon: "path/to/icon.png" // Add your icon path here
                        });
                    }
                });
            }
        }, timeUntilReminder);
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Initialize
function init() {
    const loadingScreen = document.getElementById('loading-screen');
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.5,
        delay: 1,
        onComplete: () => {
            loadingScreen.style.display = 'none';
        }
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Check for logged in user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showMainApp();
    } else {
        showAuthPage();
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

// Call init function when the page loads
window.addEventListener('load', init);