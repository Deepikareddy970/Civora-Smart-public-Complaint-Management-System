
let complaints = JSON.parse(localStorage.getItem('complaints')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let complaintCounter = complaints.length + 100;

if (complaints.length === 0) {
    initializeSampleData();
}


function initializeSampleData() {
    const now = new Date();
    
    
    const oldDate1 = new Date(now);
    oldDate1.setDate(now.getDate() - 25);
    
    
    const oldDate2 = new Date(now);
    oldDate2.setDate(now.getDate() - 15);
    
    
    const oldDate3 = new Date(now);
    oldDate3.setDate(now.getDate() - 5);

    complaints = [
        {
            id: 'NS-2024-101',
            name: 'Anita Desai',
            phone: '9876543210',
            category: 'Road damage',
            description: 'Large pothole near Andheri station causing accidents',
            urgency: 'high',
            lat: 28.6210,
            lng: 77.2150,
            createdAt: oldDate1.toISOString(),
            status: 'pending',
            escalated: false
        },
        {
            id: 'NS-2024-102',
            name: 'Karan Mehra',
            phone: '9876543211',
            category: 'Street light',
            description: 'Three poles dark on MG road for 2 weeks',
            urgency: 'medium',
            lat: 28.6080,
            lng: 77.2005,
            createdAt: oldDate2.toISOString(),
            status: 'pending',
            escalated: false
        },
        {
            id: 'NS-2024-103',
            name: 'Priya Kapoor',
            phone: '9876543212',
            category: 'Garbage',
            description: 'Open waste behind community centre',
            urgency: 'low',
            lat: 28.6180,
            lng: 77.2120,
            createdAt: oldDate3.toISOString(),
            status: 'pending',
            escalated: false
        }
    ];
    
    saveComplaints();
}


function saveComplaints() {
    localStorage.setItem('complaints', JSON.stringify(complaints));
}

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function generateComplaintId() {
    complaintCounter++;
    const year = new Date().getFullYear();
    return `NS-${year}-${complaintCounter}`;
}

function calculateDays(createdAt) {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function checkEscalation(complaint) {
    const days = calculateDays(complaint.createdAt);
    if (!complaint.status === 'resolved' && days >= 20 && !complaint.escalated) {
        complaint.escalated = true;
        complaint.status = 'escalated';
        showNotification(`Complaint ${complaint.id} escalated to higher authorities!`);
        saveComplaints();
        return true;
    }
    return false;
}

function showNotification(message) {
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}


function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('loginUserType').value;
    
    
    if (email && password) {
        
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: email,
            type: userType,
            name: email.split('@')[0]
        }));
        
        alert(`Login successful! Redirecting to ${userType} dashboard...`);
        
        
        if (userType === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        alert('Please enter valid credentials');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    const newUser = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('regEmail').value,
        mobile: document.getElementById('mobile').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        pincode: document.getElementById('pincode').value,
        password: password,
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}


let map, marker;
let currentStream = null;

function openCamera() {
    const video = document.getElementById('video');
    const cameraPreview = document.getElementById('cameraPreview');
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                currentStream = stream;
                video.srcObject = stream;
                cameraPreview.classList.remove('hidden');
                
                
                getLocation();
            })
            .catch(function(error) {
                alert('Unable to access camera: ' + error.message);
            });
    } else {
        alert('Camera not supported on this device');
    }
}

function closeCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    document.getElementById('cameraPreview').classList.add('hidden');
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                document.getElementById('latitude').textContent = lat.toFixed(6);
                document.getElementById('longitude').textContent = lng.toFixed(6);
                document.getElementById('latField').value = lat;
                document.getElementById('lngField').value = lng;
                document.getElementById('coordinates').classList.remove('hidden');
                document.getElementById('locationStatus').innerHTML = '<i class="fas fa-check-circle" style="color: green;"></i> Location captured successfully!';
                
                
                if (!map) {
                    map = L.map('complaintMap').setView([lat, lng], 15);
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                        attribution: '&copy; OpenStreetMap'
                    }).addTo(map);
                    marker = L.marker([lat, lng]).addTo(map);
                } else {
                    map.setView([lat, lng], 15);
                    if (marker) {
                        marker.setLatLng([lat, lng]);
                    } else {
                        marker = L.marker([lat, lng]).addTo(map);
                    }
                }
            },
            function(error) {
                document.getElementById('locationStatus').innerHTML = '<i class="fas fa-exclamation-triangle" style="color: red;"></i> Unable to get location: ' + error.message;
            }
        );
    } else {
        document.getElementById('locationStatus').innerHTML = '<i class="fas fa-exclamation-triangle" style="color: red;"></i> Geolocation not supported';
    }
}

function captureLocation() {
    getLocation();
    closeCamera();
}

function handleComplaintSubmit(event) {
    event.preventDefault();
    
    const lat = document.getElementById('latField').value;
    const lng = document.getElementById('lngField').value;
    
    if (!lat || !lng) {
        alert('Please capture your location using the camera first!');
        return;
    }
    
    const newComplaint = {
        id: generateComplaintId(),
        name: document.getElementById('complainantName').value,
        phone: document.getElementById('complainantPhone').value,
        email: document.getElementById('complainantEmail').value,
        category: document.getElementById('complaintCategory').value,
        urgency: document.getElementById('urgencyLevel').value,
        description: document.getElementById('complaintDescription').value,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        createdAt: new Date().toISOString(),
        status: 'pending',
        escalated: false
    };
    
    complaints.push(newComplaint);
    saveComplaints();
    
    alert(`Complaint registered successfully! Your Complaint ID is: ${newComplaint.id}`);
    window.location.href = 'status.html';
}


function trackComplaint() {
    const complaintId = document.getElementById('complaintId').value;
    const resultDiv = document.getElementById('trackResult');
    
    if (!complaintId) {
        alert('Please enter a complaint ID');
        return;
    }
    
    const complaint = complaints.find(c => c.id === complaintId);
    
    if (!complaint) {
        resultDiv.innerHTML = `
            <div style="text-align: center; color: var(--danger);">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <h3>Complaint Not Found</h3>
                <p>No complaint found with ID: ${complaintId}</p>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        return;
    }
    
    const days = calculateDays(complaint.createdAt);
    const statusClass = complaint.status === 'resolved' ? 'status-resolved' : 
                       complaint.status === 'escalated' ? 'status-escalated' : 'status-pending';
    
    let escalationMessage = '';
    if (days >= 20 && !complaint.resolved) {
        escalationMessage = '<p style="color: var(--danger);"><i class="fas fa-exclamation-triangle"></i> This complaint has been escalated to higher authorities!</p>';
    } else if (days >= 10) {
        escalationMessage = '<p style="color: var(--warning);"><i class="fas fa-clock"></i> This complaint is pending for over 10 days. Will be escalated soon.</p>';
    }
    
    resultDiv.innerHTML = `
        <h3>Complaint Status: ${complaint.id}</h3>
        <div class="complaint-details">
            <p><strong>Category:</strong> ${complaint.category}</p>
            <p><strong>Description:</strong> ${complaint.description}</p>
            <p><strong>Filed on:</strong> ${new Date(complaint.createdAt).toLocaleDateString()}</p>
            <p><strong>Days pending:</strong> ${days}</p>
            <p><strong>Urgency:</strong> <span style="color: ${complaint.urgency === 'high' ? 'red' : complaint.urgency === 'medium' ? 'orange' : 'green'}">${complaint.urgency}</span></p>
            <p><strong>Current Status:</strong> <span class="status-badge ${statusClass}">${complaint.status}</span></p>
            ${escalationMessage}
        </div>
    `;
    
    resultDiv.classList.remove('hidden');
}


function loadAdminDashboard() {
    const tbody = document.getElementById('complaintsTableBody');
    const escalatedList = document.getElementById('escalatedList');
    
    if (!tbody) return;
    
    let total = complaints.length;
    let resolved = complaints.filter(c => c.status === 'resolved').length;
    let pending = complaints.filter(c => c.status === 'pending').length;
    let escalated = complaints.filter(c => {
        const days = calculateDays(c.createdAt);
        return days >= 20 && c.status !== 'resolved';
    }).length;
    
    document.getElementById('totalComplaints').textContent = total;
    document.getElementById('resolvedComplaints').textContent = resolved;
    document.getElementById('pendingComplaints').textContent = pending;
    document.getElementById('escalatedComplaints').textContent = escalated;
    
    
    let tableHtml = '';
    complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(c => {
        const days = calculateDays(c.createdAt);
        const statusClass = c.status === 'resolved' ? 'status-resolved' : 
                           days >= 20 ? 'status-escalated' : 'status-pending';
        const statusText = c.status === 'resolved' ? 'Resolved' : 
                          days >= 20 ? 'Escalated' : 'Pending';
        
        tableHtml += `
            <tr>
                <td>${c.id}</td>
                <td>${new Date(c.createdAt).toLocaleDateString()}</td>
                <td>${c.name}</td>
                <td>${c.category}</td>
                <td>${days}</td>
                <td style="color: ${c.urgency === 'high' ? 'red' : c.urgency === 'medium' ? 'orange' : 'green'}">${c.urgency}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${c.status !== 'resolved' ? `
                        <button class="resolve-btn" onclick="resolveComplaint('${c.id}')">✓ Resolve</button>
                    ` : ''}
                    ${days >= 10 && c.status !== 'resolved' && c.status !== 'escalated' ? `
                        <button class="escalate-btn" onclick="escalateComplaint('${c.id}')">⚠ Escalate</button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHtml;
    
    
    let escalatedHtml = '';
    complaints.filter(c => {
        const days = calculateDays(c.createdAt);
        return days >= 20 && c.status !== 'resolved';
    }).forEach(c => {
        escalatedHtml += `
            <div style="background: white; padding: 1rem; margin-bottom: 0.5rem; border-radius: 5px; border-left: 4px solid var(--danger);">
                <strong>${c.id}</strong> - ${c.category}<br>
                <small>${c.description.substring(0, 100)}... (${calculateDays(c.createdAt)} days pending)</small>
                <br>
                <button class="escalate-btn" onclick="reportToHigherAuthority('${c.id}')">📢 Report to Higher Authority</button>
            </div>
        `;
    });
    
    if (escalatedList) {
        escalatedList.innerHTML = escalatedHtml || '<p>No escalated complaints</p>';
    }
}

function resolveComplaint(id) {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = 'resolved';
        saveComplaints();
        loadAdminDashboard();
        alert(`Complaint ${id} marked as resolved!`);
    }
}

function escalateComplaint(id) {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
        complaint.status = 'escalated';
        complaint.escalated = true;
        saveComplaints();
        reportToHigherAuthority(id);
        loadAdminDashboard();
    }
}

function reportToHigherAuthority(id) {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
        const days = calculateDays(complaint.createdAt);
        const reportMessage = `
📢 COMPLAINT REPORTED TO HIGHER AUTHORITIES
════════════════════════════════════
Complaint ID: ${complaint.id}
Category: ${complaint.category}
Filed by: ${complaint.name}
Contact: ${complaint.phone}
Days pending: ${days}
Description: ${complaint.description}
Location: ${complaint.lat}, ${complaint.lng}
Urgency: ${complaint.urgency}
════════════════════════════════════
✅ Report sent to:
• District Commissioner
• Municipal Commissioner
• Chief Grievance Officer
• State Grievance Cell

Acknowledgment ID: HAC-${Date.now().toString().slice(-8)}
        `;
        
        alert(reportMessage);
        console.log('REPORTED TO HIGHER AUTHORITIES:', reportMessage);
        
        
        complaint.status = 'escalated';
        complaint.escalated = true;
        complaint.escalatedAt = new Date().toISOString();
        saveComplaints();
        
        loadAdminDashboard();
    }
}

function exportData() {
    const dataStr = JSON.stringify(complaints, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nagarsetu_complaints_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}


function updateHomeStats() {
    const resolvedEl = document.getElementById('resolvedCount');
    const pendingEl = document.getElementById('pendingCount');
    
    if (resolvedEl) {
        resolvedEl.textContent = complaints.filter(c => c.status === 'resolved').length;
    }
    if (pendingEl) {
        pendingEl.textContent = complaints.filter(c => c.status === 'pending' || c.status === 'escalated').length;
    }
}


function loadRecentComplaints() {
    const recentList = document.getElementById('recentList');
    if (!recentList) return;
    
    const recent = complaints.slice(-3).reverse();
    let html = '';
    
    recent.forEach(c => {
        const days = calculateDays(c.createdAt);
        html += `
            <div class="complaint-card" onclick="document.getElementById('complaintId').value = '${c.id}'" style="cursor: pointer;">
                <strong>${c.id}</strong> - ${c.category}<br>
                <small>${c.description.substring(0, 50)}... (${days} days ago)</small>
            </div>
        `;
    });
    
    recentList.innerHTML = html;
}


document.addEventListener('DOMContentLoaded', function() {
    
    const path = window.location.pathname;
    
    if (path.includes('admin.html')) {
        loadAdminDashboard();
        
        
        setInterval(loadAdminDashboard, 60000);
    }
    
    if (path.includes('status.html')) {
        loadRecentComplaints();
    }
    
    if (path.includes('index.html') || path === '/' || path.endsWith('index.html')) {
        updateHomeStats();
        
        
        setInterval(updateHomeStats, 30000);
    }
    
    
    setInterval(function() {
        let escalated = false;
        complaints.forEach(c => {
            if (checkEscalation(c)) {
                escalated = true;
            }
        });
        if (escalated) {
            saveComplaints();
            if (window.location.pathname.includes('admin.html')) {
                loadAdminDashboard();
            }
        }
    }, 3600000); 
});