document.addEventListener('DOMContentLoaded', function () {
    let activeGroup = localStorage.getItem('activeGroup') || 'defaultGroup';const addButton = document.getElementById('addTodoButton');
    const inputField = document.getElementById('todoInput');
    const clearAllButton = document.getElementById('clearAllTodosButton');
    const addGroupButton = document.getElementById('addGroupButton');
    const groupContainer = document.getElementById('groupContainer');
    const defaultGroupElement = document.getElementById('defaultGroup');
    const addGroupModal = document.getElementById('addGroupModal');
    const closeSpan = document.getElementsByClassName('close')[0];
    const saveGroupButton = document.getElementById('saveGroup'); 

    addGroupButton.onclick = function () {
        addGroupModal.style.display = 'block';
    };

  
    closeSpan.onclick = function () {
        addGroupModal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target == addGroupModal) {
            addGroupModal.style.display = 'none';
        }
    };

    
    saveGroupButton.onclick = function () {
        const groupName = document.getElementById('newGroupName').value;
        if (groupName && !document.querySelector(`[data-group-name="${groupName}"]`)) {
            addGroup(groupName);
            saveGroups();
            updateAddGroupButtonVisibility();
        }
        addGroupModal.style.display = 'none';
    };

    // Todo Einfügen
    addButton.addEventListener('click', function () {
        const todoText = inputField.value.trim();
        if (todoText !== '') {
            todoAdd(todoText, false);
            inputField.value = '';
            saveTodos();
        } else {
            window.electronAPI.showDialog({
                type: 'warning',
                message: 'Bitte geben Sie einen Todo-Text ein.'
            });
        }
    });

    inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addButton.click();
        }
    });

    // Alle Todos Löschen
    clearAllButton.addEventListener('click', async function () {
        const { response } = await window.electronAPI.showDialog({
            type: 'question',
            buttons: ['Abbrechen', 'Ja'],
            defaultId: 1,
            title: 'Bestätigung',
            message: 'Möchten Sie wirklich alle Todos löschen?'
        });
        if (response === 1) {
            document.getElementById('todoList').innerHTML = '';
            saveTodos();
        }
    });

    
    loadGroups();
    setActiveGroup(activeGroup);
});


function updateAddGroupButtonVisibility() {
    const groupCount = document.querySelectorAll('.group[data-group-name]').length;
    const maxGroupCount = parseInt(localStorage.getItem('maxGroupCount')) || 5;
    addGroupButton.style.display = groupCount >= maxGroupCount ? 'none' : 'inline-block';
}

function todoAdd(text, completed) {
    const todoList = document.getElementById('todoList');
    const li = document.createElement('li');
    li.className = completed ? 'completed' : '';
    li.innerHTML = `
            <div class="checkmark-box">${completed ? '&#10003;' : ''}</div>
            <span class="text">${text}</span>
            <span class="deleteButton">X</span>`;

    const checkmarkBox = li.querySelector('.checkmark-box');
    const textSpan = li.querySelector('.text');

    const toggleCompleted = () => {
        const isCompleted = li.classList.contains('completed');
        li.classList.toggle('completed', !isCompleted);
        checkmarkBox.innerHTML = isCompleted ? '' : '&#10003;';
        saveTodos();
    };

    checkmarkBox.addEventListener('click', toggleCompleted);
    textSpan.addEventListener('click', toggleCompleted);

    li.querySelector('.deleteButton').addEventListener('click', function () {
        todoList.removeChild(li);
        saveTodos();
    });

    todoList.appendChild(li);
}

function saveTodos() {
    if (activeGroup) {
        const todos = Array.from(document.querySelectorAll('#todoList li')).map(li => ({
            text: li.querySelector('.text').textContent,
            completed: li.classList.contains('completed'),
        }));
        localStorage.setItem('todos-' + activeGroup, JSON.stringify(todos));
    }
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos-' + activeGroup)) || [];
    document.getElementById('todoList').innerHTML = '';
    todos.forEach(todo => todoAdd(todo.text, todo.completed));
}

function saveGroups() {
    const groups = Array.from(document.querySelectorAll('.group[data-group-name]')).map(group => group.getAttribute('data-group-name'));
    localStorage.setItem('groups', JSON.stringify(groups));
    localStorage.setItem('groupCount', groups.length.toString());
    localStorage.setItem('maxGroupCount', '5'); 
    updateAddGroupButtonVisibility();
}

function addGroupToDOM(groupName, isDefaultGroup = false) {
    const groupDiv = document.createElement('div');
    groupDiv.classList.add('group');
    groupDiv.textContent = groupName;
    groupDiv.setAttribute('data-group-name', groupName);

    if (!isDefaultGroup) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('delete-group-button');

        deleteButton.addEventListener('click', function (event) {
            event.stopPropagation();
            confirmDeleteGroup(groupName);
        });

        groupDiv.appendChild(deleteButton);
    }

    const groupContainer = document.getElementById('groupContainer');
    groupContainer.insertBefore(groupDiv, groupContainer.lastElementChild); 

    loadGroups();
    updateAddGroupButtonVisibility();
    setActiveGroupListeners();
}

function confirmDeleteGroup(groupName) {
    window.electronAPI.showDialog({
        type: 'question',
        buttons: ['Abbrechen', 'Löschen'],
        title: 'Gruppe löschen',
        message: `Sind Sie sicher, dass Sie die Gruppe "${groupName}" löschen möchten? Dieser Vorgang kann nicht rückgängig gemacht werden.`
    }).then(result => {
        if (result.response === 1) {
            deleteGroup(groupName);
            updateAddGroupButtonVisibility(); 
        }
    });
}

function deleteGroup(groupName) {
    const groupElement = document.querySelector(`[data-group-name="${groupName}"]`);
    if (groupElement) {
        groupElement.remove();
        localStorage.removeItem('todos-' + groupName); 
        saveGroups();
        updateAddGroupButtonVisibility();

        
        if (activeGroup === groupName) {
            activeGroup = 'defaultGroup';
            setActiveGroup('defaultGroup');
        }
    }
}

function addGroup(groupName, isDefaultGroup = false) {
    window.electronAPI.addGroup(groupName)
        .then(() => {
            addGroupToDOM(groupName, isDefaultGroup); 
            saveGroups();
            updateAddGroupButtonVisibility();
        })
        .catch((err) => {
            console.error('Fehler beim Hinzufügen der Gruppe:', err);
        });
} 

function removeGroup(groupName) {
    window.electronAPI.removeGroup(groupName)
        .then(() => {
            const groupElement = document.querySelector(`[data-group-name="${groupName}"]`);
            if (groupElement) {
                groupElement.remove();
                localStorage.removeItem('todos-' + groupName);
                updateAddGroupButtonVisibility();
                const defaultGroupElement = document.getElementById('defaultGroup');
                if (defaultGroupElement) {
                    defaultGroupElement.click();
                }
            }
        })
        .catch((err) => {
            console.error('Fehler beim Löschen der Gruppe:', err);
        });
}

function loadGroups() {
    const savedGroups = JSON.parse(localStorage.getItem('groups')) || [];
    if (!document.querySelector(`[data-group-name="defaultGroup"]`)) {
        savedGroups.unshift('defaultGroup'); 
    }
    savedGroups.forEach(groupName => {
        if (!document.querySelector(`[data-group-name="${groupName}"]`)) {
            addGroupToDOM(groupName, groupName === 'defaultGroup');
        }
    });
}

function setActiveGroup(groupName) {
    const groupElements = document.querySelectorAll('.group');
    groupElements.forEach(groupElement => {
        groupElement.classList.remove('active');
    });

    const selectedGroup = document.querySelector(`[data-group-name="${groupName}"]`);
    if (selectedGroup) {
        selectedGroup.classList.add('active');
        activeGroup = groupName;
        localStorage.setItem('activeGroup', groupName);
        loadTodos();
    }
}

function groupClickHandler(event) {
    const groupName = event.currentTarget.getAttribute('data-group-name');
    setActiveGroup(groupName);
}

function setActiveGroupListeners() {
    const groupElements = document.querySelectorAll('.group');
    groupElements.forEach(group => {
        group.removeEventListener('click', groupClickHandler); 
        group.addEventListener('click', groupClickHandler); 
    });
}