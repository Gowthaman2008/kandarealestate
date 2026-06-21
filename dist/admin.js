import { db, auth, storage } from "./firebase-config.js";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  addDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Admin Panel State
let currentUser = null;
let databaseData = { newsletter: [], inquiries: [], callbacks: [], stats: {}, properties: [], locations: [], types: [], budgets: [] };
let propertyFormImages = [];

const fallbackLocations = [
  { key: "ecr", label: "ECR" },
  { key: "adyar", label: "Adyar" },
  { key: "omr", label: "OMR" },
  { key: "kodaikanal", label: "Kodaikanal" },
  { key: "coimbatore", label: "Coimbatore" }
];

const fallbackTypes = [
  { key: "villa", label: "Villa" },
  { key: "apartment", label: "Apartment" },
  { key: "commercial", label: "Commercial" },
  { key: "land", label: "Premium Land" }
];

const fallbackBudgets = [
  { value: 10000000, label: "₹1.00 Crore" },
  { value: 20000000, label: "₹2.00 Crores" },
  { value: 30000000, label: "₹3.00 Crores" },
  { value: 50000000, label: "₹5.00 Crores" },
  { value: 100000000, label: "₹10.00 Crores" }
];

const LS_LOCATIONS_KEY = 'kanda_custom_locations';
const LS_TYPES_KEY = 'kanda_custom_types';
const LS_BUDGETS_KEY = 'kanda_custom_budgets';

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
  setupPropertyListeners();
  setupFilterManagementListeners();
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
    const propertiesQuery = query(collection(db, "properties"), orderBy("sortOrder", "asc"));
    const locationsQuery = query(collection(db, "locations"), orderBy("label", "asc"));
    const typesQuery = query(collection(db, "types"), orderBy("label", "asc"));
    const budgetsQuery = query(collection(db, "budgets"), orderBy("value", "asc"));

    // Gracefully catch errors for each collection fetch so security rules issues don't crash dashboard
    const [newsletterSnap, inquiriesSnap, callbacksSnap, propertiesSnap, locationsSnap, typesSnap, budgetsSnap] = await Promise.all([
      getDocs(newsletterQuery).catch(err => { console.warn("Failed to fetch newsletter:", err); return { docs: [] }; }),
      getDocs(inquiriesQuery).catch(err => { console.warn("Failed to fetch inquiries:", err); return { docs: [] }; }),
      getDocs(callbacksQuery).catch(err => { console.warn("Failed to fetch callbacks:", err); return { docs: [] }; }),
      getDocs(propertiesQuery).catch(err => { console.warn("Failed to fetch properties:", err); return { docs: [] }; }),
      getDocs(locationsQuery).catch(err => { console.warn("Failed to fetch locations:", err); return { docs: [] }; }),
      getDocs(typesQuery).catch(err => { console.warn("Failed to fetch types:", err); return { docs: [] }; }),
      getDocs(budgetsQuery).catch(err => { console.warn("Failed to fetch budgets:", err); return { docs: [] }; })
    ]);
    
    // Map documents to state arrays
    databaseData.newsletter = newsletterSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    databaseData.inquiries = inquiriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    databaseData.callbacks = callbacksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    databaseData.properties = propertiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch local fallback custom filters
    let localLocs = localStorage.getItem(LS_LOCATIONS_KEY);
    let localTypes = localStorage.getItem(LS_TYPES_KEY);
    let localBudgets = localStorage.getItem(LS_BUDGETS_KEY);

    // Initialize LocalStorage with default fallbacks if empty
    if (!localLocs) {
      const defaultLocs = fallbackLocations.map((item, idx) => ({ id: `local-loc-${idx}`, ...item }));
      localStorage.setItem(LS_LOCATIONS_KEY, JSON.stringify(defaultLocs));
      localLocs = JSON.stringify(defaultLocs);
    }
    if (!localTypes) {
      const defaultTypes = fallbackTypes.map((item, idx) => ({ id: `local-type-${idx}`, ...item }));
      localStorage.setItem(LS_TYPES_KEY, JSON.stringify(defaultTypes));
      localTypes = JSON.stringify(defaultTypes);
    }
    if (!localBudgets) {
      const defaultBudgets = fallbackBudgets.map((item, idx) => ({ id: `local-budget-${idx}`, ...item }));
      localStorage.setItem(LS_BUDGETS_KEY, JSON.stringify(defaultBudgets));
      localBudgets = JSON.stringify(defaultBudgets);
    }

    // Load locations
    if (locationsSnap.docs.length > 0) {
      databaseData.locations = locationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      databaseData.locations = JSON.parse(localLocs);
    }

    // Load types
    if (typesSnap.docs.length > 0) {
      databaseData.types = typesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      databaseData.types = JSON.parse(localTypes);
    }

    // Load budgets
    if (budgetsSnap.docs.length > 0) {
      databaseData.budgets = budgetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      databaseData.budgets = JSON.parse(localBudgets);
    }

    // Seed default properties if database is empty (and we didn't fail to fetch)
    if (databaseData.properties.length === 0 && propertiesSnap.docs.length > 0) {
      console.log("No properties found in Firestore. Seeding default properties...");
      await seedDefaultProperties().catch(err => console.error("Error seeding properties:", err));
      const freshSnap = await getDocs(propertiesQuery).catch(() => ({ docs: [] }));
      databaseData.properties = freshSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
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
  renderPropertiesTable();
  renderFiltersLists();
  populatePropertyFormSelects();
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

function renderPropertiesTable() {
  const tbody = document.getElementById('properties-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const entries = databaseData.properties || [];
  if (entries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="no-data">No properties found.</td></tr>`;
    return;
  }
  
  entries.forEach(row => {
    const tr = document.createElement('tr');
    tr.dataset.id = row.id;
    
    tr.innerHTML = `
      <td style="font-weight: 600;">${escapeHtml(row.title)}</td>
      <td><span class="badge" style="background: rgba(83, 158, 64, 0.08); color: #356927;">${escapeHtml(row.type)}</span></td>
      <td>${escapeHtml(row.location)}</td>
      <td>${escapeHtml(row.priceLabel)}</td>
      <td>${row.sortOrder || 0}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-status-btn" onclick="openEditPropertyModal('${row.id}')" title="Edit Property">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="action-btn action-delete-btn" onclick="deleteProperty('${row.id}')" title="Delete Property">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.openEditPropertyModal = function(id) {
  const prop = databaseData.properties.find(p => p.id === id);
  if (!prop) return;
  
  // Set form title
  document.getElementById('property-modal-title-text').textContent = 'Edit Property';
  
  // Set hidden ID
  document.getElementById('property-doc-id').value = prop.id;
  
  // Set fields
  document.getElementById('prop-title').value = prop.title || '';
  document.getElementById('prop-type').value = prop.type || 'villa';
  document.getElementById('prop-location-key').value = prop.locationKey || 'ecr';
  document.getElementById('prop-location').value = prop.location || '';
  document.getElementById('prop-price').value = prop.price || 0;
  document.getElementById('prop-price-label').value = prop.priceLabel || '';
  document.getElementById('prop-beds').value = prop.beds || 0;
  document.getElementById('prop-baths').value = prop.baths || 0;
  document.getElementById('prop-sqft').value = prop.sqft || 0;
  document.getElementById('prop-sort-order').value = prop.sortOrder || 10;
  
  // Set images array and render previews
  propertyFormImages = [...(prop.images || [])];
  renderFormImagesPreview();
  
  // Join features by comma
  document.getElementById('prop-features').value = (prop.features || []).join(', ');
  
  document.getElementById('prop-description').value = prop.description || '';
  
  // Show Modal
  document.getElementById('property-form-modal').classList.add('active');
};

window.deleteProperty = async function(id) {
  if (!confirm('Are you sure you want to delete this property permanently?')) {
    return;
  }
  
  try {
    const docRef = doc(db, 'properties', id);
    await deleteDoc(docRef);
    fetchDashboardData();
  } catch (err) {
    console.error('Error deleting property:', err);
    alert('Failed to delete property.');
  }
};

function renderFormImagesPreview() {
  const container = document.getElementById('prop-images-preview-container');
  if (!container) return;
  container.innerHTML = '';
  
  propertyFormImages.forEach((img, index) => {
    const card = document.createElement('div');
    card.className = 'preview-image-card';
    
    const imgEl = document.createElement('img');
    if (typeof img === 'string') {
      imgEl.src = img;
    } else if (img instanceof File) {
      imgEl.src = URL.createObjectURL(img);
    }
    card.appendChild(imgEl);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'preview-image-delete-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.addEventListener('click', () => {
      propertyFormImages.splice(index, 1);
      renderFormImagesPreview();
    });
    card.appendChild(deleteBtn);
    
    container.appendChild(card);
  });
}

function setupPropertyListeners() {
  const addBtn = document.getElementById('add-property-btn');
  const modal = document.getElementById('property-form-modal');
  const closeBtn = document.getElementById('property-modal-close');
  const cancelBtn = document.getElementById('property-form-cancel');
  const form = document.getElementById('property-form');
  
  const fileInput = document.getElementById('prop-images-file');
  const uploadTriggerBtn = document.getElementById('upload-photos-trigger-btn');
  
  if (uploadTriggerBtn && fileInput) {
    uploadTriggerBtn.addEventListener('click', () => {
      fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      propertyFormImages = [...propertyFormImages, ...files];
      renderFormImagesPreview();
      fileInput.value = ''; // Reset input to let them upload same images again
    });
  }
  
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      // Reset form
      form.reset();
      document.getElementById('property-doc-id').value = '';
      document.getElementById('property-modal-title-text').textContent = 'Add New Property';
      
      propertyFormImages = [];
      renderFormImagesPreview();
      
      // Show Modal
      modal.classList.add('active');
    });
  }
  
  const closeModal = () => {
    modal.classList.remove('active');
  };
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  
  // Close modal when clicking outside card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (propertyFormImages.length === 0) {
        alert('Please choose at least one photo for the property.');
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Uploading Photos & Saving... <i class="fa-solid fa-spinner fa-spin"></i>';
      
      const docId = document.getElementById('property-doc-id').value;
      
      try {
        // Upload any local files to Firebase Storage
        const uploadPromises = propertyFormImages.map(async (img) => {
          if (typeof img === 'string') {
            return img; // Already uploaded URL
          } else if (img instanceof File) {
            // Upload local file
            const fileRef = ref(storage, `properties/${Date.now()}_${img.name}`);
            const snapshot = await uploadBytes(fileRef, img);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            return downloadUrl;
          }
        });
        
        const finalImageUrls = await Promise.all(uploadPromises);
        
        // Parse features (comma separated)
        const featuresText = document.getElementById('prop-features').value;
        const features = featuresText.split(',')
          .map(f => f.trim())
          .filter(f => f !== '');
          
        const propertyPayload = {
          title: document.getElementById('prop-title').value.trim(),
          type: document.getElementById('prop-type').value,
          locationKey: document.getElementById('prop-location-key').value,
          location: document.getElementById('prop-location').value.trim(),
          price: parseInt(document.getElementById('prop-price').value),
          priceLabel: document.getElementById('prop-price-label').value.trim(),
          beds: parseInt(document.getElementById('prop-beds').value || 0),
          baths: parseInt(document.getElementById('prop-baths').value || 0),
          sqft: parseInt(document.getElementById('prop-sqft').value),
          sortOrder: parseInt(document.getElementById('prop-sort-order').value || 10),
          images: finalImageUrls,
          features: features,
          description: document.getElementById('prop-description').value.trim(),
          agent: {
            name: 'Murugan Kanda',
            role: 'Founder & Principal Consultant',
            image: 'murugan.png'
          }
        };
        
        if (docId) {
          // Edit Mode
          const docRef = doc(db, 'properties', docId);
          await updateDoc(docRef, propertyPayload);
          console.log("Property updated successfully!");
        } else {
          // Add Mode
          await addDoc(collection(db, 'properties'), propertyPayload);
          console.log("Property created successfully!");
        }
        
        closeModal();
        fetchDashboardData();
      } catch (err) {
        console.error('Error saving property:', err);
        alert('Error saving property data or uploading photos. Verify your Firebase Storage configuration & Security Rules.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
}

async function seedDefaultProperties() {
  const defaultProperties = [
    {
      title: "Kanda Royal Villa",
      location: "ECR Road, Chennai",
      locationKey: "ecr",
      type: "villa",
      price: 45000000,
      priceLabel: "₹4.50 Crores",
      beds: 4,
      baths: 4,
      sqft: 3800,
      images: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
      ],
      description: "Located along the scenic East Coast Road (ECR), this magnificent 4-bedroom villa offers the ultimate luxury beachside living. Fully automated smart-home systems, an infinity pool with a wooden deck, a landscaped private garden, and high ceilings that capture sea breezes. Perfect for families looking for quiet majesty within city reach.",
      features: ["Infinity Pool", "Sea View", "Home Automation", "Private Garden", "Servant Quarters", "24/7 Security"],
      sortOrder: 1,
      agent: { name: "Murugan Kanda", role: "Founder & Principal Consultant", image: "murugan.png" }
    },
    {
      title: "Emerald Heights Apartment",
      location: "Adyar, Chennai",
      locationKey: "adyar",
      type: "apartment",
      price: 18000000,
      priceLabel: "₹1.80 Crores",
      beds: 3,
      baths: 3,
      sqft: 1850,
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80"
      ],
      description: "Nestled in the prime leafy avenue of Adyar, Chennai, this modern 3 BHK apartment combines urban connectivity with residential calm. Features modular Italian kitchen systems, Italian marble flooring, double-glazed soundproof balconies, and access to premium health club facilities inside the tower complex.",
      features: ["Italian Marble", "Modular Kitchen", "Gym Access", "Power Backup", "Covered Parking", "Water Treatment"],
      sortOrder: 2,
      agent: { name: "Murugan Kanda", role: "Founder & Principal Consultant", image: "murugan.png" }
    },
    {
      title: "Jungle View Estate",
      location: "Naidupuram, Kodaikanal",
      locationKey: "kodaikanal",
      type: "villa",
      price: 32000000,
      priceLabel: "₹3.20 Crores",
      beds: 3,
      baths: 3,
      sqft: 2500,
      images: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80"
      ],
      description: "An elegant stone-walled boutique villa in the mist-laden peaks of Kodaikanal. Boasts panoramic mountain views, functional wood fireplace chimneys, floor-to-ceiling glass walls, and a multi-level terrace garden. This property is highly sought-after both as a luxury vacation home and an active tourist home-stay investment.",
      features: ["Fireplace", "Mountain Vista", "Bespoke Stone Work", "Terrace Garden", "Wood Flooring", "Barbecue Zone"],
      sortOrder: 3,
      agent: { name: "Murugan Kanda", role: "Founder & Principal Consultant", image: "murugan.png" }
    },
    {
      title: "Kanda Commercial Plaza",
      location: "OMR, Chennai",
      locationKey: "omr",
      type: "commercial",
      price: 120000000,
      priceLabel: "₹12.00 Crores",
      beds: 0,
      baths: 6,
      sqft: 8500,
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80"
      ],
      description: "A prominent corporate building with prime visibility on Old Mahabalipuram Road (OMR), Chennai's IT Corridor. Features dynamic glass facades, high-speed elevators, centralized VRF air conditioning, and complete compliance with commercial building regulations. Fully leased out to high-credit multinational tenants, generating high immediate yields.",
      features: ["IT Corridor Frontage", "VRF Air Conditioning", "High-speed Lift", "100% DG Backup", "Fire Safety Systems", "Multi-car Parking"],
      sortOrder: 4,
      agent: { name: "Murugan Kanda", role: "Founder & Principal Consultant", image: "murugan.png" }
    },
    {
      title: "Serene Beachside Condo",
      location: "Mahabalipuram, Chennai",
      locationKey: "ecr",
      type: "apartment",
      price: 26000000,
      priceLabel: "₹2.60 Crores",
      beds: 2,
      baths: 2,
      sqft: 1400,
      images: [
        "https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
      ],
      description: "Wake up to the sounds of the ocean in this gorgeous, premium 2 BHK beach condo. Features a spacious sea-facing balcony, dynamic ventilation, open-concept lounge designs, luxury bathroom fixtures, and private pathways down to the sandy shores.",
      features: ["Direct Beach Access", "Sea Balcony", "Rooftop Lounge", "Gated Community", "Water Softener", "Fitness Club"],
      sortOrder: 5,
      agent: { name: "Murugan Kanda", role: "Founder & Principal Consultant", image: "murugan.png" }
    },
    {
      title: "Golden Crest Land Plot",
      location: "Saravanampatti, Coimbatore",
      locationKey: "coimbatore",
      type: "land",
      price: 9500000,
      priceLabel: "₹95.00 Lakhs",
      beds: 0,
      baths: 0,
      sqft: 2400,
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80"
      ],
      description: "A premium gated residential plot of 2400 square feet (1 Ground) located in the booming IT and educational hub of Saravanampatti, Coimbatore. DTCP approved, black-top roads, street lighting, compound walls, and individual drinking water pipelines are fully laid out and ready for construction.",
      features: ["DTCP Approved Layout", "Blacktop Roads", "Street Lighting", "24/7 Water Supply", "Compound Wall", "High Appreciation Zone"],
      sortOrder: 6,
      agent: { name: "Murugan Kanda", role: "Founder & Principal Consultant", image: "murugan.png" }
    }
  ];

  for (const prop of defaultProperties) {
    try {
      await addDoc(collection(db, "properties"), prop);
    } catch (e) {
      console.error("Error seeding property:", prop.title, e);
    }
  }
}

// ==========================================
// SEARCH FILTERS MANAGEMENT
// ==========================================

async function seedDefaultLocations() {
  const defaults = [
    { key: "ecr", label: "ECR" },
    { key: "adyar", label: "Adyar" },
    { key: "omr", label: "OMR" },
    { key: "kodaikanal", label: "Kodaikanal" },
    { key: "coimbatore", label: "Coimbatore" }
  ];
  for (const item of defaults) {
    await addDoc(collection(db, "locations"), item);
  }
}

async function seedDefaultTypes() {
  const defaults = [
    { key: "villa", label: "Villa" },
    { key: "apartment", label: "Apartment" },
    { key: "commercial", label: "Commercial" },
    { key: "land", label: "Premium Land" }
  ];
  for (const item of defaults) {
    await addDoc(collection(db, "types"), item);
  }
}

async function seedDefaultBudgets() {
  const defaults = [
    { value: 10000000, label: "₹1.00 Crore" },
    { value: 20000000, label: "₹2.00 Crores" },
    { value: 30000000, label: "₹3.00 Crores" },
    { value: 50000000, label: "₹5.00 Crores" },
    { value: 100000000, label: "₹10.00 Crores" }
  ];
  for (const item of defaults) {
    await addDoc(collection(db, "budgets"), item);
  }
}

function renderFiltersLists() {
  renderLocationsList();
  renderTypesList();
  renderBudgetsList();
}

function renderLocationsList() {
  const listContainer = document.getElementById("locations-list");
  if (!listContainer) return;
  listContainer.innerHTML = "";
  
  const items = databaseData.locations || [];
  if (items.length === 0) {
    listContainer.innerHTML = '<div class="no-data">No locations configured.</div>';
    return;
  }
  
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "filter-item-row";
    row.innerHTML = `
      <div class="filter-item-info">
        <span class="filter-item-label">${escapeHtml(item.label)}</span>
        <span class="filter-item-key">Key: ${escapeHtml(item.key)}</span>
      </div>
      <button class="action-btn action-delete-btn" onclick="deleteFilterItem('locations', '${item.id}')" title="Delete Location">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listContainer.appendChild(row);
  });
}

function renderTypesList() {
  const listContainer = document.getElementById("types-list");
  if (!listContainer) return;
  listContainer.innerHTML = "";
  
  const items = databaseData.types || [];
  if (items.length === 0) {
    listContainer.innerHTML = '<div class="no-data">No types configured.</div>';
    return;
  }
  
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "filter-item-row";
    row.innerHTML = `
      <div class="filter-item-info">
        <span class="filter-item-label">${escapeHtml(item.label)}</span>
        <span class="filter-item-key">Key: ${escapeHtml(item.key)}</span>
      </div>
      <button class="action-btn action-delete-btn" onclick="deleteFilterItem('types', '${item.id}')" title="Delete Type">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listContainer.appendChild(row);
  });
}

function renderBudgetsList() {
  const listContainer = document.getElementById("budgets-list");
  if (!listContainer) return;
  listContainer.innerHTML = "";
  
  const items = databaseData.budgets || [];
  if (items.length === 0) {
    listContainer.innerHTML = '<div class="no-data">No budgets configured.</div>';
    return;
  }
  
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "filter-item-row";
    row.innerHTML = `
      <div class="filter-item-info">
        <span class="filter-item-label">${escapeHtml(item.label)}</span>
        <span class="filter-item-key">Value: ${item.value}</span>
      </div>
      <button class="action-btn action-delete-btn" onclick="deleteFilterItem('budgets', '${item.id}')" title="Delete Budget">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    listContainer.appendChild(row);
  });
}

window.deleteFilterItem = async function(collectionName, id) {
  if (!confirm(`Are you sure you want to delete this option permanently?`)) {
    return;
  }
  
  if (id.startsWith('local-')) {
    let lsKey = '';
    if (collectionName === 'locations') lsKey = LS_LOCATIONS_KEY;
    else if (collectionName === 'types') lsKey = LS_TYPES_KEY;
    else if (collectionName === 'budgets') lsKey = LS_BUDGETS_KEY;
    
    if (lsKey) {
      const items = JSON.parse(localStorage.getItem(lsKey) || '[]');
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(lsKey, JSON.stringify(filtered));
      fetchDashboardData();
      return;
    }
  }

  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    fetchDashboardData();
  } catch (err) {
    console.warn("Firestore delete blocked. Deleting from local browser storage:", err);
    let lsKey = '';
    if (collectionName === 'locations') lsKey = LS_LOCATIONS_KEY;
    else if (collectionName === 'types') lsKey = LS_TYPES_KEY;
    else if (collectionName === 'budgets') lsKey = LS_BUDGETS_KEY;
    
    if (lsKey) {
      const items = JSON.parse(localStorage.getItem(lsKey) || '[]');
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(lsKey, JSON.stringify(filtered));
      fetchDashboardData();
      alert("Deleted from local browser storage (Firestore delete rules blocked server saving).");
    }
  }
};

function setupFilterManagementListeners() {
  const addLocationForm = document.getElementById("add-location-form");
  const addTypeForm = document.getElementById("add-type-form");
  const addBudgetForm = document.getElementById("add-budget-form");

  if (addLocationForm) {
    addLocationForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const labelInput = document.getElementById("new-loc-label");
      const keyInput = document.getElementById("new-loc-key");
      const label = labelInput.value.trim();
      const key = keyInput.value.trim().toLowerCase();

      try {
        await addDoc(collection(db, "locations"), { label, key });
        addLocationForm.reset();
        fetchDashboardData();
      } catch (err) {
        console.warn("Firestore write blocked. Saving to local browser storage:", err);
        const currentLocs = JSON.parse(localStorage.getItem(LS_LOCATIONS_KEY) || '[]');
        currentLocs.push({ id: `local-loc-${Date.now()}`, label, key });
        localStorage.setItem(LS_LOCATIONS_KEY, JSON.stringify(currentLocs));
        addLocationForm.reset();
        fetchDashboardData();
        alert("Saved to local browser storage (Firestore write rules blocked server saving).");
      }
    });
  }

  if (addTypeForm) {
    addTypeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const labelInput = document.getElementById("new-type-label");
      const keyInput = document.getElementById("new-type-key");
      const label = labelInput.value.trim();
      const key = keyInput.value.trim().toLowerCase();

      try {
        await addDoc(collection(db, "types"), { label, key });
        addTypeForm.reset();
        fetchDashboardData();
      } catch (err) {
        console.warn("Firestore write blocked. Saving to local browser storage:", err);
        const currentTypes = JSON.parse(localStorage.getItem(LS_TYPES_KEY) || '[]');
        currentTypes.push({ id: `local-type-${Date.now()}`, label, key });
        localStorage.setItem(LS_TYPES_KEY, JSON.stringify(currentTypes));
        addTypeForm.reset();
        fetchDashboardData();
        alert("Saved to local browser storage (Firestore write rules blocked server saving).");
      }
    });
  }

  if (addBudgetForm) {
    addBudgetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const labelInput = document.getElementById("new-budget-label");
      const valueInput = document.getElementById("new-budget-value");
      const label = labelInput.value.trim();
      const value = parseInt(valueInput.value);

      try {
        await addDoc(collection(db, "budgets"), { label, value });
        addBudgetForm.reset();
        fetchDashboardData();
      } catch (err) {
        console.warn("Firestore write blocked. Saving to local browser storage:", err);
        const currentBudgets = JSON.parse(localStorage.getItem(LS_BUDGETS_KEY) || '[]');
        currentBudgets.push({ id: `local-budget-${Date.now()}`, label, value });
        localStorage.setItem(LS_BUDGETS_KEY, JSON.stringify(currentBudgets));
        addBudgetForm.reset();
        fetchDashboardData();
        alert("Saved to local browser storage (Firestore write rules blocked server saving).");
      }
    });
  }
}

function populatePropertyFormSelects() {
  const propTypeSelect = document.getElementById("prop-type");
  const propLocationSelect = document.getElementById("prop-location-key");
  
  if (propTypeSelect) {
    const currentVal = propTypeSelect.value;
    
    propTypeSelect.innerHTML = `<option value="" disabled selected>Select Type</option>`;
    databaseData.types.forEach(type => {
      const opt = document.createElement("option");
      opt.value = type.key;
      opt.textContent = type.label;
      propTypeSelect.appendChild(opt);
    });
    
    if (currentVal && databaseData.types.some(t => t.key === currentVal)) {
      propTypeSelect.value = currentVal;
    }
  }
  
  if (propLocationSelect) {
    const currentVal = propLocationSelect.value;
    
    propLocationSelect.innerHTML = `<option value="" disabled selected>Select Location</option>`;
    databaseData.locations.forEach(loc => {
      const opt = document.createElement("option");
      opt.value = loc.key;
      opt.textContent = loc.label;
      propLocationSelect.appendChild(opt);
    });
    
    if (currentVal && databaseData.locations.some(l => l.key === currentVal)) {
      propLocationSelect.value = currentVal;
    }
  }
}
