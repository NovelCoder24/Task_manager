
let tasks = []; 
let taskIdCounter = 1; 

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
    setGetLocally('set')
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

function setGetLocally(str){
    if(str === "set"){
        
        tasks.forEach(task=>{
            localStorage.setItem(task.id , JSON.stringify(task))
            const test = JSON.parse(localStorage.getItem(task.id))
            console.log(test.title)
            
        })
    }
    else if(str==="get"){
        tasks.forEach(task=>{
            localStorage.getItem(task.id) 
        })
    }else{
        console.log("empty storage!")
    }
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
    // // Add drag event listeners
    // taskElement.addEventListener('dragstart', handleDragStart);

}
function moveTask(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
        task.status = newStatus
        reRenderAllTasks(); 
        updateCounts();
    }
}
function deleteTask(taskId) {
    if (confirm('are you sure to delete this task?')) {
        const task = tasks.find(t => t.id === taskId)  
        console.log(`${tasks.pop(task)}\ndeleted succuessfully`)
        reRenderAllTasks(); 
        updateCounts();
    }
}
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
        const newTitle = prompt("Edit task Title:", task.title)
        const newDes = prompt("Edit task description:", task.description)
        if (newTitle === '' || newDes === '') {
            alert('invalid title name try again')
            return
        } else {
            task.title = newTitle.trim()
            task.description = newDes.trim()
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
        let containerId ;
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
            emptyState.classList.add('empty-state', 'text-gray-500', 'italic','m-4')
            emptyState.textContent = status === 'todo' ? "No tasks yet. Add one above! 👆" :
                status === 'progress' ? "Drag tasks here when you start working!🎯" : "Completed tasks will appear here! 🎉"
            list.appendChild(emptyState)
        }
    })

} 

function updateCounts(){
    // update board counts
    document.getElementById('todo-count').textContent = tasks.filter(task=>task.status === 'todo').length
    document.getElementById('progress-count').textContent = tasks.filter(task=>task.status === 'progress').length
    document.getElementById('done-count').textContent = tasks.filter(task=>task.status === 'done').length
}


// // Drag and drop functionality
// let draggedTaskId = null;

// function handleDragStart(e) {
//     draggedTaskId = parseInt(e.target.dataset.taskId);
//     e.target.style.opacity = '0.5';
// }

// // Add drag over and drop handlers to boards
// document.querySelectorAll('.board').forEach(board => {
//     board.addEventListener('dragover', function (e) {
//         e.preventDefault();
//         this.classList.add('drag-over');
//     });

//     board.addEventListener('dragleave', function (e) {
//         this.classList.remove('drag-over');
//     });

//     board.addEventListener('drop', function (e) {
//         e.preventDefault();
//         this.classList.remove('drag-over');

//         const newStatus = this.dataset.status;
//         if (draggedTaskId && newStatus) {
//             moveTask(draggedTaskId, newStatus);
//         }

//         // Reset dragged task opacity
//         const draggedElement = document.querySelector(`[data-task-id="${draggedTaskId}"]`);
//         if (draggedElement) {
//             draggedElement.style.opacity = '1';
//         }
//         draggedTaskId = null;
//     });
// });

// // Add task on Enter key
// document.getElementById('task-title').addEventListener('keypress', function (e) {
//     if (e.key === 'Enter') {
//         addTask();
//     }
// });

// Initialize
// renderAllTasks(); 