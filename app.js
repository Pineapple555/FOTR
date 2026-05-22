'use strict';

/* ══════════════════════════════════════════════════════
   CONFIG
   ══════════════════════════════════════════════════════ */
const CONFIG = {
  appName:    'FOTR',
  subtitle:   'Workspace personal de Francisco Osorio',
  sessionKey: 'fotr_session',
};


/* ══════════════════════════════════════════════════════
   USERS  — replace with API / DB call in production
   ══════════════════════════════════════════════════════ */
const USERS = [
  {
    id:       'francisco',
    name:     'Francisco Osorio',
    email:    'francisco',
    password: 'fotr2024',
    role:     'admin',
    initials: 'FO',
  },
  {
    id:       'demo',
    name:     'Usuario Demo',
    email:    'demo',
    password: 'demo123',
    role:     'user',
    initials: 'UD',
  },
];


/* ══════════════════════════════════════════════════════
   APPS REGISTRY  — the single source of truth for apps
   Add/edit entries here to extend the workspace.

   Fields:
     id           – unique slug
     name         – display name
     description  – short description
     icon         – Lucide icon name  (lucide.dev/icons)
     iconBg       – icon container background color
     iconColor    – icon stroke color
     status       – 'active' | 'development' | 'coming-soon'
     url          – destination URL ('#' = not yet configured)
     allowedRoles – roles that can see this app
     allowedUsers – extra user IDs that can see this app
   ══════════════════════════════════════════════════════ */
const APPS = [
  {
    id:           'wms-intent',
    name:         'WMS INTENT',
    description:  'Control de inventario, entradas, salidas y stock.',
    icon:         'package',
    iconBg:       '#EEF0FB',
    iconColor:    '#5C6BC0',
    status:       'active',
    url:          'wms.html',
    allowedRoles: ['admin'],
    allowedUsers: [],
  },
    {
    id:           'cerebro-intent',
    name:         'CEREBRO INTENT',
    description:  'Control datos base de INTENT.',
    icon:         'mind',
    iconBg:       '#EEF0FB',
    iconColor:    '#5C6BC0',
    status:       'active',
    url:          'cerebro.html',
    allowedRoles: ['admin'],
    allowedUsers: [],
  },
   
  {
    id:           'dashboard-intent',
    name:         'Dashboard INTENT',
    description:  'Métricas comerciales, ventas y operación.',
    icon:         'bar-chart-2',
    iconBg:       '#E8F5E9',
    iconColor:    '#2E7D32',
    status:       'coming-soon',
    url:          '#',
    allowedRoles: ['admin'],
    allowedUsers: [],
  },
  {
    id:           'proyectos-web',
    name:         'Proyectos Web',
    description:  'Acceso a páginas web no lanzadas y pruebas internas.',
    icon:         'globe',
    iconBg:       '#F3E5F5',
    iconColor:    '#7B1FA2',
    status:       'active',
    url:          '#',
    allowedRoles: ['admin', 'user'],
    allowedUsers: [],
  },
    {
    id:           'guia-claude',
    name:         'Guía Claude',
    description:  'Guía de uso de Claude.',
    icon:         'book',
    iconBg:       '#F3E5F5',
    iconColor:    '#7B1FA2',
    status:       'active',
    url:          'guia-claude-francisco.html',
    allowedRoles: ['admin', 'user'],
    allowedUsers: [],
  },
];


/* ══════════════════════════════════════════════════════
   STATUS DISPLAY CONFIG
   ══════════════════════════════════════════════════════ */
const STATUS_MAP = {
  'active':       { label: 'Activa',         icon: 'check-circle', cls: 'badge-active' },
  'development':  { label: 'En desarrollo',  icon: 'clock',        cls: 'badge-dev'    },
  'coming-soon':  { label: 'Próximamente',   icon: 'clock',        cls: 'badge-soon'   },
};


/* ══════════════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════════════ */
const Auth = {
  user: null,

  login(email, password) {
    const found = USERS.find(u =>
      u.email.toLowerCase() === email.toLowerCase().trim() &&
      u.password === password
    );
    if (!found) {
      return { ok: false, err: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
    }
    sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify({ id: found.id }));
    this.user = found;
    return { ok: true };
  },

  logout() {
    sessionStorage.removeItem(CONFIG.sessionKey);
    this.user = null;
  },

  restore() {
    try {
      const raw = sessionStorage.getItem(CONFIG.sessionKey);
      if (!raw) return null;
      const { id } = JSON.parse(raw);
      this.user = USERS.find(u => u.id === id) || null;
    } catch {
      this.user = null;
    }
    return this.user;
  },

  canAccess(app) {
    if (!this.user) return false;
    if (this.user.role === 'admin') return true;
    return app.allowedRoles.includes(this.user.role) ||
           app.allowedUsers.includes(this.user.id);
  },
};


/* ══════════════════════════════════════════════════════
   UI
   ══════════════════════════════════════════════════════ */
const UI = {
  filterStatus: 'all',
  searchQuery:  '',

  /* ── Rendering ───────────────────────────────────── */

  cardHTML(app) {
    const s       = STATUS_MAP[app.status] || {};
    const canOpen = app.url && app.url !== '#' && app.status !== 'coming-soon';

    return `
      <article class="app-card" data-id="${app.id}">
        <div class="card-top">
          <div class="app-icon" style="background:${app.iconBg};color:${app.iconColor}">
            <i data-lucide="${app.icon}"></i>
          </div>
          <button class="card-menu" data-id="${app.id}" aria-label="Opciones de ${app.name}">
            <i data-lucide="more-vertical"></i>
          </button>
        </div>
        <div class="card-body">
          <h3 class="app-name">${app.name}</h3>
          <p class="app-desc">${app.description}</p>
          ${s.label
            ? `<span class="badge ${s.cls}">
                 <i data-lucide="${s.icon}"></i>${s.label}
               </span>`
            : ''}
        </div>
        <div class="card-foot">
          <a href="${canOpen ? app.url : '#'}"
             class="open-link${canOpen ? '' : ' muted'}"
             ${canOpen ? 'target="_blank" rel="noopener noreferrer"' : 'onclick="return false"'}>
            Abrir <i data-lucide="chevron-right"></i>
          </a>
        </div>
      </article>`;
  },

  addCardHTML() {
    return `
      <article class="app-card add-card" id="add-card-btn"
               role="button" tabindex="0" aria-label="Agregar nueva aplicación">
        <div class="card-top">
          <div class="app-icon" style="background:#FFFBEB;color:#D97706">
            <i data-lucide="plus"></i>
          </div>
          <div></div>
        </div>
        <div class="card-body">
          <h3 class="app-name">Nueva aplicación</h3>
          <p class="app-desc">Conecta una nueva herramienta o proyecto a tu workspace.</p>
        </div>
        <div class="card-foot">
          <span class="open-link amber">
            Agregar <i data-lucide="chevron-right"></i>
          </span>
        </div>
      </article>`;
  },

  renderGrid() {
    const grid = document.getElementById('apps-grid');
    if (!grid) return;

    let apps = APPS.filter(a => Auth.canAccess(a));

    if (this.filterStatus !== 'all')
      apps = apps.filter(a => a.status === this.filterStatus);

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      apps = apps.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }

    if (!apps.length) {
      const msg = this.searchQuery
        ? `Sin resultados para "<strong>${this.searchQuery}</strong>"`
        : 'No tienes aplicaciones disponibles.';
      grid.innerHTML = `
        <div class="empty-state">
          <i data-lucide="search-x"></i>
          <p>${msg}</p>
        </div>`;
    } else {
      const addBtn = Auth.user?.role === 'admin' ? this.addCardHTML() : '';
      grid.innerHTML = apps.map(a => this.cardHTML(a)).join('') + addBtn;
    }

    reIcons();
    this._bindCardEvents();
  },

  _bindCardEvents() {
    document.querySelectorAll('.card-menu').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this.openMenu(btn.dataset.id, btn);
      });
    });

    const addBtn = document.getElementById('add-card-btn');
    if (addBtn) {
      const handle = () => toast('Agregar nueva app — próximamente disponible');
      addBtn.addEventListener('click', handle);
      addBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); }
      });
    }
  },

  renderHeader() {
    const el = document.getElementById('app-header');
    const u  = Auth.user;
    if (!el || !u) return;

    el.innerHTML = `
      <div class="hdr-left">
        <div class="hdr-logo">F</div>
        <div>
          <div class="hdr-name">${CONFIG.appName}</div>
          <div class="hdr-sub">${CONFIG.subtitle}</div>
        </div>
      </div>
      <div class="hdr-right">
        <div class="user-avatar" title="${u.name}">${u.initials}</div>
        <button class="logout-btn" id="logout-btn" title="Cerrar sesión">
          <i data-lucide="log-out"></i>
        </button>
      </div>`;

    document.getElementById('logout-btn')
      .addEventListener('click', () => App.logout());
    reIcons();
  },

  /* ── Filter & Search ─────────────────────────────── */

  setFilter(status) {
    this.filterStatus = status;
    document.querySelectorAll('.chip').forEach(c =>
      c.classList.toggle('active', c.dataset.f === status)
    );
    this.renderGrid();
  },

  setSearch(q) {
    this.searchQuery = q;
    this.renderGrid();
  },

  toggleFilter() {
    const panel = document.getElementById('filter-panel');
    const btn   = document.getElementById('filter-btn');
    const open  = panel.classList.toggle('hidden') === false;
    btn.classList.toggle('on', open);
  },

  /* ── Context Menu ────────────────────────────────── */

  openMenu(appId, anchor) {
    document.querySelectorAll('.ctx-menu').forEach(m => m.remove());

    const app     = APPS.find(a => a.id === appId);
    const isAdmin = Auth.user?.role === 'admin';
    if (!app) return;

    const menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.innerHTML = `
      <button data-action="copy">
        <i data-lucide="link"></i> Copiar enlace
      </button>
      ${isAdmin ? `<button data-action="edit">
        <i data-lucide="edit-2"></i> Editar app
      </button>` : ''}
    `;

    const r = anchor.getBoundingClientRect();
    menu.style.cssText =
      `top:${r.bottom + 8 + window.scrollY}px;` +
      `left:${Math.max(8, r.left - 148 + window.scrollX)}px`;

    document.body.appendChild(menu);
    reIcons();

    menu.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action === 'copy') {
        if (app.url && app.url !== '#') {
          navigator.clipboard?.writeText(app.url)
            .then(() => toast('Enlace copiado al portapapeles'));
        } else {
          toast('Esta app aún no tiene URL configurada');
        }
      } else if (action === 'edit') {
        toast('Editor de apps — próximamente disponible');
      }
      menu.remove();
    });

    setTimeout(() =>
      document.addEventListener('click', () => menu.remove(), { once: true }),
    0);
  },

  /* ── Password toggle ─────────────────────────────── */

  togglePwd(btn) {
    const inp  = btn.closest('.inp-wrap').querySelector('input');
    const icon = btn.querySelector('i');
    inp.type            = inp.type === 'password' ? 'text' : 'password';
    icon.dataset.lucide = inp.type === 'password' ? 'eye' : 'eye-off';
    reIcons();
  },

  /* ── Bottom nav ──────────────────────────────────── */

  setNav(tab) {
    document.querySelectorAll('.nav-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab)
    );
  },
};


/* ══════════════════════════════════════════════════════
   APP CONTROLLER
   ══════════════════════════════════════════════════════ */
const App = {
  init() {
    Auth.restore() ? this.showDashboard() : this.showLogin();
  },

  showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');

    const form  = document.getElementById('login-form');
    const errEl = document.getElementById('login-error');
    const btn   = document.getElementById('login-btn');

    form.onsubmit = e => {
      e.preventDefault();
      errEl.hidden = true;
      btn.disabled = true;
      btn.innerHTML = '<span class="spin"></span> Ingresando…';

      setTimeout(() => {
        const res = Auth.login(
          document.getElementById('email').value,
          document.getElementById('pwd').value
        );
        if (res.ok) {
          App.showDashboard();
        } else {
          errEl.textContent = res.err;
          errEl.hidden      = false;
          btn.disabled      = false;
          btn.textContent   = 'Ingresar al workspace';
        }
      }, 500);
    };

    reIcons();
  },

  showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');

    UI.renderHeader();
    UI.renderGrid();

    document.getElementById('search')
      .addEventListener('input', e => UI.setSearch(e.target.value));

    document.getElementById('filter-btn')
      .addEventListener('click', () => UI.toggleFilter());

    document.querySelectorAll('.chip').forEach(c =>
      c.addEventListener('click', () => UI.setFilter(c.dataset.f))
    );

    reIcons();
  },

  logout() {
    if (!confirm('¿Deseas cerrar sesión?')) return;
    Auth.logout();
    UI.filterStatus = 'all';
    UI.searchQuery  = '';
    const panel = document.getElementById('filter-panel');
    if (panel) panel.classList.add('hidden');
    document.getElementById('filter-btn')?.classList.remove('on');
    this.showLogin();
  },
};


/* ══════════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════════ */
function reIcons() {
  if (window.lucide) lucide.createIcons();
}

function toast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className   = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}


/* ══════════════════════════════════════════════════════
   BOOTSTRAP
   ══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => App.init());
