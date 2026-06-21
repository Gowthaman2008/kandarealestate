import { db, auth } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Admin Panel State
let currentUser = null;
let databaseData = { newsletter: [], inquiries: [], callbacks: [], stats: {} };

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

function initAdmin() {
  setupAuthObserver();
  setupAuthListeners();
  setupTabListeners();
  setupSearchListeners();
  setupExportListeners();
}

// ==========================================
// AUTHENTICATION MANAGEMENT
// ==========================================

function setupAuthObserver() {
  // Listen for Firebase Auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      showDashboard();
    } else {
      currentUser = null;
      showAuth();
    }
  });
}

function setupAuthListeners() {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('auth-error-msg');
      
      errorMsg.style.display = 'none';
      
      try {
        // Authenticate user with Firebase Auth
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (err) {
        console.error('Firebase Login error:', err);
        errorMsg.textContent = 'Invalid email or password. Please verify your credentials.';
        errorMsg.style.display = 'block';
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  }
}

function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('dashboard-screen').style.display = 'none';
}

function showDashboard() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('dashboard-screen').style.display = 'block';
  fetchDashboardData();
}

// ==========================================
// DATA FETCHING & RENDERING
// ==========================================

async function fetchDashboardData() {
  if (!currentUser) return;
  
  try {
    // Fetch Firestore collections
    const newsletterQuery = query(collection(db, "newsletter"), orderBy("created_at", "desc"));
    const inquiriesQuery = query(collection(db, "inquiries"), orderBy("created_at", "desc"));
    const callbacksQuery = query(collection(db, "callbacks"), orderBy("created_at", "desc"));

    const [newsletterSnap, inquiriesSnap, callbacksSnap] = await Promise.all([
      getDocs(newsletterQuery),
      getDocs(inquiriesQuery),
      getDocs(callbacksQuery)
    ]);
    
    // Map documents to state arrays
    databaseData.newsletter = newsletterSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    databaseData.inquiries = inquiriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    databaseData.callbacks = callbacksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Aggregate statistics
    databaseData.stats = {
      totalSubscribers: databaseData.newsletter.length,
      totalInquiries: databaseData.inquiries.length,
      totalCallbacks: databaseData.callbacks.length,
      pendingInquiries: databaseData.inquiries.filter(i => i.status === 'Pending').length,
      pendingCallbacks: databaseData.callbacks.filter(c => c.status === 'Pending').length
    };
    
    renderStats();
    renderTables();
  } catch (err) {
    console.error('Error fetching Firestore data:', err);
    alert('Failed to retrieve database entries. Verify your Firestore Security Rules allow read access.');
  }
}

function renderStats() {
  const stats = databaseData.stats || {};
  document.getElementById('stat-subscribers').textContent = stats.totalSubscribers || 0;
  document.getElementById('stat-inquiries').textContent = stats.totalInquiries || 0;
  document.getElementById('stat-callbacks').textContent = stats.totalCallbacks || 0;
  document.getElementById('stat-pending').textContent = (stats.pendingInquiries || 0) + (stats.pendingCallbacks || 0);
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderTables() {
  renderInquiriesTable();
  renderCallbacksTable();
  renderNewsletterTable();
}

// Render Contact Inquiries Table
function renderInquiriesTable() {
  const tbody = document.getElementById('inquiries-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const entries = databaseData.inquiries || [];
  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="no-data">No contact inquiries found.</td></tr>`;
    return;
  }
  
  entries.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    
    let statusClass = 'badge-pending';
    if (row.status === 'Contacted') statusClass = 'badge-contacted';
    if (row.status === 'Resolved') statusClass = 'badge-resolved';
    
    tr.innerHTML = `
      <td>${formatDate(row.created_at)}</td>
      <td style="font-weight: 600;">${escapeHtml(row.name)}</td>
      <td>
        <div><i class="fa-solid fa-envelope" style="color: #888; width: 16px;"></i> ${escapeHtml(row.email)}</div>
        <div><i class="fa-solid fa-phone" style="color: #888; width: 16px;"></i> ${escapeHtml(row.phone)}</div>
      </td>
      <td><span class="badge" style="background: rgba(83, 158, 64, 0.08); color: #356927;">${escapeHtml(row.interest)}</span></td>
      <td style="max-width: 250px; font-size: 0.85rem; color: #555;" title="${escapeHtml(row.message)}">${escapeHtml(row.message)}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(row.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-status-btn" onclick="updateLeadStatus('inquiry', '${row.id}', '${row.status}')" title="Change Status">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <button class="action-btn action-delete-btn" onclick="deleteLead('inquiry', '${row.id}')" title="Delete Inquiry">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Callbacks Table
function renderCallbacksTable() {
  const tbody = document.getElementById('callbacks-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const entries = databaseData.callbacks || [];
  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-data">No callback requests found.</td></tr>`;
    return;
  }
  
  entries.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    
    let statusClass = 'badge-pending';
    if (row.status === 'Contacted') statusClass = 'badge-contacted';
    if (row.status === 'Resolved') statusClass = 'badge-resolved';
    
    tr.innerHTML = `
      <td>${formatDate(row.created_at)}</td>
      <td style="font-weight: 600;">${escapeHtml(row.name)}</td>
      <td><i class="fa-solid fa-phone" style="color: #888; width: 16px;"></i> ${escapeHtml(row.phone)}</td>
      <td>${row.property_title ? `<span style="font-size: 0.85rem; font-weight: 500; color: #356927;"><i class="fa-solid fa-house-circle-check"></i> ${escapeHtml(row.property_title)}</span>` : '<span style="color:#aaa; font-size:0.8rem;">General Callback</span>'}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(row.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-status-btn" onclick="updateLeadStatus('callback', '${row.id}', '${row.status}')" title="Change Status">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <button class="action-btn action-delete-btn" onclick="deleteLead('callback', '${row.id}')" title="Delete Request">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Render Newsletter List Table
function renderNewsletterTable() {
  const tbody = document.getElementById('newsletter-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const entries = databaseData.newsletter || [];
  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="no-data">No newsletter subscribers found.</td></tr>`;
    return;
  }
  
  entries.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    
    tr.innerHTML = `
      <td>${formatDate(row.created_at)}</td>
      <td style="font-weight: 600;">${escapeHtml(row.email)}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-delete-btn" onclick="deleteLead('newsletter', '${row.id}')" title="Delete Subscriber">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// STATUS UPDATES & DELETIONS
// ==========================================

// Expose these functions to global window object so onclick handlers can run
window.updateLeadStatus = async function(type, id, currentStatus) {
  let nextStatus = 'Pending';
  if (currentStatus === 'Pending') nextStatus = 'Contacted';
  else if (currentStatus === 'Contacted') nextStatus = 'Resolved';
  else if (currentStatus === 'Resolved') nextStatus = 'Pending';

  const table = type === 'inquiry' ? 'inquiries' : 'callbacks';

  try {
    // Update status field in Firestore document
    const docRef = doc(db, table, id);
    await updateDoc(docRef, { status: nextStatus });
    
    // Refresh local list
    fetchDashboardData();
  } catch (err) {
    console.error('Error updating Firestore status:', err);
    alert('Failed to update status.');
  }
};

window.deleteLead = async function(type, id) {
  if (!confirm(`Are you sure you want to delete this ${type} record permanently?`)) {
    return;
  }

  let table = '';
  if (type === 'newsletter') table = 'newsletter';
  else if (type === 'inquiry') table = 'inquiries';
  else if (type === 'callback') table = 'callbacks';
  else return;

  try {
    // Delete document in Firestore
    const docRef = doc(db, table, id);
    await deleteDoc(docRef);
    
    // Refresh local list
    fetchDashboardData();
  } catch (err) {
    console.error('Error deleting Firestore record:', err);
    alert('Failed to delete record.');
  }
};

// ==========================================
// TABS & INTERACTION LISTENERS
// ==========================================

function setupTabListeners() {
  const triggers = document.querySelectorAll('.tab-trigger');
  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      triggers.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });
}

function setupSearchListeners() {
  const searchInputs = document.querySelectorAll('.table-search');
  searchInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const queryVal = e.target.value.toLowerCase();
      const tableId = e.target.getAttribute('data-table');
      const table = document.getElementById(tableId);
      if (!table) return;
      
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        if (row.classList.contains('no-data')) return;
        const text = row.innerText.toLowerCase();
        if (text.includes(queryVal)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
}

function setupExportListeners() {
  document.getElementById('export-inquiries').addEventListener('click', () => {
    exportToCsv('inquiries', [
      { key: 'created_at', label: 'Date' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'interest', label: 'Interest' },
      { key: 'message', label: 'Message' },
      { key: 'status', label: 'Status' }
    ]);
  });
  
  document.getElementById('export-callbacks').addEventListener('click', () => {
    exportToCsv('callbacks', [
      { key: 'created_at', label: 'Date' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'property_title', label: 'Property Title' },
      { key: 'status', label: 'Status' }
    ]);
  });
  
  document.getElementById('export-newsletter').addEventListener('click', () => {
    exportToCsv('newsletter', [
      { key: 'created_at', label: 'Date Subscribed' },
      { key: 'email', label: 'Email Address' }
    ]);
  });
}

function exportToCsv(dataType, headers) {
  const dataList = databaseData[dataType] || [];
  if (dataList.length === 0) {
    alert('No data to export.');
    return;
  }
  
  // Header row
  let csvContent = headers.map(h => `"${h.label}"`).join(',') + '\n';
  
  // Data rows
  dataList.forEach(row => {
    const rowContent = headers.map(h => {
      let val = row[h.key] || '';
      if (h.key === 'created_at') {
        val = new Date(val).toLocaleString('en-IN');
      }
      // Escape double quotes
      val = val.toString().replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
    csvContent += rowContent + '\n';
  });
  
  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kanda_${dataType}_export_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
