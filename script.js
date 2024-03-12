document.addEventListener('DOMContentLoaded', function () {
    const addButton = document.getElementById('addTodoButton');
    const inputField = document.getElementById('todoInput');
    const clearAllButton = document.getElementById('clearAllTodosButton');
    const addGroupButton = document.getElementById('addGroupButton');
    const groupContainer = document.getElementById('groupContainer');
    let activeGroup = 'defaultGroup';

    // Varsayılan grup için bir gösterge olup olmadığını kontrol et ve yoksa oluştur
    if (!localStorage.getItem('groups')) {
        saveGroups(['defaultGroup']); // Varsayılan grubu kaydet
    }
    loadGroups();

    setActiveGroup('defaultGroup'); // Varsayılan grubu aktif olarak ayarla

    addGroupButton.addEventListener('click', function () {
        const groupName = prompt("Gruppenname eingeben:", "Neue Gruppe");
        if (groupName && !document.querySelector(`[data-group-name="${groupName}"]`)) {
            addGroup(groupName);
            saveGroups();
        }
    });

    

    function setActiveGroupListeners() {
        document.querySelectorAll('.group').forEach(group => {
            group.removeEventListener('click', groupClickHandler); // Önce var olan listener'ı kaldır
            group.addEventListener('click', groupClickHandler); // Yeniden ekleme
        });
    }

    function groupClickHandler() {
        setActiveGroup(this.getAttribute('data-group-name'));
    }

    addButton.addEventListener('click', function () {
        const todoText = inputField.value.trim();
        if (todoText !== '') {
            todoAdd(todoText, false);
            inputField.value = '';
            saveTodos();
        } else {
            alert('Bitte geben Sie einen Todo-Text ein.');
        }
    });

    inputField.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addButton.click();
        }
    });

    clearAllButton.addEventListener('click', function () {
        if (confirm('Möchten Sie wirklich alle Todos löschen?')) {
            document.getElementById('todoList').innerHTML = '';
            saveTodos();
        }
    });

    function addGroup(groupName, isDefault = false) {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.textContent = groupName;
        groupDiv.setAttribute('data-group-name', groupName);

        const deleteGroupButton = document.createElement('button');
        deleteGroupButton.textContent = 'X';
        deleteGroupButton.classList.add('deleteGroup');
        deleteGroupButton.addEventListener('click', function (event) {
            event.stopPropagation();
            deleteGroup(groupName);
        });

        groupDiv.appendChild(deleteGroupButton);
        groupDiv.addEventListener('click', function () {
            setActiveGroup(groupName);
        });

        groupContainer.insertBefore(groupDiv, addGroupButton);

        // Eğer bu varsayılan grup ise, doğrudan aktif olarak işaretle
        if (isDefault) {
            groupDiv.classList.add('active');
        }

        setActiveGroupListeners();

        groupContainer.insertBefore(groupDiv, addGroupButton);
        groupContainer.appendChild(addGroupButton); // "+" işaretini sona taşı
    }

    setActiveGroup('defaultGroup');

    function setActiveGroup(groupName) {
        activeGroup = groupName;
        const allGroups = document.querySelectorAll('.group');
        allGroups.forEach(group => {
            group.classList.remove('active'); // Tüm gruplardan 'active' sınıfını kaldır
            if (group.getAttribute('data-group-name') === groupName) {
                group.classList.add('active'); // Aktif grup için 'active' sınıfı ekle
            }
        });
        
        if(groupName === 'defaultGroup') {
            // Varsayılan grubu direkt olarak seçili göster
            document.getElementById('defaultGroup').classList.add('active');
        }
        loadTodos();
    }

    setActiveGroup('defaultGroup');

    function deleteGroup(groupName) {
        document.querySelector(`[data-group-name="${groupName}"]`).remove();
        localStorage.removeItem('todos-' + groupName);
        saveGroups();
        if (activeGroup === groupName) {
            setActiveGroup('defaultGroup');
        }
    }

    function loadGroups() {
        const savedGroups = JSON.parse(localStorage.getItem('groups'));
        savedGroups.forEach(groupName => {
            if (groupName === 'defaultGroup') {
                addGroup(groupName, true);
            } else {
                addGroup(groupName);
            }
        });
        setActiveGroupListeners();
        setActiveGroup('defaultGroup');
    }

    function saveGroups() {
        const groups = Array.from(document.querySelectorAll('.group[data-group-name]')).map(group => group.getAttribute('data-group-name'));
        localStorage.setItem('groups', JSON.stringify(groups));
    }

    function todoAdd(text, completed) {
        const todoList = document.getElementById('todoList');
        const li = document.createElement('li');
        li.className = completed ? 'completed' : '';
        li.innerHTML = `<div class="checkmark-box">${completed ? '&#10003;' : ''}</div><span class="text">${text}</span><span class="deleteButton">X</span>`;

        li.querySelector('.checkmark-box').addEventListener('click', function () {
            li.classList.toggle('completed');
            saveTodos();
        });

        li.querySelector('.deleteButton').addEventListener('click', function () {
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
    // setActiveGroup('defaultGroup');
});
