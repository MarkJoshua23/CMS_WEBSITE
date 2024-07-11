// DOM elements
const monthSelect = document.getElementById('monthSelect');
const eventTableBody = document.getElementById('eventTableBody');
const addEventForm = document.getElementById('addEventForm');
const saveEventBtn = document.getElementById('saveEventBtn');

// Event listeners
window.addEventListener('load', () => {
    const currentMonth = new Date().getMonth() + 1;
    monthSelect.value = currentMonth;
    getEvents(currentMonth);
});

monthSelect.addEventListener('change', () => {
    getEvents(monthSelect.value);
});

saveEventBtn.addEventListener('click', addEvent);

// Fetch events for a specific month
function getEvents(month) {
    fetch(`https://myeuc-server.onrender.com/api/events/month/${month}`, { mode: 'cors' })
        .then(response => response.json())
        .then(data => {
            displayEvents(data.data);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            displayNoEvents();
        });
}

// Display events in the table
function displayEvents(events) {
    if (events.length === 0) {
        displayNoEvents();
        return;
    }

    let html = "";
    events.forEach(event => {
        html += `
            <tr>
                <td>${event.date}</td>
                <td>${event.day_name}</td>
                <td>${event.event_name}</td>
                <td>${event.event_description}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editEvent('${event.event_id}', '${event.date}', '${event.event_name}', '${event.event_description}')">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEvent('${event.event_id}')">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>`;
    });
    eventTableBody.innerHTML = html;
}

// Display message when no events are found
function displayNoEvents() {
    eventTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">No events found for this month.</td>
        </tr>`;
}

// Add or update an event
function addEvent() {
    const eventId = document.getElementById('eventId').value;
    const date = document.getElementById('eventDate').value;
    const event_name = document.getElementById('eventName').value;
    const event_description = document.getElementById('eventDescription').value;

    const formData = { date, event_name, event_description };
    
    let url = "https://myeuc-server.onrender.com/api/events";
    let method = "POST";

    if (eventId) {
        // If eventId exists, we're updating an existing event
        formData.event_id = eventId;
        method = "PUT";
    }

    fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => {
        alert(data.msg);
        const modal = bootstrap.Modal.getInstance(document.getElementById('addEventModal'));
        modal.hide();
        getEvents(monthSelect.value);
        
        // Reset form and button
        resetForm();
    })
    .catch(error => console.error('Error adding/updating event:', error));
}

// Edit an event
function editEvent(eventId, date, eventName, eventDescription) {
    const modal = new bootstrap.Modal(document.getElementById('addEventModal'));
    document.getElementById('eventId').value = eventId;
    
    // Parse the ISO date string and convert to local date
    const eventDate = new Date(date);
    const localDate = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * 60000));
    
    // Format the date to YYYY-MM-DD for the date input
    const formattedDate = localDate.toISOString().split('T')[0];
    document.getElementById('eventDate').value = formattedDate;
    
    document.getElementById('eventName').value = eventName;
    document.getElementById('eventDescription').value = eventDescription;
    
    saveEventBtn.textContent = 'Update Event';
    
    modal.show();
}

// Delete an event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        const formData = { event_id: eventId };

        fetch("https://myeuc-server.onrender.com/api/events", {
            method: "DELETE",
            body: JSON.stringify(formData),
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(response => response.json())
        .then(data => {
            alert(data.msg);
            getEvents(monthSelect.value);
        })
        .catch(error => console.error('Error deleting event:', error));
    }
}

// Reset form when modal is closed
document.getElementById('addEventModal').addEventListener('hidden.bs.modal', resetForm);

// New function to reset the form
function resetForm() {
    addEventForm.reset();
    document.getElementById('eventId').value = '';
    saveEventBtn.textContent = 'Save Event';
    // Remove any existing event listeners
    saveEventBtn.removeEventListener('click', addEvent);
    // Add the event listener again
    saveEventBtn.addEventListener('click', addEvent);
}