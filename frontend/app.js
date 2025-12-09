const API_URL = '';

const noteInput = document.getElementById('noteInput');
const addBtn = document.getElementById('addBtn');
const notesList = document.getElementById('notesList');

// Load notes on page load
loadNotes();

// Add note on button click
addBtn.addEventListener('click', addNote);

// Add note on Enter key
noteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNote();
});

async function loadNotes() {
    try {
        const response = await fetch(`${API_URL}/notes`);
        const notes = await response.json();
        
        displayNotes(notes);
    } catch (error) {
        console.error('Error loading notes:', error);
        notesList.innerHTML = '<div class="empty-state">Failed to load notes 😢</div>';
    }
}

async function addNote() {
    const content = noteInput.value.trim();
    
    if (!content) return;
    
    try {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: content })
        });
        
        if (response.ok) {
            noteInput.value = '';
            loadNotes();
        }
    } catch (error) {
        console.error('Error adding note:', error);
        alert('Failed to add note');
    }
}

async function deleteNote(id) {
    try {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadNotes();
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
    }
}

function displayNotes(notes) {
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state">No notes yet. Add your first note! 📝</div>';
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-card">
        <div class="note-content">${escapeHtml(note.text)}</div>
            <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
