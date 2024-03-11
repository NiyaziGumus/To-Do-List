document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addTodoButton');
    const inputField = document.getElementById('todoInput');
    const todoList = document.getElementById('todoList');
    const clearAllButton = document.getElementById('clearAllTodosButton');

    // LocalStorage'dan todo'ları yükle
    todosLaden();

    addButton.addEventListener('click', function() {
        const todoText = inputField.value.trim();
        if (todoText !== '') {
            todoAdd(todoText, false); // Completed durumu varsayılan olarak false
            inputField.value = '';
            todosSpeichern();
        } else {
            alert('Bitte geben Sie einen Todo-Text ein.');
        }
    });

    // Enter tuşuyla todo ekleme işlevselliği
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const todoText = inputField.value.trim();
            if (todoText !== '') {
                todoAdd(todoText, false); // Completed durumu varsayılan olarak false
                inputField.value = '';
                todosSpeichern();
            } else {
                alert('Bitte geben Sie einen Todo-Text ein.');
            }
        }
    });

    clearAllButton.addEventListener('click', function() {
        if (confirm('Möchten Sie wirklich alle Todos löschen?')) {
            while (todoList.firstChild) {
                todoList.removeChild(todoList.firstChild);
            }
            todosSpeichern();
        }
    });
});

function todoAdd(text, completed) {
    const todoList = document.getElementById('todoList');
    const li = document.createElement('li');
    if (completed) {
        li.classList.add('completed');
    }
    const checkmarkBox = document.createElement('div');
    checkmarkBox.classList.add('checkmark-box');
    const checkmark = document.createElement('span');
    checkmark.innerHTML = '&#10003;'; // Unicode für das Häkchen
    checkmark.classList.add('checkmark');
    const textSpan = document.createElement('span');
    textSpan.classList.add('text');
    textSpan.textContent = text;
    const deleteButton = document.createElement('span');
    deleteButton.textContent = 'X';
    deleteButton.classList.add('deleteButton');

    checkmarkBox.appendChild(checkmark);
    li.appendChild(checkmarkBox);
    li.appendChild(textSpan);
    li.appendChild(deleteButton);
    todoList.appendChild(li);

    checkmarkBox.addEventListener('click', function() {
        li.classList.toggle('completed');
        todosSpeichern();
    });

    textSpan.addEventListener('click', function() {
        li.classList.toggle('completed');
        todosSpeichern();
    });

    deleteButton.addEventListener('click', function(event) {
        todoList.removeChild(li);
        event.stopPropagation();
        todosSpeichern();
    });
}

function todosLaden() {
    const gespeicherteTodos = JSON.parse(localStorage.getItem('todos')) || [];
    gespeicherteTodos.forEach(function(todo) {
        todoAdd(todo.text, todo.completed);
    });
}

function todosSpeichern() {
    const todos = Array.from(document.querySelectorAll('#todoList li')).map(li => {
        return {
            text: li.querySelector('.text').textContent,
            completed: li.classList.contains('completed')
        };
    });
    localStorage.setItem('todos', JSON.stringify(todos));
}
