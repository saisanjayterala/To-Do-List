function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    if (taskInput.value.trim() !== '') {
        const li = document.createElement('li');
        const taskText = document.createTextNode(taskInput.value);
        li.appendChild(taskText);

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            taskList.removeChild(li);
        };

        li.appendChild(deleteBtn);
        li.onclick = function() {
            this.classList.toggle('completed');
        };

        taskList.appendChild(li);
        taskInput.value = '';
    }
}

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});