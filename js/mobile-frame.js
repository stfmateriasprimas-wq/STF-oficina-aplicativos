/**
 * ============================================================================
 * STF GROUP · Previsualizador de Marco Móvil Exacto por Marca (En Tiempo Real)
 * Permite inspeccionar login.html e index.html con todas sus funciones reales
 * y conexión a Google Sheets dentro de Jetski Preview sin mover la ventana.
 * ============================================================================
 */
(function () {
  // Si ya estamos dentro del iframe del teléfono, no volver a inyectar el marco
  if (window.self !== window.top || window.location.search.indexOf('inframe=1') !== -1) {
    return;
  }

  const BRANDS = [
    { id: 'iphone16', label: '🍎 iPhone 15/16 Pro', w: 393, h: 852, r: 46, notch: 'island' },
    { id: 'iphonepromax', label: '🍎 iPhone Pro Max', w: 430, h: 932, r: 48, notch: 'island' },
    { id: 's24ultra', label: '🌌 Samsung S24 Ultra', w: 412, h: 915, r: 20, notch: 'punch' },
    { id: 'xiaomi', label: '⚡ Xiaomi Redmi Note', w: 393, h: 873, r: 36, notch: 'punch' },
    { id: 'motorola', label: '📱 Motorola / Android', w: 360, h: 800, r: 30, notch: 'punch' },
    { id: 'iphonese', label: '🍏 iPhone SE', w: 375, h: 667, r: 32, notch: 'classic' }
  ];

  let activeBrand = BRANDS[0];
  let isLandscape = false;
  let autoFit = true;
  let currentPage = window.location.pathname.indexOf('login') !== -1 ? 'login.html' : 'index.html';

  function injectStyles() {
    if (document.getElementById('stfMobileFrameStyles')) return;
    const style = document.createElement('style');
    style.id = 'stfMobileFrameStyles';
    style.textContent = `
      .stf-mf-trigger {
        position: fixed;
        bottom: 18px;
        left: 84px;
        z-index: 99990;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 15px;
        border-radius: 999px;
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid rgba(255,255,255,0.22);
        box-shadow: 0 10px 28px rgba(79, 70, 229, 0.42);
        cursor: pointer;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .stf-mf-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 32px rgba(79, 70, 229, 0.55);
      }
      @media (max-width: 900px) {
        .stf-mf-trigger,
        #stfMobileFrameTrigger {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          opacity: 0 !important;
        }
      }
      .stf-mf-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: radial-gradient(circle at 50% 15%, #1e293b 0%, #090d16 100%);
        display: none;
        flex-direction: column;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        color: #f8fafc;
        overflow: hidden;
      }
      .stf-mf-overlay.active {
        display: flex;
      }
      .stf-mf-topbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(15, 23, 42, 0.92);
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        backdrop-filter: blur(12px);
      }
      .stf-mf-brands {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .stf-mf-btn {
        padding: 6px 11px;
        border-radius: 10px;
        font-size: 11.5px;
        font-weight: 600;
        background: rgba(30, 41, 59, 0.85);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.2);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .stf-mf-btn:hover {
        color: #ffffff;
        background: rgba(51, 65, 85, 0.9);
      }
      .stf-mf-btn.active {
        background: #4f46e5;
        color: #ffffff;
        border-color: #818cf8;
        box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
      }
      .stf-mf-btn.close-btn {
        background: rgba(239, 68, 68, 0.16);
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.35);
      }
      .stf-mf-btn.close-btn:hover {
        background: #ef4444;
        color: #ffffff;
      }
      .stf-mf-stage {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        padding: 16px;
        position: relative;
      }
      .stf-mf-phone {
        position: relative;
        background: #07080c;
        box-shadow:
          0 0 0 10px #1e293b,
          0 0 0 12px #475569,
          0 30px 70px rgba(0, 0, 0, 0.75);
        overflow: hidden;
        transition: width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1), border-radius 0.25s ease, transform 0.2s ease;
        transform-origin: center center;
        display: flex;
        flex-direction: column;
      }
      .stf-mf-notch-bar {
        height: 32px;
        background: #090d16;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 20px 0 20px;
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
        z-index: 5;
      }
      .stf-mf-notch-pill {
        background: #000000;
        border-radius: 999px;
      }
      .stf-mf-notch-pill.island { width: 86px; height: 16px; }
      .stf-mf-notch-pill.punch { width: 12px; height: 12px; }
      .stf-mf-notch-pill.classic { width: 48px; height: 6px; background: #334155; }
      .stf-mf-iframe {
        width: 100%;
        flex: 1;
        border: 0;
        background: #ffffff;
      }
      .stf-mf-homebar {
        height: 16px;
        background: #090d16;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .stf-mf-homebar-line {
        width: 110px;
        height: 4px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.45);
      }
    `;
    document.head.appendChild(style);
  }

  function buildUI() {
    injectStyles();

    // Botón flotante para abrir el marco móvil sin mover la ventana
    const trigger = document.createElement('button');
    trigger.className = 'stf-mf-trigger';
    trigger.id = 'stfMobileFrameTrigger';
    trigger.innerHTML = '<span>📱 Vista Móvil por Marca</span>';
    trigger.onclick = () => toggleOverlay(true);
    document.body.appendChild(trigger);

    // Overlay con el dispositivo centrado
    const overlay = document.createElement('div');
    overlay.className = 'stf-mf-overlay';
    overlay.id = 'stfMobileFrameOverlay';

    overlay.innerHTML = `
      <div class="stf-mf-topbar">
        <div class="stf-mf-brands" id="stfMfBrandList"></div>
        <div class="stf-mf-brands">
          <span id="stfMfDimsLabel" style="font-size:11.5px;color:#94a3b8;font-family:monospace;margin-right:4px;">393 × 852 px</span>
          <button type="button" class="stf-mf-btn" id="stfMfPageLogin">🔐 Login</button>
          <button type="button" class="stf-mf-btn" id="stfMfPageIndex">📊 Dashboard</button>
          <button type="button" class="stf-mf-btn" id="stfMfRotate">🔄 Rotar</button>
          <button type="button" class="stf-mf-btn active" id="stfMfAutoFit" title="Escalar automáticamente para caber en la altura de tu pantalla">🔍 Auto-Escala</button>
          <button type="button" class="stf-mf-btn close-btn" id="stfMfClose">✕ Pantalla Completa</button>
        </div>
      </div>
      <div class="stf-mf-stage" id="stfMfStage">
        <div class="stf-mf-phone" id="stfMfPhone">
          <div class="stf-mf-notch-bar">
            <span>09:41</span>
            <div class="stf-mf-notch-pill island" id="stfMfNotch"></div>
            <span>5G · 100%</span>
          </div>
          <iframe class="stf-mf-iframe" id="stfMfIframe" title="Previsualización Móvil STF GROUP"></iframe>
          <div class="stf-mf-homebar">
            <div class="stf-mf-homebar-line"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const brandList = document.getElementById('stfMfBrandList');
    BRANDS.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stf-mf-btn' + (b.id === activeBrand.id ? ' active' : '');
      btn.dataset.brand = b.id;
      btn.textContent = `${b.label} (${b.w}×${b.h})`;
      btn.onclick = () => {
        activeBrand = b;
        document.querySelectorAll('#stfMfBrandList .stf-mf-btn').forEach(el => {
          el.classList.toggle('active', el.dataset.brand === b.id);
        });
        applyDeviceGeometry();
      };
      brandList.appendChild(btn);
    });

    document.getElementById('stfMfPageLogin').onclick = () => loadPageInFrame('login.html');
    document.getElementById('stfMfPageIndex').onclick = () => loadPageInFrame('index.html');
    document.getElementById('stfMfRotate').onclick = () => {
      isLandscape = !isLandscape;
      applyDeviceGeometry();
    };
    document.getElementById('stfMfAutoFit').onclick = function () {
      autoFit = !autoFit;
      this.classList.toggle('active', autoFit);
      applyDeviceGeometry();
    };
    document.getElementById('stfMfClose').onclick = () => toggleOverlay(false);

    window.addEventListener('resize', () => {
      if (overlay.classList.contains('active')) applyDeviceGeometry();
    });

    if (window.location.search.indexOf('movil=1') !== -1) {
      toggleOverlay(true);
    }
  }

  function loadPageInFrame(page) {
    currentPage = page;
    const iframe = document.getElementById('stfMfIframe');
    if (iframe) {
      iframe.src = `${page}?inframe=1&t=${Date.now()}`;
    }
    document.getElementById('stfMfPageLogin').classList.toggle('active', page === 'login.html');
    document.getElementById('stfMfPageIndex').classList.toggle('active', page === 'index.html');
  }

  function applyDeviceGeometry() {
    const phone = document.getElementById('stfMfPhone');
    const stage = document.getElementById('stfMfStage');
    const notch = document.getElementById('stfMfNotch');
    const label = document.getElementById('stfMfDimsLabel');
    if (!phone || !stage) return;

    const w = isLandscape ? activeBrand.h : activeBrand.w;
    const h = isLandscape ? activeBrand.w : activeBrand.h;

    phone.style.width = w + 'px';
    phone.style.height = h + 'px';
    phone.style.borderRadius = activeBrand.r + 'px';

    if (notch) {
      notch.className = 'stf-mf-notch-pill ' + activeBrand.notch;
    }
    if (label) {
      label.textContent = `${w} × ${h} px`;
    }

    if (autoFit) {
      const availW = stage.clientWidth - 40;
      const availH = stage.clientHeight - 40;
      const scale = Math.min(1, availW / (w + 24), availH / (h + 24));
      phone.style.transform = `scale(${scale.toFixed(3)})`;
    } else {
      phone.style.transform = 'scale(1)';
    }
  }

  function toggleOverlay(show) {
    const overlay = document.getElementById('stfMobileFrameOverlay');
    const iframe = document.getElementById('stfMfIframe');
    if (!overlay) return;
    if (show) {
      overlay.classList.add('active');
      if (!iframe.src) {
        loadPageInFrame(currentPage);
      }
      setTimeout(applyDeviceGeometry, 30);
    } else {
      overlay.classList.remove('active');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }
})();

