/**
 * Heritage Archive – SEG3125 Lab 7
 * Single-page app with hash routing, document display, and comments
 */

const CONFIG_URL = './data/config.json';
const STORAGE_KEY = 'heritage-archive-comments';

// Fallback when config.json can't be loaded (e.g. file:// protocol)
const FALLBACK_DOCUMENTS = [
  { id: 'theBattle', slug: 'the-battle', title: '29th Infantry Battalion at Vimy Ridge', subtitle: 'Battle of Vimy Ridge, 1917', image: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/theBattle/image.png', audio: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/theBattle/audiobook.mp3', data: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/theBattle/data.json', museum: 'Canadian War Museum' },
  { id: 'theDevil', slug: 'the-devil', title: 'The Devil (Taro Series XV)', subtitle: 'Maxwell Bates, 1969', image: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/theDevil/image.png', audio: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/theDevil/audiobook.mp3', data: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/theDevil/data.json', museum: 'Ottawa Art Gallery' },
  { id: 'thePianist', slug: 'the-pianist', title: 'The Pianist', subtitle: 'Liubov Popova, 1915', image: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/thePianist/image.png', audio: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/thePianist/audiobook.mp3', data: 'https://raw.githubusercontent.com/SEG3125-2026/seg3125-lab-7-team-16/main/documents/thePianist/data.json', museum: 'National Gallery of Canada' }
];

let documents = [];

// Initialize app
async function init() {
  try {
    const res = await fetch(CONFIG_URL);
    const data = await res.json();
    documents = data.documents || FALLBACK_DOCUMENTS;
  } catch (err) {
    documents = FALLBACK_DOCUMENTS;
  }
  route();
  window.addEventListener('hashchange', route);
  setupLightboxListeners();
  setupLightboxModal();
}

// Lightbox for image zoom
let lightboxZoom = 1;

function setupLightboxModal() {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const closeBtn = lightbox?.querySelector('.lightbox-close');
  const zoomIn = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');
  const zoomLevel = document.getElementById('zoom-level');

  function closeLightbox() {
    lightbox?.classList.add('hidden');
    lightbox?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function updateZoom() {
    if (img) {
      img.style.transform = `scale(${lightboxZoom})`;
      if (zoomLevel) zoomLevel.textContent = Math.round(lightboxZoom * 100) + '%';
    }
  }

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  zoomIn?.addEventListener('click', (e) => { e.stopPropagation(); lightboxZoom = Math.min(3, lightboxZoom + 0.25); updateZoom(); });
  zoomOut?.addEventListener('click', (e) => { e.stopPropagation(); lightboxZoom = Math.max(0.5, lightboxZoom - 0.25); updateZoom(); });

  window.openLightbox = function(url) {
    if (!lightbox || !img) return;
    img.src = url;
    lightboxZoom = 1;
    updateZoom();
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
}

function setupLightboxListeners() {
  document.querySelectorAll('.zoomable-image').forEach(el => {
    el.removeEventListener('click', handleZoomableClick);
    el.addEventListener('click', handleZoomableClick);
  });
}

function handleZoomableClick(e) {
  e.preventDefault();
  e.stopPropagation();
  const url = e.currentTarget.dataset.imageUrl || e.currentTarget.src;
  if (url && window.openLightbox) window.openLightbox(url);
}

// Simple hash router
function route() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, slug] = hash.split('/').filter(Boolean);

  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  if (path === 'browse') {
    showPage('page-browse');
    renderBrowse();
  } else if (path === 'document' && slug) {
    showPage('page-document');
    renderDocument(slug);
  } else if (path === 'help') {
    showPage('page-help');
  } else {
    showPage('page-home');
  }
}

function showPage(id) {
  const page = document.getElementById(id);
  if (page) page.classList.remove('hidden');
}

// Browse page
function renderBrowse() {
  const list = document.getElementById('browse-list');
  if (!list) return;

  list.innerHTML = documents.map(doc => `
    <a href="#/document/${doc.slug}" class="browse-item">
      <div class="browse-item-image zoomable-image" data-image-url="${doc.image}" style="background-image: url('${doc.image}')"></div>
      <div class="browse-item-content">
        <h3>${escapeHtml(doc.title)}</h3>
        <span class="museum">${escapeHtml(doc.museum)}</span>
      </div>
    </a>
  `).join('');

  setupLightboxListeners();
}

// Document detail page
async function renderDocument(slug) {
  const doc = documents.find(d => d.slug === slug);
  const container = document.getElementById('document-content');
  if (!container || !doc) {
    container.innerHTML = '<p class="error-message">Document not found.</p>';
    return;
  }

  container.innerHTML = '<p>Loading...</p>';

  let meta = {};
  try {
    const res = await fetch(doc.data);
    meta = await res.json();
  } catch (err) {
    meta = { error: 'Could not load metadata' };
  }

  const description = meta.catalogue_description || meta.related_material || meta.description || meta.scope_and_content || '';
  const metaFields = buildMetaFields(meta, doc);

  container.innerHTML = `
    <div class="document-image-wrap">
      <img src="${doc.image}" alt="${escapeHtml(doc.title)}" class="zoomable-image" data-image-url="${doc.image}">
    </div>
    <div class="document-body">
      <h2>${escapeHtml(doc.title)}</h2>
      <p class="document-meta">${escapeHtml(doc.museum)}</p>
      ${description ? `<div class="document-description">${escapeHtml(description)}</div>` : ''}
      ${metaFields ? `<div class="document-meta-grid">${metaFields}</div>` : ''}
      <div class="audio-section">
        <h4>Listen to audio description</h4>
        <audio controls preload="metadata">
          <source src="${doc.audio}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  `;

  // Setup comment form for this document
  setupComments(doc.id);

  // Setup lightbox for document image
  setupLightboxListeners();
}

function buildMetaFields(meta, doc) {
  const skip = ['title', 'description', 'catalogue_description', 'scope_and_content', 'related_material', 'subjects'];
  const items = [];
  for (const [key, value] of Object.entries(meta)) {
    if (skip.includes(key) || value == null || value === '') continue;
    const label = key.replace(/_/g, ' ');
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    if (display.length > 200) continue; // Skip very long fields
    items.push(`
      <div class="document-meta-item">
        <strong>${escapeHtml(label)}</strong>
        ${escapeHtml(display)}
      </div>
    `);
  }
  return items.join('');
}

// Comments
function getComments(docId) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return all[docId] || [];
  } catch {
    return [];
  }
}

function saveComment(docId, text, author = 'Anonymous') {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (!all[docId]) all[docId] = [];
  all[docId].push({
    id: Date.now(),
    text,
    author,
    date: new Date().toISOString()
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function setupComments(docId) {
  const form = document.getElementById('comment-form');
  const list = document.getElementById('comments-list');
  const input = document.getElementById('comment-input');
  if (!form || !list) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    saveComment(docId, text);
    input.value = '';
    renderComments(docId, list);
  };

  renderComments(docId, list);
}

function renderComments(docId, list) {
  const comments = getComments(docId);
  if (comments.length === 0) {
    list.innerHTML = '<p class="empty-comments">No comments yet. Be the first to share your thoughts!</p>';
    return;
  }
  list.innerHTML = comments.map(c => `
    <div class="comment" data-id="${c.id}">
      <div class="comment-meta">${escapeHtml(c.author)} · ${formatDate(c.date)}</div>
      <div class="comment-text">${escapeHtml(c.text)}</div>
    </div>
  `).join('');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

init();
