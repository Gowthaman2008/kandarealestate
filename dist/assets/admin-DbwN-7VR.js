import{a as p,d as u}from"./firebase-config-Dmo4QcqY.js";import{query as b,collection as y,orderBy as m,getDocs as f,doc as I,updateDoc as q,deleteDoc as C}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";import{onAuthStateChanged as $,signInWithEmailAndPassword as S,signOut as B}from"https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";import"https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";let h=null,r={newsletter:[],inquiries:[],callbacks:[],stats:{}};document.addEventListener("DOMContentLoaded",()=>{w()});function w(){x(),D(),F(),N(),O()}function x(){$(p,t=>{t?(h=t,T()):(h=null,A())})}function D(){const t=document.getElementById("login-form"),n=document.getElementById("logout-btn");t&&t.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("username").value,l=document.getElementById("password").value,i=document.getElementById("auth-error-msg");i.style.display="none";try{await S(p,a.trim(),l)}catch(s){console.error("Firebase Login error:",s),i.textContent="Invalid email or password. Please verify your credentials.",i.style.display="block"}}),n&&n.addEventListener("click",async()=>{try{await B(p)}catch(e){console.error("Logout error:",e)}})}function A(){document.getElementById("auth-screen").style.display="flex",document.getElementById("dashboard-screen").style.display="none"}function T(){document.getElementById("auth-screen").style.display="none",document.getElementById("dashboard-screen").style.display="block",k()}async function k(){if(h)try{const t=b(y(u,"newsletter"),m("created_at","desc")),n=b(y(u,"inquiries"),m("created_at","desc")),e=b(y(u,"callbacks"),m("created_at","desc")),[a,l,i]=await Promise.all([f(t),f(n),f(e)]);r.newsletter=a.docs.map(s=>({id:s.id,...s.data()})),r.inquiries=l.docs.map(s=>({id:s.id,...s.data()})),r.callbacks=i.docs.map(s=>({id:s.id,...s.data()})),r.stats={totalSubscribers:r.newsletter.length,totalInquiries:r.inquiries.length,totalCallbacks:r.callbacks.length,pendingInquiries:r.inquiries.filter(s=>s.status==="Pending").length,pendingCallbacks:r.callbacks.filter(s=>s.status==="Pending").length},_(),M()}catch(t){console.error("Error fetching Firestore data:",t),alert("Failed to retrieve database entries. Verify your Firestore Security Rules allow read access.")}}function _(){const t=r.stats||{};document.getElementById("stat-subscribers").textContent=t.totalSubscribers||0,document.getElementById("stat-inquiries").textContent=t.totalInquiries||0,document.getElementById("stat-callbacks").textContent=t.totalCallbacks||0,document.getElementById("stat-pending").textContent=(t.pendingInquiries||0)+(t.pendingCallbacks||0)}function E(t){return t?new Date(t).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):""}function M(){P(),H(),R()}function P(){const t=document.getElementById("inquiries-body");if(!t)return;t.innerHTML="";const n=r.inquiries||[];if(n.length===0){t.innerHTML='<tr><td colspan="7" class="no-data">No contact inquiries found.</td></tr>';return}n.forEach(e=>{const a=document.createElement("tr");a.dataset.id=e.id;let l="badge-pending";e.status==="Contacted"&&(l="badge-contacted"),e.status==="Resolved"&&(l="badge-resolved"),a.innerHTML=`
      <td>${E(e.created_at)}</td>
      <td style="font-weight: 600;">${c(e.name)}</td>
      <td>
        <div><i class="fa-solid fa-envelope" style="color: #888; width: 16px;"></i> ${c(e.email)}</div>
        <div><i class="fa-solid fa-phone" style="color: #888; width: 16px;"></i> ${c(e.phone)}</div>
      </td>
      <td><span class="badge" style="background: rgba(83, 158, 64, 0.08); color: #356927;">${c(e.interest)}</span></td>
      <td style="max-width: 250px; font-size: 0.85rem; color: #555;" title="${c(e.message)}">${c(e.message)}</td>
      <td><span class="badge ${l}">${c(e.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-status-btn" onclick="updateLeadStatus('inquiry', '${e.id}', '${e.status}')" title="Change Status">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <button class="action-btn action-delete-btn" onclick="deleteLead('inquiry', '${e.id}')" title="Delete Inquiry">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `,t.appendChild(a)})}function H(){const t=document.getElementById("callbacks-body");if(!t)return;t.innerHTML="";const n=r.callbacks||[];if(n.length===0){t.innerHTML='<tr><td colspan="6" class="no-data">No callback requests found.</td></tr>';return}n.forEach(e=>{const a=document.createElement("tr");a.dataset.id=e.id;let l="badge-pending";e.status==="Contacted"&&(l="badge-contacted"),e.status==="Resolved"&&(l="badge-resolved"),a.innerHTML=`
      <td>${E(e.created_at)}</td>
      <td style="font-weight: 600;">${c(e.name)}</td>
      <td><i class="fa-solid fa-phone" style="color: #888; width: 16px;"></i> ${c(e.phone)}</td>
      <td>${e.property_title?`<span style="font-size: 0.85rem; font-weight: 500; color: #356927;"><i class="fa-solid fa-house-circle-check"></i> ${c(e.property_title)}</span>`:'<span style="color:#aaa; font-size:0.8rem;">General Callback</span>'}</td>
      <td><span class="badge ${l}">${c(e.status)}</span></td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-status-btn" onclick="updateLeadStatus('callback', '${e.id}', '${e.status}')" title="Change Status">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <button class="action-btn action-delete-btn" onclick="deleteLead('callback', '${e.id}')" title="Delete Request">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `,t.appendChild(a)})}function R(){const t=document.getElementById("newsletter-body");if(!t)return;t.innerHTML="";const n=r.newsletter||[];if(n.length===0){t.innerHTML='<tr><td colspan="3" class="no-data">No newsletter subscribers found.</td></tr>';return}n.forEach(e=>{const a=document.createElement("tr");a.dataset.id=e.id,a.innerHTML=`
      <td>${E(e.created_at)}</td>
      <td style="font-weight: 600;">${c(e.email)}</td>
      <td>
        <div class="row-actions">
          <button class="action-btn action-delete-btn" onclick="deleteLead('newsletter', '${e.id}')" title="Delete Subscriber">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `,t.appendChild(a)})}window.updateLeadStatus=async function(t,n,e){let a="Pending";e==="Pending"?a="Contacted":e==="Contacted"?a="Resolved":e==="Resolved"&&(a="Pending");const l=t==="inquiry"?"inquiries":"callbacks";try{const i=I(u,l,n);await q(i,{status:a}),k()}catch(i){console.error("Error updating Firestore status:",i),alert("Failed to update status.")}};window.deleteLead=async function(t,n){if(!confirm(`Are you sure you want to delete this ${t} record permanently?`))return;let e="";if(t==="newsletter")e="newsletter";else if(t==="inquiry")e="inquiries";else if(t==="callback")e="callbacks";else return;try{const a=I(u,e,n);await C(a),k()}catch(a){console.error("Error deleting Firestore record:",a),alert("Failed to delete record.")}};function F(){const t=document.querySelectorAll(".tab-trigger");t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(a=>a.classList.remove("active")),document.querySelectorAll(".tab-pane").forEach(a=>a.classList.remove("active")),n.classList.add("active");const e=n.getAttribute("data-target");document.getElementById(e).classList.add("active")})})}function N(){document.querySelectorAll(".table-search").forEach(n=>{n.addEventListener("input",e=>{const a=e.target.value.toLowerCase(),l=e.target.getAttribute("data-table"),i=document.getElementById(l);if(!i)return;i.querySelectorAll("tbody tr").forEach(o=>{if(o.classList.contains("no-data"))return;o.innerText.toLowerCase().includes(a)?o.style.display="":o.style.display="none"})})})}function O(){document.getElementById("export-inquiries").addEventListener("click",()=>{g("inquiries",[{key:"created_at",label:"Date"},{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},{key:"interest",label:"Interest"},{key:"message",label:"Message"},{key:"status",label:"Status"}])}),document.getElementById("export-callbacks").addEventListener("click",()=>{g("callbacks",[{key:"created_at",label:"Date"},{key:"name",label:"Name"},{key:"phone",label:"Phone"},{key:"property_title",label:"Property Title"},{key:"status",label:"Status"}])}),document.getElementById("export-newsletter").addEventListener("click",()=>{g("newsletter",[{key:"created_at",label:"Date Subscribed"},{key:"email",label:"Email Address"}])})}function g(t,n){const e=r[t]||[];if(e.length===0){alert("No data to export.");return}let a=n.map(o=>`"${o.label}"`).join(",")+`
`;e.forEach(o=>{const v=n.map(L=>{let d=o[L.key]||"";return L.key==="created_at"&&(d=new Date(d).toLocaleString("en-IN")),d=d.toString().replace(/"/g,'""'),`"${d}"`}).join(",");a+=v+`
`});const l=new Blob([a],{type:"text/csv;charset=utf-8;"}),i=URL.createObjectURL(l),s=document.createElement("a");s.setAttribute("href",i),s.setAttribute("download",`kanda_${t}_export_${new Date().toISOString().slice(0,10)}.csv`),s.style.visibility="hidden",document.body.appendChild(s),s.click(),document.body.removeChild(s)}function c(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}
