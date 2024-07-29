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
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
    } else {
        alert('Invalid email or password');
    }
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
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Registration successful. Please log in.');
    showAuthForm('login');
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
        
        document.getElementById('taskInput').value = '';
        document.getElementById('dueDateInput').value = '';
        document.getElementById('priorityInput').value = 'low';
        document.getElementById('categoryInput').value = 'personal';
        document.getElementById('reminderInput').value = '';
        document.getElementById('taskNotes').value = '';

        if (task.reminder) {
            scheduleReminder(task);
        }
        flatpickr("#dueDateInput").clear();
        flatpickr("#reminderInput").clear();

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

function loadTasks() {
    const storedTasks = localStorage.getItem(`tasks_${currentUser.email}`);
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
    renderTasks();
    updateStats();
    updateCalendar();
    renderAnalytics();
}

function saveTasks() {
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
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
        origin: { y: 0.6 },
        colors: ['#4a90e2', '#50e3c2', '#f39c12']
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

// Calendar Functions
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: tasks.map(task => ({
            id: task.id.toString(),
            title: task.text,
            start: task.dueDate,
            allDay: true,
            backgroundColor: task.completed ? '#27ae60' : '#3498db'
        })),
        eventClick: function(info) {
            const task = tasks.find(t => t.id === parseInt(info.event.id));
            if (task) {
                alert(`Task: ${task.text}\nDue Date: ${formatDate(task.dueDate)}\nStatus: ${task.completed ? 'Completed' : 'Pending'}`);
            }
        }
    });
    calendar.render();
    calendarEl.fullCalendar = calendar;
}
function updateCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = calendarEl.fullCalendar;
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(tasks.map(task => ({
                id: task.id.toString(),
                title: task.text,
                start: task.dueDate,
                allDay: true,
                backgroundColor: task.completed ? '#27ae60' : '#3498db'
            })));
            calendar.refetchEvents();
        }
    }
}

// Analytics Functions
function renderAnalytics() {
    renderTaskCompletionChart();
    renderCategoryDistributionChart();
    updateProductivityScore();
}

function renderTaskCompletionChart() {
    const ctx = document.getElementById('taskCompletionChart').getContext('2d');
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.length - completedTasks;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completedTasks, pendingTasks],
                backgroundColor: ['#27ae60', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Task Completion Status'
            }
        }
    });
}

function renderCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart').getContext('2d');
    const categories = ['personal', 'work', 'shopping', 'other'];
    const categoryData = categories.map(category => tasks.filter(t => t.category === category).length);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Number of Tasks',
                data: categoryData,
                backgroundColor: ['#3498db', '#e67e22', '#9b59b6', '#34495e']
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Task Distribution by Category'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function updateProductivityScore() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('productivityScore').textContent = `${productivityScore}%`;
}

function switchView(view) {
    taskView.classList.toggle('hidden', view !== 'task');
    calendarView.classList.toggle('hidden', view !== 'calendar');
    analyticsView.classList.toggle('hidden', view !== 'analytics');

    taskViewBtn.classList.toggle('active', view === 'task');
    calendarViewBtn.classList.toggle('active', view === 'calendar');
    analyticsViewBtn.classList.toggle('active', view === 'analytics');

    if (view === 'calendar') {
        initializeCalendar();
    } else if (view === 'analytics') {
        renderAnalytics();
    }
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