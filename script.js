document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addTodoButton');
    const inputField = document.getElementById('todoInput');
    const clearAllButton = document.getElementById('clearAllTodosButton');
    const addGroupButton = document.getElementById('addGroupButton');
    const groupContainer = document.getElementById('groupContainer');
    const defaultGroupElement = document.getElementById('defaultGroup');
    let activeGroup = localStorage.getItem('activeGroup') || 'defaultGroup';

    if(defaultGroupElement) {
        defaultGroupElement.click();
    }
    loadGroups();

    updateAddGroupButtonVisibility();

    addGroupButton.addEventListener('click', function() {
        const groupName = prompt("Gruppenname eingeben:", "Neue Gruppe");
        if (groupName && !document.querySelector(`[data-group-name="${groupName}"]`)) {
            addGroup(groupName);
            saveGroups();
            updateAddGroupButtonVisibility();
        }
    });

    
    function setActiveGroupListeners() {
        const groupElements = document.querySelectorAll('.group');
        groupElements.forEach(group => {
            group.addEventListener('click', groupClickHandler);
        });
    }

    function groupClickHandler(event) {
        const groupName = event.currentTarget.getAttribute('data-group-name');
        setActiveGroup(groupName);
    }

    addButton.addEventListener('click', function() {
        const todoText = inputField.value.trim();
        if (todoText !== '') {
            todoAdd(todoText, false);
            inputField.value = '';
            saveTodos();
        } else {
            alert('Bitte geben Sie einen Todo-Text ein.');
        }
    });

    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addButton.click();
        }
    });

    clearAllButton.addEventListener('click', function() {
        if (confirm('Möchten Sie wirklich alle Todos löschen?')) {
            document.getElementById('todoList').innerHTML = '';
            saveTodos();
        }
    });

    function updateAddGroupButtonVisibility() {
        const groupCount = document.querySelectorAll('.group[data-group-name]').length;
        addGroupButton.style.display = groupCount >= 4 ? 'none' : 'inline-block';
    }

    function addGroup(groupName, isDefault = false) {
        const trimmedGroupName = groupName.substring(0, 25);
    
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.setAttribute('data-group-name', trimmedGroupName);
    
        const groupNameSpan = document.createElement('span');
        groupNameSpan.textContent = trimmedGroupName;
        groupDiv.appendChild(groupNameSpan);
    
        if (!isDefault) {
            const deleteGroupButton = document.createElement('button');
            deleteGroupButton.textContent = 'X';
            deleteGroupButton.classList.add('deleteGroup');
            deleteGroupButton.addEventListener('click', function(event) {
                event.stopPropagation();
                deleteGroup(trimmedGroupName);
            });
            groupDiv.appendChild(deleteGroupButton);
        }
    
        groupContainer.insertBefore(groupDiv, addGroupButton);
    
        if (trimmedGroupName === activeGroup) {
            groupDiv.classList.add('active');
        }
    
        
        saveGroups();
        setActiveGroupListeners();
    }
    
    
    

    setActiveGroup(activeGroup);

    function setActiveGroup(groupName) {
        const groupElements = Array.from(document.querySelectorAll('.group'));
    
        groupElements.forEach(group => {
            group.classList.remove('active');
        });
    
        const selectedGroup = document.querySelector(`[data-group-name="${groupName}"]`);
        if (selectedGroup) {
            selectedGroup.classList.add('active');
        } else {
            defaultGroupElement.classList.add('active');
        }
    
        activeGroup = groupName;
        localStorage.setItem('activeGroup', groupName);
        loadTodos();
    }
    

    function deleteGroup(groupName) {
        if (confirm(`Möchten Sie wirklich die Gruppe "${groupName}" löschen?`)) {
            const groupElement = document.querySelector(`[data-group-name="${groupName}"]`);
            if (groupElement) {
                groupElement.remove();
                localStorage.removeItem('todos-' + groupName);
                saveGroups();
                updateAddGroupButtonVisibility();
    
                const defaultGroupElement = document.getElementById('defaultGroup');
                if (defaultGroupElement) {
                    defaultGroupElement.click(); 
                }
            }
        }
    }
    

    function loadGroups() {
        const savedGroups = JSON.parse(localStorage.getItem('groups')) || [];
        savedGroups.forEach(groupName => {
            if (groupName === 'defaultGroup') {
                addGroup(groupName, true);
            } else {
                addGroup(groupName);
            }
        });
    }

    function saveGroups() {
        const groups = Array.from(document.querySelectorAll('.group[data-group-name]')).map(group => group.getAttribute('data-group-name'));
        localStorage.setItem('groups', JSON.stringify(groups));
        localStorage.setItem('groupCount', groups.length.toString());
        updateAddGroupButtonVisibility();
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

        li.querySelector('.deleteButton').addEventListener('click', function() {
            todoList.removeChild(li);
            saveTodos();
        });

        todoList.appendChild(li);
    }

    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos-' + activeGroup)) || [];
        document.getElementById('todoList').innerHTML = '';
        todos.forEach(todo => todoAdd(todo.text, todo.completed));
    }

    function saveTodos() {
        const todos = Array.from(document.querySelectorAll('#todoList li')).map(li => ({
            text: li.querySelector('.text').textContent,
            completed: li.classList.contains('completed'),
        }));
        localStorage.setItem('todos-' + activeGroup, JSON.stringify(todos));
    }

    setActiveGroupListeners();
});