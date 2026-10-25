/**
 * ECO GOLD MINING SAS — SST Report System
 * JavaScript: Form Validation, Google Sheets Integration,
 *             File Upload Preview, Particles, Animations
 *
 * Google Sheets connection via Apps Script Web App endpoint.
 * Instructions to configure at the bottom of this file.
 */

/* ══════════════════════════════════════════════════
   CONFIGURATION — ⚠️ UPDATE THIS URL
   ══════════════════════════════════════════════════
   Replace the placeholder below with the URL you get
   after deploying your Google Apps Script (see README.md).
*/
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxlDV9R8FOaoTJJDWroW4VkMo4INuqAntq9KNhRJTDhgZBSt3ODLuVyobN5bOy1a7Mc/exec';

/* ══════════════════════════════════════════════════
   UTILITY HELPERS
   ══════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);
const qs = (sel, ctx = document) => ctx.querySelector(sel);

/** Set current year in footer */
const yearEl = $('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/** Set today as default date */
const fechaInput = $('fecha');
if (fechaInput) {
  const today = new Date().toISOString().split('T')[0];
  fechaInput.value = today;
  fechaInput.max = today; // cannot pick a future date
}

/* ══════════════════════════════════════════════════
   ANIMATED PARTICLES
   ══════════════════════════════════════════════════ */
(function initParticles() {
  const container = $('particles');
  if (!container) return;

  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');

    const size   = Math.random() * 4 + 2;           // 2-6px
    const left   = Math.random() * 100;              // 0-100%
    const dur    = (Math.random() * 8 + 6).toFixed(1); // 6-14s
    const delay  = (Math.random() * 10).toFixed(1);    // 0-10s

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -10px;
      --dur: ${dur}s;
      --delay: ${delay}s;
      opacity: 0;
    `;
    container.appendChild(p);
  }
})();

/* ══════════════════════════════════════════════════
   CHAR COUNTER FOR TEXTAREA
   ══════════════════════════════════════════════════ */
(function initCharCounter() {
  const textarea = $('descripcion');
  const counter  = $('char-counter');
  if (!textarea || !counter) return;

  const maxLen = parseInt(textarea.getAttribute('maxlength'), 10) || 2000;

  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / ${maxLen}`;
    counter.style.color = len > maxLen * 0.9
      ? 'hsl(28, 100%, 55%)'
      : 'var(--grey-500)';
  });
})();

/* ══════════════════════════════════════════════════
   FILE UPLOAD PREVIEW
   ══════════════════════════════════════════════════ */
(function initFileUpload() {
  const fileInput   = $('foto');
  const previewWrap = $('file-preview');
  const previewImg  = $('preview-img');
  const uploadLabel = $('file-upload-label');
  const uploadText  = $('file-upload-text');
  const removeBtn   = $('file-remove-btn');
  const fotoError   = $('foto-error');

  if (!fileInput) return;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Validate size (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      showError($('group-foto'), fotoError, 'El archivo no puede superar los 10 MB.');
      fileInput.value = '';
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      showError($('group-foto'), fotoError, 'Por favor sube únicamente imágenes.');
      fileInput.value = '';
      return;
    }

    clearError($('group-foto'), fotoError);

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      uploadLabel.style.display = 'none';
      previewWrap.style.display = 'block';
      uploadText.textContent = file.name;
    };
    reader.readAsDataURL(file);
  });

  // Drag & drop
  const wrapper = $('file-upload-wrapper');
  if (wrapper) {
    wrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadLabel.style.borderColor = 'var(--orange-500)';
    });
    wrapper.addEventListener('dragleave', () => {
      uploadLabel.style.borderColor = '';
    });
    wrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadLabel.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  }

  // Remove image
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      fileInput.value = '';
      previewImg.src = '';
      previewWrap.style.display = 'none';
      uploadLabel.style.display = '';
    });
  }
})();

/* ══════════════════════════════════════════════════
   FORM VALIDATION HELPERS
   ══════════════════════════════════════════════════ */
function showError(group, errorEl, message) {
  if (!errorEl) return;
  errorEl.textContent = message;
  if (group) {
    const input = qs('.form-input, .checkbox-label', group);
    if (input) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
    }
  }
}

function clearError(group, errorEl) {
  if (!errorEl) return;
  errorEl.textContent = '';
  if (group) {
    const input = qs('.form-input', group);
    if (input) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    }
  }
}

function validateField(fieldId) {
  const field    = $(fieldId);
  const group    = $(`group-${fieldId}`);
  const errorEl  = $(`${fieldId}-error`);
  if (!field) return true;

  const value = field.value.trim();
  let valid   = true;
  let message = '';

  switch (fieldId) {
    case 'fecha':
      if (!value) { message = 'La fecha es obligatoria.'; valid = false; }
      break;

    case 'nombre':
      if (!value) {
        message = 'El nombre completo es obligatorio.'; valid = false;
      } else if (value.split(' ').filter(w => w).length < 2) {
        message = 'Ingresa nombres y apellidos completos.'; valid = false;
      } else if (value.length < 5) {
        message = 'El nombre parece demasiado corto.'; valid = false;
      }
      break;

    case 'identificacion':
      if (!value) {
        message = 'La identificación es obligatoria.'; valid = false;
      } else if (!/^\d{5,12}$/.test(value)) {
        message = 'Ingresa solo números (5–12 dígitos).'; valid = false;
      }
      break;

    case 'cargo':
      if (!value) { message = 'El cargo es obligatorio.'; valid = false; }
      break;

    case 'area':
      if (!value) { message = 'Selecciona un área.'; valid = false; }
      break;

    case 'correo':
      if (!value) {
        message = 'El correo electrónico es obligatorio.'; valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = 'Ingresa un correo electrónico válido.'; valid = false;
      }
      break;

    case 'descripcion':
      if (!value) {
        message = 'La descripción es obligatoria.'; valid = false;
      } else if (value.length < 20) {
        message = 'La descripción debe tener al menos 20 caracteres.'; valid = false;
      }
      break;

    case 'ubicacion':
      if (!value) { message = 'La ubicación es obligatoria.'; valid = false; }
      break;

    default:
      break;
  }

  if (valid) {
    clearError(group, errorEl);
  } else {
    showError(group, errorEl, message);
  }

  return valid;
}

function validateDeclaracion() {
  const checkbox  = $('declaracion');
  const group     = $('group-declaracion');
  const errorEl   = $('declaracion-error');

  if (!checkbox.checked) {
    showError(group, errorEl, 'Debes aceptar la declaración para continuar.');
    return false;
  }
  clearError(group, errorEl);
  return true;
}

/* Live validation on blur */
const fieldsToValidate = [
  'fecha', 'nombre', 'identificacion', 'cargo',
  'area', 'correo', 'descripcion', 'ubicacion'
];

fieldsToValidate.forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('blur', () => validateField(id));
    el.addEventListener('input', () => {
      // clear error while typing
      const errorEl = $(`${id}-error`);
      if (errorEl && errorEl.textContent) validateField(id);
    });
  }
});

/* ══════════════════════════════════════════════════
   CONVERT / COMPRESS IMAGE FOR UPLOAD
   ══════════════════════════════════════════════════ */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Reduce tamaño para no superar el límite de Apps Script. */
function compressImageFile(file, maxSize = 1400, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / img.width, maxSize / img.height);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      fileToBase64(file).then(resolve).catch(reject);
    };
    img.src = url;
  });
}

/* ══════════════════════════════════════════════════
   SEND DATA TO GOOGLE SHEETS (via Apps Script)
   ══════════════════════════════════════════════════
   Google redirige /exec (302) y el POST JSON/text/plain
   llega vacío → "La aplicación no envió contenido".
   Enviar application/x-www-form-urlencoded con el JSON
   en el campo "payload" lo deja en e.parameter.payload.
   ══════════════════════════════════════════════════ */
async function sendToGoogleSheets(data) {
  // Si no hay URL configurada → modo demo
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn('⚠️  DEMO MODE: No Google Apps Script URL configurada.');
    console.table(data);
    await new Promise(r => setTimeout(r, 1500));
    return { result: 'success', mode: 'demo' };
  }

  const { fotoBase64, ...dataWithoutPhoto } = data;
  const body = new URLSearchParams();
  body.set('payload', JSON.stringify(dataWithoutPhoto));
  if (fotoBase64) {
    body.set('fotoBase64', fotoBase64);
  }

  await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: body.toString(),
  });

  // Éxito asumido (no-cors no permite leer la respuesta)
  return { result: 'success' };
}

/* ══════════════════════════════════════════════════
   MAIN FORM SUBMISSION
   ══════════════════════════════════════════════════ */
const form       = $('safety-report-form');
const submitBtn  = $('submit-btn');
const btnSpinner = $('btn-spinner');
const successMsg = $('success-message');
const errorBanner= $('error-banner');
const errorText  = $('error-banner-text');
const newReportBtn = $('new-report-btn');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldResults = fieldsToValidate.map(id => validateField(id));
    const checkResult  = validateDeclaracion();
    const allValid     = fieldResults.every(Boolean) && checkResult;

    if (!allValid) {
      // Scroll to first error
      const firstError = document.querySelector('.form-input.is-invalid, .checkbox-input:invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // UI: Loading state
    setLoading(true);
    errorBanner.style.display = 'none';

    try {
      // Convert photo to base64 if present
      const fotoFile = $('foto').files[0] || null;
      const fotoBase64 = fotoFile ? await compressImageFile(fotoFile) : null;

      // Build payload
      const payload = {
        timestamp:     new Date().toISOString(),
        fecha:         $('fecha').value,
        nombre:        $('nombre').value.trim(),
        identificacion:$('identificacion').value.trim(),
        cargo:         $('cargo').value.trim(),
        area:          $('area').value,
        descripcion:   $('descripcion').value.trim(),
        ubicacion:     $('ubicacion').value.trim(),
        correo:        $('correo').value.trim().toLowerCase(),
        fotoNombre:    fotoFile ? fotoFile.name : '',
        fotoBase64:    fotoBase64 || '',
        declaracion:   'Sí — el reportante declaró que la información es verídica',
      };

      const result = await sendToGoogleSheets(payload);

      // Show success
      form.style.display = 'none';
      successMsg.style.display = 'flex';
      window.scrollTo({ top: $('formulario').offsetTop - 80, behavior: 'smooth' });

      if (result.mode === 'demo') {
        const demoNote = document.createElement('p');
        demoNote.style.cssText = 'font-size:0.78rem;color:var(--orange-300);margin-top:0.5rem;';
        demoNote.textContent = '🟡 Modo demo activo — configura la URL de Google Apps Script en app.js para guardar en Sheets.';
        successMsg.appendChild(demoNote);
      }

    } catch (err) {
      console.error('Error al enviar el reporte:', err);
      errorText.textContent = `Error al conectar con el servidor: ${err.message}. Verifica tu conexión e intenta de nuevo.`;
      errorBanner.style.display = 'flex';
      errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      setLoading(false);
    }
  });
}

/** Reset form for a new report */
if (newReportBtn) {
  newReportBtn.addEventListener('click', () => {
    form.reset();
    form.style.display = '';
    successMsg.style.display = 'none';

    // Clear all validation classes
    document.querySelectorAll('.form-input').forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    document.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
    });

    // Reset file preview
    const previewWrap = $('file-preview');
    const uploadLabel = $('file-upload-label');
    if (previewWrap) previewWrap.style.display = 'none';
    if (uploadLabel) uploadLabel.style.display = '';

    // Reset char counter
    const counter = $('char-counter');
    if (counter) counter.textContent = '0 / 2000';

    // Set date back to today
    const fechaInp = $('fecha');
    if (fechaInp) fechaInp.value = new Date().toISOString().split('T')[0];

    // Remove demo note if present
    const demoNote = successMsg.querySelector('p:last-child');
    if (demoNote && demoNote.style.color) demoNote.remove();

    window.scrollTo({ top: $('formulario').offsetTop - 80, behavior: 'smooth' });
  });
}

/** Toggle loading state on submit button */
function setLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;

  if (loading) {
    submitBtn.classList.add('btn--loading');
    const btnText = submitBtn.querySelector('.btn__text');
    const btnIcon = submitBtn.querySelector('.btn__icon');
    if (btnText) btnText.textContent = 'Enviando...';
    if (btnIcon) btnIcon.style.display = 'none';
    if (btnSpinner) btnSpinner.style.display = 'inline';
  } else {
    submitBtn.classList.remove('btn--loading');
    const btnText = submitBtn.querySelector('.btn__text');
    const btnIcon = submitBtn.querySelector('.btn__icon');
    if (btnText) btnText.textContent = 'Enviar Reporte';
    if (btnIcon) btnIcon.style.display = '';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

/* ══════════════════════════════════════════════════
   INTERSECTION OBSERVER — Animate on scroll
   ══════════════════════════════════════════════════ */
(function initScrollAnimations() {
  const targets = document.querySelectorAll('.stat-card, .feature-item, .form-card');
  if (!targets.length) return;

  // Add initial hidden state
  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════
   SMOOTH ANCHOR NAVIGATION
   ══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').slice(1);
    const target   = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const headerHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10
      ) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════════════════
   HEADER SCROLL EFFECT
   ══════════════════════════════════════════════════ */
(function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(10,11,15,0.97)';
    } else {
      header.style.background = 'rgba(10,11,15,0.85)';
    }
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   CONSOLE INSTRUCTIONS FOR DEVELOPER
   ══════════════════════════════════════════════════ */
console.log(`
%c╔══════════════════════════════════════════════╗
║      ECO GOLD MINING SAS — SST System        ║
╠══════════════════════════════════════════════╣
║  Para conectar con Google Sheets:            ║
║  1. Abre README.md en el proyecto            ║
║  2. Sigue las instrucciones del Apps Script  ║
║  3. Pega la URL en GOOGLE_SCRIPT_URL         ║
╚══════════════════════════════════════════════╝
`, 'color:#e67800;font-family:monospace;font-size:12px;');
