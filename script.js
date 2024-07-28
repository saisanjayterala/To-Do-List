let tasks = [];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    
    if (taskInput.value.trim() !== '') {
        const task = {
            id: Date.now(),
            text: taskInput.value,
            completed: false,
            dueDate: dueDateInput.value,
            priority: priorityInput.value
        };
        
        tasks.push(task);
        renderTasks();
        
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';
    }
}

function renderTasks(filteredTasks = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            <span class="due-date">${task.dueDate}</span>
            <span class="priority ${task.priority}">${task.priority}</span>
            <button onclick="toggleTask(${task.id})"><i class="fas fa-check"></i></button>
            <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
        `;
        taskList.appendChild(li);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
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

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

renderTasks();