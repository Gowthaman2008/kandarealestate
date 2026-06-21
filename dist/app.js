import { db } from "./firebase-config.js";
import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// properties-data.js (inlined for zero configuration build)
const propertiesData = [
  {
    id: 1,
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
    agent: {
      name: "Murugan Kanda",
      role: "Founder & Principal Consultant",
      image: "murugan.png"
    }
  },
  {
    id: 2,
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
    agent: {
      name: "Murugan Kanda",
      role: "Founder & Principal Consultant",
      image: "murugan.png"
    }
  },
  {
    id: 3,
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
    agent: {
      name: "Murugan Kanda",
      role: "Founder & Principal Consultant",
      image: "murugan.png"
    }
  },
  {
    id: 4,
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
    agent: {
      name: "Murugan Kanda",
      role: "Founder & Principal Consultant",
      image: "murugan.png"
    }
  },
  {
    id: 5,
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
    agent: {
      name: "Murugan Kanda",
      role: "Founder & Principal Consultant",
      image: "murugan.png"
    }
  },
  {
    id: 6,
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
    agent: {
      name: "Murugan Kanda",
      role: "Founder & Principal Consultant",
      image: "murugan.png"
    }
  }
];

// Initialize variables
let currentModalProperty = null;
let currentModalImageIndex = 0;
let activeProperties = [];

async function fetchPropertiesFromFirestore() {
  try {
    const q = query(collection(db, "properties"), orderBy("sortOrder", "asc"));
    const querySnapshot = await getDocs(q);
    let list = [];
    querySnapshot.forEach((doc) => {
      if (doc.id !== "--filters-config--") {
        list.push({ id: doc.id, ...doc.data() });
      }
    });
    
    if (list.length === 0) {
      console.log("No properties found in Firestore. Using local fallback.");
      return propertiesData;
    }
    return list;
  } catch (error) {
    console.error("Error loading properties from Firestore:", error);
    return propertiesData;
  }
}

// Wait for DOM to load
async function initApp() {
  initHeaderScroll();
  initMobileMenu();
  
  activeProperties = await fetchPropertiesFromFirestore();
  
  const filters = await fetchFiltersFromFirestore();
  populateFrontendFilters(filters);
  
  renderPropertiesList(activeProperties);
  initPropertyFilters();
  initFAQAccordion();
  initTestimonialSlider();
  initLeafletMapWithRetry();
  initContactForm();
  initModalListeners();
  initScrollReveal();
  initPremiumCardTilt();
  initStatsCounter();
  initBackToTop();
  initHeroCanvas();
  initCustomCursor();
  initMagneticElements();
}

function initLeafletMapWithRetry(retries = 0) {
  if (typeof L !== 'undefined') {
    try {
      initLeafletMap();
    } catch (error) {
      console.error("Leaflet map initialization failed:", error);
    }
  } else if (retries < 20) {
    setTimeout(() => {
      initLeafletMapWithRetry(retries + 1);
    }, 100);
  } else {
    console.warn("Leaflet library failed to load in time. Map could not be loaded.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// 1. Header scroll tracking
function initHeaderScroll() {
  const header = document.getElementById("header");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  if (!header) return;

  window.addEventListener("scroll", () => {
    // Scroll styling
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll spy navigation highlighting
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const scrollPos = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
      if (scrollPos >= (sectionTop - 120)) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}

// 2. Mobile Burger Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu .nav-link");

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    document.body.classList.toggle("nav-menu-active-body");
    const icon = toggleBtn.querySelector("i");
    if (icon) {
      if (navMenu.classList.contains("active")) {
        icon.className = "fa-solid fa-xmark";
        document.body.style.overflow = "hidden"; // Freeze background scrolling
      } else {
        icon.className = "fa-solid fa-bars-staggered";
        document.body.style.overflow = ""; // Unfreeze background scrolling
      }
    }
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
      document.body.classList.remove("nav-menu-active-body");
      document.body.style.overflow = "";
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-bars-staggered";
      }
    });
  });
}



let slideshowIntervalId = null;

function startPropertyCardsSlideshow() {
  if (slideshowIntervalId) {
    clearInterval(slideshowIntervalId);
  }

  slideshowIntervalId = setInterval(() => {
    const cards = document.querySelectorAll(".property-card");
    cards.forEach(card => {
      const img = card.querySelector(".property-img");
      if (!img) return;

      const imagesStr = card.getAttribute("data-images");
      if (!imagesStr) return;

      try {
        const images = JSON.parse(imagesStr);
        if (!images || images.length <= 1) return;

        let currentIndex = parseInt(card.getAttribute("data-current-image-index") || "0");
        const nextIndex = (currentIndex + 1) % images.length;

        // Fade out
        img.style.opacity = "0";

        // Wait for transition, swap source, fade back in
        setTimeout(() => {
          img.src = images[nextIndex];
          card.setAttribute("data-current-image-index", nextIndex.toString());
          img.style.opacity = "1";
        }, 400); // matches the 0.4s transition duration

      } catch (err) {
        console.error("Error in property card slideshow:", err);
      }
    });
  }, 4000); // change image every 4 seconds
}

// 4. Render property cards to HTML Grid
function renderPropertiesList(properties) {
  const grid = document.getElementById("properties-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (properties.length === 0) {
    grid.innerHTML = `
      <div class="no-properties-message">
        <i class="fa-solid fa-house-chimney-crack" style="font-size: 3rem; color: var(--gold-primary); margin-bottom: 20px; display: block;"></i>
        <h3>No matching properties found</h3>
        <p>Try clearing some filters or searching for alternative budgets.</p>
      </div>
    `;
    return;
  }

  properties.forEach(prop => {
    const card = document.createElement("div");
    card.className = "property-card";
    
    // Store images as data attribute for slideshow cycle
    card.setAttribute("data-images", JSON.stringify(prop.images || []));
    card.setAttribute("data-current-image-index", "0");
    
    // Icon selections based on type
    const typeLabel = prop.type.charAt(0).toUpperCase() + prop.type.slice(1);
    
    // Specs content depending on type (land plots do not have beds/baths)
    let specsHtml = "";
    if (prop.type === "land") {
      specsHtml = `
        <div class="prop-spec"><i class="fa-solid fa-ruler-combined"></i> ${prop.sqft} Sq.Ft</div>
        <div class="prop-spec"><i class="fa-solid fa-circle-check"></i> Approved Plot</div>
      `;
    } else if (prop.type === "commercial") {
      specsHtml = `
        <div class="prop-spec"><i class="fa-solid fa-ruler-combined"></i> ${prop.sqft} Sq.Ft</div>
        <div class="prop-spec"><i class="fa-solid fa-restroom"></i> ${prop.baths} Toilets</div>
      `;
    } else {
      specsHtml = `
        <div class="prop-spec"><i class="fa-solid fa-bed"></i> ${prop.beds} Beds</div>
        <div class="prop-spec"><i class="fa-solid fa-bath"></i> ${prop.baths} Baths</div>
        <div class="prop-spec"><i class="fa-solid fa-ruler-combined"></i> ${prop.sqft} Sq.Ft</div>
      `;
    }

    card.innerHTML = `
      <div class="property-img-wrapper">
        <div class="property-badge">${typeLabel}</div>
        <img src="${prop.images && prop.images.length > 0 ? prop.images[0] : ''}" alt="${prop.title}" class="property-img" loading="lazy" style="transition: transform var(--transition-medium), opacity 0.4s ease-in-out; opacity: 1;">
        <div class="property-price">${prop.priceLabel}</div>
      </div>
      <div class="property-body">
        <h3 class="property-title">${prop.title}</h3>
        <div class="property-location">
          <i class="fa-solid fa-location-dot"></i>
          <span>${prop.location}</span>
        </div>
        <div class="property-details">
          ${specsHtml}
        </div>
        <div class="property-footer">
          <button class="btn btn-outline view-details-btn" data-id="${prop.id}">
            View Details <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    // Click handler for modal details
    card.querySelector(".view-details-btn").addEventListener("click", () => {
      openPropertyModal(prop.id);
    });

    grid.appendChild(card);
  });

  // Re-run card tilt and spotlight coordinates configuration on new elements
  initPremiumCardTilt();
  
  // Start dynamic slideshow for multi-image property cards
  startPropertyCardsSlideshow();
}

// 5. Property Filtering Actions
function initPropertyFilters() {
  const filterLoc = document.getElementById("filter-location");
  const filterType = document.getElementById("filter-type");
  const filterPrice = document.getElementById("filter-price");

  if (!filterLoc || !filterType || !filterPrice) return;

  // Filter triggers
  const executeFilters = () => {
    const loc = filterLoc.value;
    const type = filterType.value;
    const price = filterPrice.value;

    const filtered = activeProperties.filter(prop => {
      const locMatch = loc === "all" || prop.locationKey === loc;
      const typeMatch = type === "all" || prop.type === type;
      
      let priceMatch = true;
      if (price !== "all") {
        priceMatch = prop.price <= parseInt(price);
      }

      return locMatch && typeMatch && priceMatch;
    });

    renderPropertiesList(filtered);
  };

  filterLoc.addEventListener("change", executeFilters);
  filterType.addEventListener("change", executeFilters);
  filterPrice.addEventListener("change", executeFilters);
}

// 6. Testimonials Slider logic
function initTestimonialSlider() {
  const track = document.getElementById("testimonials-track");
  const dots = document.querySelectorAll(".test-nav-dot");
  if (!track || !dots.length) return;
  let activeIndex = 0;
  let autoplayInterval;

  const updateSlider = (index) => {
    if (index >= dots.length || index < 0) return;
    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");
    track.style.transform = `translateX(-${index * 100}%)`;
    activeIndex = index;
  };

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-index"));
      updateSlider(idx);
      resetAutoplay();
    });
  });

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      let next = (activeIndex + 1) % dots.length;
      updateSlider(next);
    }, 6000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };

  startAutoplay();
}

// 7. Interactive Leaflet Map Configuration
function initLeafletMap() {
  // Office coordinates: 406, Salem Main Rd, Komarapalayam, Tamil Nadu [11.441049390242902, 77.69246379092237]
  const officeCoords = [11.441049390242902, 77.69246379092237];
  
  const map = L.map('leaflet-map', {
    scrollWheelZoom: true
  }).setView(officeCoords, 17);

  // Google Maps Roadmap tile layer (shows detailed street names, shops, and POIs exactly like Google Maps)
  L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
    className: 'map-tiles-dark'
  }).addTo(map);

  // Customize leaflet marker icon with golden marker styling (larger 20px size for visibility)
  const goldenIcon = L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: var(--gold-primary);
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 12px var(--gold-primary);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Add marker with popup
  const marker = L.marker(officeCoords, { icon: goldenIcon }).addTo(map);
  marker.bindPopup(`
    <a href="https://maps.app.goo.gl/C8Ryoi6b7k2HohfY9?g_st=ac" target="_blank" rel="noopener" style="text-decoration: none; color: inherit; display: block;">
      <div style="text-align: center; font-family: 'Outfit', sans-serif; cursor: pointer;">
        <strong style="color: var(--gold-primary); font-size: 1.1rem; display: block; margin-bottom: 4px;">Kanda Real Estate</strong>
        <p style="margin: 0; font-size: 0.85rem; color: var(--text-light); margin-bottom: 6px;">406, Salem Main Rd, Komarapalayam</p>
        <span style="font-size: 0.75rem; color: var(--gold-primary); text-decoration: underline; font-weight: 500;">Get Directions <i class="fa-solid fa-diamond-turn-right" style="margin-left: 2px;"></i></span>
      </div>
    </a>
  `).openPopup();

  // Draw circle around office representing immediate service coverage area (200m for zoom level 17 compatibility)
  L.circle(officeCoords, {
    color: 'var(--gold-primary)',
    fillColor: 'var(--primary-light)',
    fillOpacity: 0.12,
    radius: 200 // 200 meters
  }).addTo(map);
}

// 8. Contact Forms Verification
function initContactForm() {
  const form = document.getElementById("contact-form");
  const successFeedback = document.getElementById("form-success-feedback");

  if (form && successFeedback) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const fields = form.querySelectorAll(".form-control[required]");
      let isValid = true;

      fields.forEach(field => {
        const grp = field.closest(".form-group");
        if (!grp) return;
        
        // Simple verification check
        if (field.value.trim() === "") {
          grp.classList.add("has-error");
          isValid = false;
        } else if (field.type === "email" && !validateEmail(field.value)) {
          grp.classList.add("has-error");
          isValid = false;
        } else {
          grp.classList.remove("has-error");
        }

        // Live change listener to remove errors
        field.addEventListener("input", () => {
          if (field.value.trim() !== "") {
            grp.classList.remove("has-error");
          }
        });
      });

      if (isValid) {
        const nameVal = document.getElementById("form-name").value;
        const emailVal = document.getElementById("form-email").value;
        const phoneVal = document.getElementById("form-phone").value;
        const interestVal = document.getElementById("form-interest").value;
        const messageVal = document.getElementById("form-message").value;

        addDoc(collection(db, "inquiries"), {
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          interest: interestVal,
          message: messageVal,
          status: "Pending",
          created_at: new Date().toISOString()
        })
        .then(() => {
          // Hide form & show glassmorphic feedback block on success
          form.style.display = "none";
          successFeedback.style.display = "block";
          successFeedback.scrollIntoView({ behavior: "smooth", block: "center" });
        })
        .catch(err => {
          console.error("Firestore inquiry error:", err);
          showToast("Something went wrong. Please try again.", "error");
        });
      }
    });
  }

  // Footer Newsletter form
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterFeedback = document.getElementById("newsletter-feedback");

  if (newsletterForm && newsletterFeedback) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletter-email");
      if (!email) return;
      if (validateEmail(email.value)) {
        const emailVal = email.value;
        const emailLower = emailVal.trim().toLowerCase();
        
        // Query to check for existing email
        const newsletterQuery = query(collection(db, "newsletter"), where("email", "==", emailLower));
        getDocs(newsletterQuery)
        .then(querySnapshot => {
          if (!querySnapshot.empty) {
            newsletterFeedback.className = "newsletter-feedback success";
            newsletterFeedback.textContent = "Already subscribed!";
            email.value = "";
            setTimeout(() => {
              newsletterFeedback.className = "newsletter-feedback";
            }, 5000);
          } else {
            addDoc(collection(db, "newsletter"), {
              email: emailLower,
              created_at: new Date().toISOString()
            })
            .then(() => {
              newsletterFeedback.className = "newsletter-feedback success";
              newsletterFeedback.textContent = "Subscribed successfully!";
              email.value = "";
              setTimeout(() => {
                newsletterFeedback.className = "newsletter-feedback";
              }, 5000);
            })
            .catch(err => {
              console.error("Firestore newsletter error:", err);
              email.style.borderColor = "var(--red)";
            });
          }
        })
        .catch(err => {
          console.error("Firestore query error:", err);
          email.style.borderColor = "var(--red)";
        });
      } else {
        email.style.borderColor = "var(--red)";
        email.addEventListener("input", () => {
          email.style.borderColor = "";
        });
      }
    });
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// 9. FAQ Accordions toggle action
function initFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector(".faq-question-btn");
    const wrapper = item.querySelector(".faq-answer-wrapper");
    const content = item.querySelector(".faq-answer-content");

    if (!btn || !wrapper || !content) return;

    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      
      // Close all other FAQs
      faqItems.forEach(otherItem => {
        otherItem.classList.remove("active");
        const otherWrapper = otherItem.querySelector(".faq-answer-wrapper");
        if (otherWrapper) {
          otherWrapper.style.maxHeight = "0px";
        }
      });

      if (!isActive) {
        item.classList.add("active");
        wrapper.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

// 10. Property Modal details open / close handlers
function initModalListeners() {
  const modal = document.getElementById("property-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const prevBtn = document.getElementById("modal-prev-btn");
  const nextBtn = document.getElementById("modal-next-btn");
  const agentForm = document.getElementById("modal-agent-form");

  if (!modal || !closeBtn || !prevBtn || !nextBtn || !agentForm) return;

  // Close modal click
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Nav gallery buttons
  prevBtn.addEventListener("click", () => {
    navigateModalGallery(-1);
  });
  nextBtn.addEventListener("click", () => {
    navigateModalGallery(1);
  });

  // Escape key to close modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Modal Agent form submit
  agentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("modal-form-name");
    const phone = document.getElementById("modal-form-phone");
    const propertyTitle = currentModalProperty ? currentModalProperty.title : null;

    if (name.value.trim() !== "" && phone.value.trim() !== "") {
      addDoc(collection(db, "callbacks"), {
        name: name.value,
        phone: phone.value,
        property_title: propertyTitle,
        status: "Pending",
        created_at: new Date().toISOString()
      })
      .then(() => {
        agentForm.innerHTML = `
          <div style="text-align: center; color: var(--gold-primary); font-family: var(--font-headings); font-weight: 600; padding: 10px 0;">
            <i class="fa-solid fa-circle-check" style="font-size: 1.5rem; display: block; margin-bottom: 6px;"></i>
            Callback Scheduled!
          </div>
        `;
      })
      .catch(err => {
        console.error("Firestore callback error:", err);
        showToast("Failed to schedule callback. Please try again.", "error");
      });
    }
  });
}

function openPropertyModal(id) {
  const prop = activeProperties.find(p => p.id === id);
  if (!prop) return;

  currentModalProperty = prop;
  currentModalImageIndex = 0;

  // Fill in modal values
  document.getElementById("modal-title").textContent = prop.title;
  document.getElementById("modal-location").textContent = prop.location;
  document.getElementById("modal-price").textContent = prop.priceLabel;
  document.getElementById("modal-description-text").textContent = prop.description;
  
  // Specific stats mapping
  if (prop.type === "land") {
    document.getElementById("modal-beds").parentElement.style.display = "none";
    document.getElementById("modal-baths").parentElement.style.display = "none";
    document.getElementById("modal-status").textContent = "DTCP Approved";
  } else if (prop.type === "commercial") {
    document.getElementById("modal-beds").parentElement.style.display = "none";
    document.getElementById("modal-baths").textContent = prop.baths;
    document.getElementById("modal-beds").parentElement.querySelector("span").textContent = "Baths";
    document.getElementById("modal-status").textContent = "Leased";
  } else {
    document.getElementById("modal-beds").parentElement.style.display = "flex";
    document.getElementById("modal-baths").parentElement.style.display = "flex";
    document.getElementById("modal-beds").textContent = prop.beds;
    document.getElementById("modal-baths").textContent = prop.baths;
    document.getElementById("modal-status").textContent = "Ready to Move";
  }
  document.getElementById("modal-sqft").textContent = prop.sqft + " Sq.Ft";

  // Fill amenities/features list
  const featList = document.getElementById("modal-features-list");
  featList.innerHTML = "";
  prop.features.forEach(feat => {
    const li = document.createElement("div");
    li.className = "modal-feature-item";
    li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${feat}`;
    featList.appendChild(li);
  });

  // Fill Agent details
  document.getElementById("modal-agent-img").src = prop.agent.image;
  document.getElementById("modal-agent-name").textContent = prop.agent.name;
  document.getElementById("modal-agent-role").textContent = prop.agent.role;

  // Restore Agent Form state in case it was submitted before
  document.getElementById("modal-agent-form").innerHTML = `
    <div class="form-group">
      <input type="text" id="modal-form-name" class="form-control" placeholder="Your Name" required>
    </div>
    <div class="form-group">
      <input type="tel" id="modal-form-phone" class="form-control" placeholder="Your Phone Number" required>
    </div>
    <button type="submit" class="btn btn-primary">Request Instant Callback</button>
  `;

  // Init Modal Gallery Images
  updateModalGallery();

  // Show Modal
  const modal = document.getElementById("property-modal");
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent body scroll
}

function closeModal() {
  const modal = document.getElementById("property-modal");
  modal.classList.remove("active");
  document.body.style.overflow = ""; // Enable body scroll
}

function updateModalGallery() {
  const prop = currentModalProperty;
  const imgElement = document.getElementById("modal-gallery-img");
  imgElement.src = prop.images[currentModalImageIndex];

  // Render index navigation dots
  const dotsContainer = document.getElementById("modal-dots-container");
  dotsContainer.innerHTML = "";
  
  prop.images.forEach((img, idx) => {
    const dot = document.createElement("div");
    dot.className = `modal-dot ${idx === currentModalImageIndex ? 'active' : ''}`;
    dot.addEventListener("click", () => {
      currentModalImageIndex = idx;
      updateModalGallery();
    });
    dotsContainer.appendChild(dot);
  });
}

function navigateModalGallery(direction) {
  const prop = currentModalProperty;
  if (!prop) return;

  currentModalImageIndex = (currentModalImageIndex + direction + prop.images.length) % prop.images.length;
  updateModalGallery();
}

function initScrollReveal() {
  // Observe containers to stagger children slide-ins
  const containers = document.querySelectorAll('.properties-grid, .services-grid, .team-grid, .leadership-contact-grid, .faq-grid, .about-stats');
  
  const containerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.property-card, .service-card, .team-card, .leadership-contact-card, .faq-item, .stat-item');
        children.forEach((child, index) => {
          child.style.setProperty('--i', index);
          setTimeout(() => {
            child.classList.remove('reveal-hidden');
            child.classList.add('reveal-visible');
          }, index * 80); // Stagger cards by 80ms each
        });
        containerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  containers.forEach(container => {
    const children = container.querySelectorAll('.property-card, .service-card, .team-card, .leadership-contact-card, .faq-item, .stat-item');
    children.forEach(child => {
      child.classList.add('reveal-hidden');
    });
    containerObserver.observe(container);
  });

  // Observe block level sections (headers, text blocks, image wrappers, map wrappers)
  const singleElements = document.querySelectorAll('.section-header, .about-content, .about-image-wrapper, .location-info-card, .contact-sidebar, .contact-form-wrapper, .quick-search');
  
  const singleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-hidden');
        entry.target.classList.add('reveal-visible');
        singleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  singleElements.forEach(el => {
    el.classList.add('reveal-hidden');
    singleObserver.observe(el);
  });
}

function initPremiumCardTilt() {
  const cards = document.querySelectorAll('.property-card:not([data-tilt-applied]), .service-card:not([data-tilt-applied]), .team-card:not([data-tilt-applied]), .location-info-card:not([data-tilt-applied]), .leadership-contact-card:not([data-tilt-applied])');
  
  cards.forEach(card => {
    // Mark as tilt applied so we never duplicate event listeners on re-runs
    card.setAttribute('data-tilt-applied', 'true');
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Update spotlight position variables
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

function initStatsCounter() {
  const stats = [
    { id: 'stat-sold', target: 850, suffix: '+' },
    { id: 'stat-clients', target: 1200, suffix: '', format: (val) => (val / 1000).toFixed(1) + 'k' },
    { id: 'stat-locations', target: 15, suffix: '+' }
  ];
  
  const countUp = (el, target, suffix, format) => {
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const currentVal = Math.floor(easeProgress * target);
      
      el.textContent = format ? format(currentVal) : currentVal + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = format ? format(target) : target + suffix;
      }
    };
    requestAnimationFrame(animate);
  };
  
  const targetEl = document.querySelector('.about-stats');
  if (!targetEl) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        stats.forEach(item => {
          const el = document.getElementById(item.id);
          if (el) {
            countUp(el, item.target, item.suffix, item.format);
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  observer.observe(targetEl);
}

function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  });
  
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* 5. Canvas Floating Particle Net in Hero Banner */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let animationFrameId;
  let width = canvas.width = canvas.offsetWidth;
  let height = canvas.height = canvas.offsetHeight;
  
  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });
  
  const particles = [];
  const maxParticles = Math.min(Math.floor((width * height) / 16000), 50); // Balanced particle density
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 1;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(83, 158, 64, 0.28)';
      ctx.fill();
    }
  }
  
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }
  
  let mouse = { x: null, y: null, radius: 140 };
  const hero = document.getElementById('home');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    
    hero.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();
      
      // Magnetic cursor repulsion warp
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 0.7;
          p.y += (dy / dist) * force * 0.7;
        }
      }
      
      p.draw();
      
      // Node connections lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(83, 158, 64, ${0.12 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      
      // Connect cursor to nodes
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius - 10) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(83, 158, 64, ${0.2 * (1 - dist / mouse.radius)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    
    animationFrameId = requestAnimationFrame(animate);
  }
  
  // Pause the canvas loop completely when hero is out of view (saves scroll energy)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate();
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    });
  }, { threshold: 0.01 });
  
  observer.observe(hero);
}

/* 6. Custom Mouse Follower Cursor */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');
  if (!dot || !follower) return;

  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    dot.style.opacity = '1';
    follower.style.opacity = '1';
    
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function updateFollower() {
    const lerpSpeed = 0.15;
    followerX += (mouseX - followerX) * lerpSpeed;
    followerY += (mouseY - followerY) * lerpSpeed;

    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;

    requestAnimationFrame(updateFollower);
  }
  requestAnimationFrame(updateFollower);

  const activeSelectors = 'a, button, select, input, textarea, .faq-question-btn, .test-nav-dot';
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(activeSelectors);
    if (target) {
      document.body.classList.add('cursor-active');
    }
    
    const propCard = e.target.closest('.property-card');
    if (propCard && !e.target.closest('button')) {
      document.body.classList.add('cursor-view-mode');
    } else {
      document.body.classList.remove('cursor-view-mode');
    }

    const testimonials = e.target.closest('.testimonials-slider-container');
    if (testimonials) {
      document.body.classList.add('cursor-drag-mode');
    } else {
      document.body.classList.remove('cursor-drag-mode');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(activeSelectors);
    if (target) {
      document.body.classList.remove('cursor-active');
    }
    
    const propCard = e.target.closest('.property-card');
    if (propCard) {
      document.body.classList.remove('cursor-view-mode');
    }

    const testimonials = e.target.closest('.testimonials-slider-container');
    if (testimonials) {
      document.body.classList.remove('cursor-drag-mode');
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    follower.style.opacity = '0';
  });
}

/* 7. Magnetic Pull Element Animations */
function initMagneticElements() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  
  const magnets = document.querySelectorAll('.btn, .header-phone-link, .social-circle, .back-to-top-btn');
  
  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull element by 35% offset distance
      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px) scale(1.02)`;
      btn.style.transition = 'transform 0.1s ease';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}

// ==========================================
// DYNAMIC FRONTEND SEARCH FILTERS
// ==========================================

const LS_LOCATIONS_KEY = 'kanda_custom_locations';
const LS_TYPES_KEY = 'kanda_custom_types';
const LS_BUDGETS_KEY = 'kanda_custom_budgets';

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

async function fetchFiltersFromFirestore() {
  try {
    const filtersDocRef = doc(db, "properties", "--filters-config--");
    const filtersDocSnap = await getDoc(filtersDocRef).catch(err => {
      console.warn("Failed fetching shared filters config:", err);
      return null;
    });

    if (filtersDocSnap && filtersDocSnap.exists()) {
      const data = filtersDocSnap.data();
      // Mirror to local storage for offline / quick reference
      localStorage.setItem(LS_LOCATIONS_KEY, JSON.stringify(data.locations || []));
      localStorage.setItem(LS_TYPES_KEY, JSON.stringify(data.types || []));
      localStorage.setItem(LS_BUDGETS_KEY, JSON.stringify(data.budgets || []));
      return {
        locations: data.locations || [],
        types: data.types || [],
        budgets: data.budgets || []
      };
    }
    return { locations: [], types: [], budgets: [] };
  } catch (error) {
    console.error("Error loading filters from Firestore:", error);
    return { locations: [], types: [], budgets: [] };
  }
}

function populateFrontendFilters(filters) {
  const filterLoc = document.getElementById("filter-location");
  const filterType = document.getElementById("filter-type");
  const filterPrice = document.getElementById("filter-price");

  // Read from LocalStorage if Firestore is empty, else use fallback constants
  let localLocs = [];
  let localTypes = [];
  let localBudgets = [];
  try {
    localLocs = JSON.parse(localStorage.getItem(LS_LOCATIONS_KEY) || '[]');
    localTypes = JSON.parse(localStorage.getItem(LS_TYPES_KEY) || '[]');
    localBudgets = JSON.parse(localStorage.getItem(LS_BUDGETS_KEY) || '[]');
  } catch (e) {
    console.error("Failed to parse local storage filters:", e);
  }

  const locations = filters.locations && filters.locations.length > 0 
    ? filters.locations 
    : (localLocs.length > 0 ? localLocs : fallbackLocations);

  const types = filters.types && filters.types.length > 0 
    ? filters.types 
    : (localTypes.length > 0 ? localTypes : fallbackTypes);

  const budgets = filters.budgets && filters.budgets.length > 0 
    ? filters.budgets 
    : (localBudgets.length > 0 ? localBudgets : fallbackBudgets);

  if (filterLoc) {
    filterLoc.innerHTML = `<option value="all">All Locations</option>`;
    locations.forEach(loc => {
      const opt = document.createElement("option");
      opt.value = loc.key;
      opt.textContent = loc.label;
      filterLoc.appendChild(opt);
    });
  }

  if (filterType) {
    filterType.innerHTML = `<option value="all">All Types</option>`;
    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.key;
      opt.textContent = t.label;
      filterType.appendChild(opt);
    });
  }

  if (filterPrice) {
    filterPrice.innerHTML = `<option value="all">Any Budget</option>`;
    budgets.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.value;
      opt.textContent = b.label;
      filterPrice.appendChild(opt);
    });
  }
}

// Custom Toast/Notification Function
window.showToast = function(message, type = 'success') {
  const toast = document.getElementById('custom-toast');
  const msgEl = document.getElementById('custom-toast-message');
  const iconEl = document.getElementById('custom-toast-icon');
  
  if (!toast || !msgEl || !iconEl) return;
  
  msgEl.textContent = message;
  if (type === 'error') {
    toast.style.borderLeftColor = '#e74c3c';
    iconEl.className = 'fa-solid fa-circle-exclamation';
    iconEl.style.color = '#e74c3c';
  } else {
    toast.style.borderLeftColor = '#539e40';
    iconEl.className = 'fa-solid fa-circle-check';
    iconEl.style.color = '#539e40';
  }
  
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  
  setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 4000);
};


