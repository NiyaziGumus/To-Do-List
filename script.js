document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addTodoButton');
    const inputField = document.getElementById('todoInput');
    const todoList = document.getElementById('todoList');

    addButton.addEventListener('click', function() {
        const todoText = inputField.value.trim();

        if (todoText !== '') {
            const li = document.createElement('li');

            // Checkmark-Box und Checkmark-Symbol
            const checkmarkBox = document.createElement('div');
            checkmarkBox.classList.add('checkmark-box');
            const checkmark = document.createElement('span');
            checkmark.innerHTML = '&#10003;'; // Unicode für das Häkchen
            checkmark.classList.add('checkmark');
            checkmarkBox.appendChild(checkmark);

            const textSpan = document.createElement('span');
            textSpan.classList.add('text');
            textSpan.textContent = todoText;

            // Event Listener für das Markieren als erledigt über Text oder Checkmark-Box
            function toggleCompleted() {
                li.classList.toggle('completed');
                textSpan.classList.toggle('completed');
            }

            checkmarkBox.addEventListener('click', toggleCompleted);
            textSpan.addEventListener('click', toggleCompleted);

            const deleteButton = document.createElement('span');
            deleteButton.textContent = 'X';
            deleteButton.classList.add('deleteButton');

            deleteButton.addEventListener('click', function(event) {
                todoList.removeChild(li);
                event.stopPropagation();
            });

            li.appendChild(checkmarkBox);
            li.appendChild(textSpan);
            li.appendChild(deleteButton);
            todoList.appendChild(li);

            inputField.value = '';
        } else {
            alert('Bitte geben Sie einen Todo-Text ein.');
        }
    });
});
