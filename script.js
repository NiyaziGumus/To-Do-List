document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.getElementById('addTodoButton'); // Finde den Hinzufügen-Button
    const inputField = document.getElementById('todoInput'); // Finde das Eingabefeld
    const todoList = document.getElementById('todoList'); // Finde die Todo-Liste

    addButton.addEventListener('click', function() {
        const todoText = inputField.value.trim(); // Hole den Text aus dem Eingabefeld und entferne Leerzeichen

        // Überprüfe, ob das Eingabefeld nicht leer ist
        if (todoText !== '') {
            const li = document.createElement('li'); // Erstelle ein neues li-Element
            li.textContent = todoText; // Setze den Text des li-Elements auf den Eingabetext
            li.addEventListener('click', function() {
                // Füge einen Event Listener hinzu, um das Todo-Element zu entfernen, wenn darauf geklickt wird
                todoList.removeChild(li);
                alert('Todo wurde erfolgreich entfernt.'); // Benutzerfeedback
            });

            todoList.appendChild(li); // Füge das neue Todo-Element zur Liste hinzu

            inputField.value = ''; // Leere das Eingabefeld nach dem Hinzufügen
            alert('Todo wurde erfolgreich hinzugefügt.'); // Benutzerfeedback
        } else {
            alert('Bitte geben Sie einen Todo-Text ein.'); // Warnung, wenn das Eingabefeld leer ist
        }
    });
});
