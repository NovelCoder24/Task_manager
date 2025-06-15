let tasks = [];
let taskIdCounter = 1;
 
function getTasksFromStorage() {
    try { 
        const storedTasks = localStorage.getItem('Tasks');
        if (storedTasks) { 
            const parsedTasks = JSON.parse(storedTasks); 
            if (Array.isArray(parsedTasks)) {
                return parsedTasks.filter(task => 
                    task && 
                    typeof task.id === 'number' && 
                    typeof task.title === 'string' &&
                    typeof task.status === 'string'
                );
            }
        }
    } catch (error) { 
        console.error('Error loading tasks from localStorage:', error);
    }
    return [];
}
 
function initializeApp() {
    tasks = getTasksFromStorage(); 
    if (tasks.length > 0) {
        taskIdCounter = Math.max(...tasks.map(task => task.id)) + 1;
    }
}
 
function saveTasksToStorage() {
    try {
        localStorage.setItem('Tasks', JSON.stringify(tasks));
    } catch (error) { 
        console.error('Error saving tasks to localStorage:', error);
        alert('Failed to save tasks. Storage might be full.');
    }
}


// Add task functionality
function addTask() {
    const titleInput = document.getElementById('task-title');
    const descriptionInput = document.getElementById('task-description');


    if (!titleInput.value.trim()) {
        titleInput.focus()
        return
    }

    const task = {
        id: taskIdCounter++,
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        status: 'todo',
        createAt: new Date()
    }
    tasks.push(task) 
    saveTasksToStorage()
    renderTask(task, 'todo-list')

    titleInput.value = ''
    descriptionInput.value = ''

    showSuccessMessage()
    updateCounts()

}

function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.classList.remove('hidden')
    setTimeout(() => {
        message.classList.add("hidden")
    }, 3000);
}

function renderTask(task, containerId) {
    const container = document.getElementById(containerId)
    // remove empty state if exist 
    const emptyState = document.querySelector(".empty-state")
    if (emptyState) {
        emptyState.remove()
    }

    const taskElement = document.createElement("div")
    taskElement.classList.add("task-item")
    taskElement.classList.add("w-full")
    taskElement.draggable = true

    taskElement.dataset.taskId = task.id

    taskElement.innerHTML = `
        <div class="my-1 outline-1 outline-gray-400 bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-4 flex justify-between items-center">
            <div class="flex flex-col space-y-4">
                <div class="space-y-2">
                    <div class="text-gray-600 font-semibold text-base">${task.title}</div>
                    <div class="text-gray-600 font-normal text-base">${task.description}</div>
                </div> 
            </div>
            <div class="flex space-x-2">
                <button class="w-8 h-8 cursor-pointer bg-green-100 border border-green-500 rounded-full flex items-center justify-center" title="Mark as complete" onclick="moveTask(${task.id}, 'done')">
                    <span class="text-green-500 text-sm">✓</span>
                </button>
                <button class="w-8 h-8 cursor-pointer bg-blue-100 border border-blue-500 rounded-full flex items-center justify-center" title="Edit task" onclick="editTask(${task.id})">
                    <span class="text-blue-500 text-sm">✏️</span>
                </button>
                <button class="w-8 h-8 cursor-pointer bg-red-100 border border-red-500 rounded-full flex items-center justify-center" title="Delete task" onclick="deleteTask(${task.id})">
                    <span class="text-red-500 text-sm">🗑️</span>
                </button> 
            </div>
        </div>
    `

    container.appendChild(taskElement) 
    // Drag and drop functionality
    let draggedTaskId = null;
    taskElement.addEventListener('dragstart', (e) => {
        draggedTaskId = parseInt(e.target.dataset.taskId);
        e.target.style.opacity = 0.5;

        document.querySelectorAll('.board').forEach((board) => {
            board.addEventListener('dragover', (e) => {
                e.preventDefault()
                this.classList.add('bg-[#e0e7ff]', 'border-indigo-500')
            })
            board.addEventListener('dragleave', (e) => {
                this.classList.remove('bg-[#e0e7ff]', 'border-indigo-500')
            })
            board.addEventListener('drop', function (e) {
                e.preventDefault()
                this.classList.remove('bg-[#e0e7ff]', 'border-indigo-500')
                const newStatus = this.getAttribute('data-status');
                if (draggedTaskId && newStatus) {
                    moveTask(draggedTaskId, newStatus);
                }
                // reset dragged opacity
                const draggedElement = document.querySelector(`[data-task-id="${draggedTaskId}"]`)
                if (draggedElement) {
                    draggedElement.style.opacity = 1;
                }
                draggedTaskId = null
            });
        });
    });

}
function moveTask(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
        task.status = newStatus;
        saveTasksToStorage();
        reRenderAllTasks();
        updateCounts();
    }
}
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks.findIndex(t => t.id === taskId) 
        if(taskIndex !== -1){
            const deletedTask = tasks.splice(taskIndex,1)[0]
            console.log(`Deleted task : ${deleteTask}`)
            saveTasksToStorage();
            reRenderAllTasks();
            updateCounts();
        }
    }
}
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
        const newTitle = prompt("Edit task Title:", task.title)
        const newDes = prompt("Edit task description:", task.description)
        if (newTitle === '') {
            alert('invalid title name try again')
            return
        } else {
            task.title = newTitle.trim()
            task.description = newDes.trim()
            saveTasksToStorage();
            reRenderAllTasks();

        }
    }

}
function reRenderAllTasks() {
    // clear all list to re-render it again
    ['todo-list', 'progress-list', 'done-list'].forEach(listId => {
        const list = document.getElementById(listId)
        if (list) list.innerHTML = '';
    })
    // re-render tasks
    tasks.forEach(task => {
        let containerId;
        if (task.status === 'todo') {
            containerId = 'todo-list';
        } else if (task.status === 'progress') {
            containerId = 'progress-list';
        } else if (task.status === 'done') {
            containerId = 'done-list';
        } else {
            containerId = 'todo-list';
        }
        renderTask(task, containerId);

    });
    // add empty state wher needed
    ['todo', 'progress', 'done'].forEach(status => {
        const statusId = status + '-list'
        const list = document.getElementById(statusId)
        const statusTasks = tasks.filter(task => task.status === status)
        if (statusTasks.length === 0) {
            const emptyState = document.createElement('div')
            emptyState.classList.add('empty-state', 'text-gray-500', 'italic', 'm-4')
            emptyState.textContent = status === 'todo' ? "No tasks yet. Add one above! 👆" :
                status === 'progress' ? "Drag tasks here when you start working!🎯" : "Completed tasks will appear here! 🎉"
            try {
                list.appendChild(emptyState)
            } catch (error) {
                console.log(`ERROR : ${error}`)
            }
        }
    })

}

function updateCounts() {
    // update board counts
    document.getElementById('todo-count').textContent = tasks.filter(task => task.status === 'todo').length
    document.getElementById('progress-count').textContent = tasks.filter(task => task.status === 'progress').length
    document.getElementById('done-count').textContent = tasks.filter(task => task.status === 'done').length
}

// Initialize
document.addEventListener('DOMContentLoaded', () => { 
    initializeApp();
    updateCounts();
    reRenderAllTasks();
    document.getElementById('task-title').addEventListener("keypress", (e) => {
        if (e.key == 'Enter') {
            addTask()
        }
    })
})

