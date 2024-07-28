let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    const categoryInput = document.getElementById('categoryInput');
    
    if (taskInput.value.trim() !== '') {
        const task = {
            id: Date.now(),
            text: taskInput.value,
            completed: false,
            dueDate: dueDateInput.value,
            priority: priorityInput.value,
            category: categoryInput.value,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        updateStats();
        
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';
        categoryInput.value = 'personal';
    }
}

function renderTasks(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <span class="due-date">${formatDate(task.dueDate)}</span>
                <span class="priority ${task.priority}">${task.priority}</span>
                <span class="category">${task.category}</span>
            </div>
            <div class="task-actions">
                <button onclick="toggleTask(${task.id})"><i class="fas fa-check"></i></button>
                <button onclick="editTask(${task.id})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
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
        }
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
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
    setActiveFilter(filter);
}

function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const filteredTasks = category === 'all' ? tasks : tasks.filter(t => t.category === category);
    renderTasks(filteredTasks);
}

function setActiveFilter(filter) {
    const buttons = document.querySelectorAll('.filter-container button');
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="filterTasks('${filter}')"]`).classList.add('active');
}

function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    document.getElementById('totalTasks').textContent = `Total: ${totalTasks}`;
    document.getElementById('completedTasks').textContent = `Completed: ${completedTasks}`;
    document.getElementById('pendingTasks').textContent = `Pending: ${pendingTasks}`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('dateTime').textContent = now.toLocaleDateString(undefined, options);
}

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

setInterval(updateDateTime, 1000);
updateDateTime();
renderTasks();
updateStats();