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
        
        // Animate new task
        const newTaskElement = document.querySelector('#taskList li:last-child');
        gsap.from(newTaskElement, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power2.out"
        });

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
        li.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        li.innerHTML = `
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-details">
                    <span class="due-date">${formatDate(task.dueDate)}</span>
                    <span class="priority">${task.priority}</span>
                    <span class="category">${task.category}</span>
                </div>
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
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();

        // Animate task completion
        const taskElement = document.querySelector(`[onclick="toggleTask(${id})"]`).closest('li');
        gsap.to(taskElement, {
            backgroundColor: task.completed ? 'rgba(232, 245, 233, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            duration: 0.3,
            ease: "power2.inOut"
        });

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

            // Animate edited task
            const taskElement = document.querySelector(`[onclick="editTask(${id})"]`).closest('li');
            gsap.from(taskElement, {
                scale: 1.05,
                duration: 0.3,
                ease: "elastic.out(1, 0.5)"
            });
        }
    }
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[onclick="deleteTask(${id})"]`).closest('li');
    
    // Animate task removal
    gsap.to(taskElement, {
        opacity: 0,
        x: 100,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            updateStats();
        }
    });
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

function showConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function animateStats() {
    gsap.from(".stat-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: "power2.out"
    });
}

function animateTaskList() {
    gsap.from("#taskList li", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
    });
}

document.querySelectorAll('.filter-container button').forEach(button => {
    button.addEventListener('click', function() {
        gsap.from(this, {
            scale: 0.9,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)"
        });
    });
});

document.querySelector('.add-task-btn').addEventListener('mouseover', function() {
    gsap.to(this, {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
    });
});

document.querySelector('.add-task-btn').addEventListener('mouseout', function() {
    gsap.to(this, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
    });
});

document.addEventListener('mousemove', function(e) {
    const appContainer = document.querySelector('.app-container');
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    
    gsap.to(appContainer, {
        rotationY: mouseX * 10,
        rotationX: -mouseY * 10,
        duration: 0.5,
        ease: "power2.out"
    });
});

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

setInterval(updateDateTime, 1000);
updateDateTime();
renderTasks();
updateStats();
animateStats();
animateTaskList();