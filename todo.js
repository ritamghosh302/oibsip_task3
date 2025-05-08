let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let sortByDueDate = false;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isOverdue(task) {
    return task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
}

function toggleSort() {
    sortByDueDate = !sortByDueDate;
    document.getElementById('sortLabel').textContent = sortByDueDate ? 'Due Date' : 'Newest First';
    renderTasks();
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
        tasks = [];
        localStorage.removeItem('tasks');
        renderTasks();
    }
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const dueDateTime = document.getElementById('dueDateTime');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date(),
        completedAt: null,
        dueDate: dueDateTime.value ? new Date(dueDateTime.value) : null
    };

    tasks.push(task);
    saveTasks();
    taskInput.value = '';
    dueDateTime.value = '';
    renderTasks();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date() : null;
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(task => task.id === id);
    const newText = prompt('Edit task:', task.text);
    const newDueDate = prompt('Edit due date (YYYY-MM-DD HH:MM)', task.dueDate ? formatDateTime(task.dueDate).replace(',', '') : '');
    if (newText && newText.trim()) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                task.text = newText.trim();
                task.dueDate = newDueDate ? new Date(newDueDate) : task.dueDate;
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
}

function sortTasks(taskList) {
    if (sortByDueDate) {
        return taskList.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt; // Both null, sort by creation
            if (!a.dueDate) return 1; // a has no due date, push to end
            if (!b.dueDate) return -1; // b has no due date, push to end
            return new Date(a.dueDate) - new Date(b.dueDate); // Sort by due date
        });
    } else {
        return taskList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation, newest first
    }
}

function renderTasks() {
    const pendingTasks = document.getElementById('pendingTasks');
    const completedTasks = document.getElementById('completedTasks');
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    const pending = tasks.filter(task => !task.completed);
    const completed = tasks.filter(task => task.completed);

    sortTasks(pending).forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const taskInfo = document.createElement('div');
        const dueDateText = task.dueDate ? `Due: ${formatDateTime(task.dueDate)}` : 'No due date';
        const overdueText = isOverdue(task) ? '<br>This is overdue' : '';
        taskInfo.innerHTML = `
            <div>${task.text}</div>
            <div class="task-meta ${isOverdue(task) ? 'overdue' : ''}">
                Added: ${formatDateTime(task.createdAt)}
                <br>${dueDateText}${overdueText}
                ${task.completed ? `<br>Completed: ${formatDateTime(task.completedAt)}` : ''}
            </div>
        `;

        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.innerHTML = `
            <button onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
            <button onclick="editTask(${task.id})">Edit</button>
            <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
        `;

        li.appendChild(taskInfo);
        li.appendChild(actions);
        pendingTasks.appendChild(li);
    });

    sortTasks(completed).forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const taskInfo = document.createElement('div');
        const dueDateText = task.dueDate ? `Due: ${formatDateTime(task.dueDate)}` : 'No due date';
        const overdueText = isOverdue(task) ? '<br>This is overdue' : '';
        taskInfo.innerHTML = `
            <div>${task.text}</div>
            <div class="task-meta ${isOverdue(task) ? 'overdue' : ''}">
                Added: ${formatDateTime(task.createdAt)}
                <br>${dueDateText}${overdueText}
                ${task.completed ? `<br>Completed: ${formatDateTime(task.completedAt)}` : ''}
            </div>
        `;

        const actions = document.createElement('div');
        actions.className = 'task-actions';
        actions.innerHTML = `
            <button onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
            <button onclick="editTask(${task.id})">Edit</button>
            <button class="delete" onclick="deleteTask(${task.id})">Delete</button>
        `;

        li.appendChild(taskInfo);
        li.appendChild(actions);
        completedTasks.appendChild(li);
    });
}

// Initial render
renderTasks();