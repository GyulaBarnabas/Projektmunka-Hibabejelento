// admin_users.js
const API_BASE_URL = '/api';
let currentUserProfile = null;

document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html'; // Vissza a login oldalra, ha nincs token
        return;
    }

    
    await loadUserProfile();

    if (currentUserProfile && currentUserProfile.szerep === 'admin') {
        document.getElementById('adminContent').style.display = 'block';
        loadUsers();

        const newUserForm = document.getElementById('newUserForm');
        if (newUserForm) newUserForm.addEventListener('submit', handleNewUserSubmit);
        
        const filterRole = document.getElementById('filterRole');
        if (filterRole) filterRole.addEventListener('change', handleFilterChange);

    } else {
        document.getElementById('accessDenied').style.display = 'block';
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
});

function handleLogout() {
    sessionStorage.removeItem('authToken');
    window.location.replace('index.html');
}

async function loadUserProfile() {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/profil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            currentUserProfile = await response.json();
            document.getElementById('userInfo').textContent = `Bejelentkezve: ${currentUserProfile.nev} (${currentUserProfile.szerep})`;
        } else {
            console.error('Admin profiladatok lekérdezése sikertelen.');
            if (response.status === 401 || response.status === 403) handleLogout();
        }
    } catch (error) {
        console.error('Hiba az admin profiladatok lekérdezésekor:', error);
    }
}

async function loadUsers() {
    const token = sessionStorage.getItem('authToken');
    const userListErrorDiv = document.getElementById('userListError');
    userListErrorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/felhasznalok`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const users = await response.json();
            renderUsers(users);
        } else {
            const data = await response.json();
            userListErrorDiv.textContent = data.error || 'Felhasználók lekérdezése sikertelen.';
            if (response.status === 401 || response.status === 403) handleLogout();
        }
    } catch (error) {
        console.error('Hiba a felhasználók lekérdezésekor:', error);
        userListErrorDiv.textContent = 'Hálózati hiba történt a felhasználók lekérdezésekor.';
    }
}

function renderUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    if (!users || users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">Nincsenek felhasználók.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = user.id;
        row.insertCell().textContent = user.nev;
        row.insertCell().textContent = user.felhasznalonev;
        row.insertCell().textContent = user.szerep;

        const actionsCell = row.insertCell();
        if (currentUserProfile && currentUserProfile.id !== user.id) { // Admin nem törölheti magát
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('btn', 'btn-sm', 'btn-danger');
            deleteButton.textContent = 'Törlés';
            deleteButton.onclick = () => handleDeleteUser(user.id, user.felhasznalonev);
            actionsCell.appendChild(deleteButton);
        } else {
            actionsCell.textContent = '-';
        }
    });
}

async function handleNewUserSubmit(event) {
    event.preventDefault();
    const token = sessionStorage.getItem('authToken');
    const nev = document.getElementById('newUserName').value;
    const felhasznalonev = document.getElementById('newUserUsername').value;
    const jelszo = document.getElementById('newUserPassword').value;
    const szerep = document.getElementById('newUserRole').value;
    const newUserErrorDiv = document.getElementById('newUserError');
    newUserErrorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/felhasznalok`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nev, felhasznalonev, jelszo, szerep })
        });
        const data = await response.json();
        if (response.ok) {
            loadUsers();
            document.getElementById('newUserForm').reset();
        } else {
            newUserErrorDiv.textContent = data.error || 'Hiba történt a felhasználó létrehozása során.';
        }
    } catch (error) {
        console.error('Új felhasználó mentési hiba:', error);
        newUserErrorDiv.textContent = 'Hálózati hiba történt a felhasználó létrehozása során.';
    }
}

async function handleDeleteUser(userId, username) {
    const token = sessionStorage.getItem('authToken');
    if (!confirm(`Biztosan törölni szeretnéd a(z) "${username}" (${userId}) felhasználót?`)) {
        return;
    }

    const userListErrorDiv = document.getElementById('userListError');
    userListErrorDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/felhasznalok/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
            loadUsers(); 
        } else {
            userListErrorDiv.textContent = data.error || `Hiba történt a(z) "${username}" felhasználó törlése során.`;
            alert(data.error || `Hiba történt a(z) "${username}" felhasználó törlése során.`);
        }
    } catch (error) {
        console.error('Felhasználó törlési hiba:', error);
        userListErrorDiv.textContent = `Hálózati hiba történt a(z) "${username}" felhasználó törlése során.`;
        alert(`Hálózati hiba történt a(z) "${username}" felhasználó törlése során.`);
    }
}

function handleFilterChange() {
    const filterValue = document.getElementById('filterRole').value;
    const token = sessionStorage.getItem('authToken');
    const userListErrorDiv = document.getElementById('userListError');
    userListErrorDiv.textContent = '';

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        fetch(`${API_BASE_URL}/felhasznalok`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Felhasználók lekérdezése sikertelen.');
            }
            return response.json();
        })
        .then(users => {
            let filteredUsers = users;
            
            if (filterValue !== '') {
                filteredUsers = users.filter(user => user.szerep === filterValue);
            }
            
            renderUsers(filteredUsers);
        })
        .catch(error => {
            console.error('Hiba a felhasználók lekérdezésekor:', error);
            userListErrorDiv.textContent = 'Hálózati hiba történt a felhasználók lekérdezésekor.';
        });
    } catch (error) {
        console.error('Hiba a szűrés során:', error);
        userListErrorDiv.textContent = 'Hiba történt a szűrés során.';
    }
}
