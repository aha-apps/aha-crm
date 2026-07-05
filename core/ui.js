// core/ui.js — API estandar de UI
window.UI = {
  toast: function(msg, tipo, duracion) {
    tipo = tipo || 'info';
    duracion = duracion || 4000;
    var colores = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    var iconos = {
      success: 'bi-check-circle',
      error: 'bi-exclamation-circle',
      warning: 'bi-exclamation-triangle',
      info: 'bi-info-circle'
    };
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast toast-end toast-top z-[100]';
      document.body.appendChild(container);
    }
    var el = document.createElement('div');
    el.className = 'alert ' + (colores[tipo] || 'alert-info') + ' flex items-center gap-2 shadow-lg animate__animated animate__fadeInRight';
    el.innerHTML = '<i class="bi ' + (iconos[tipo] || 'bi-info-circle') + '"></i><span>' + msg + '</span>';
    container.appendChild(el);
    setTimeout(function() {
      el.classList.remove('animate__fadeInRight');
      el.classList.add('animate__fadeOutRight');
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, duracion);
  },

  confirm: function(msg, titulo) {
    titulo = titulo || 'Confirmar';
    return new Promise(function(resolve) {
      var backdrop = document.createElement('div');
      backdrop.className = 'fixed inset-0 bg-base-300/60 backdrop-blur-sm z-[90] flex items-center justify-center';
      backdrop.innerHTML = '<div class="modal-box animate__animated animate__fadeInUp">' +
        '<h3 class="font-bold text-lg mb-4">' + titulo + '</h3>' +
        '<p class="py-4 text-base-content/70">' + msg + '</p>' +
        '<div class="modal-action">' +
          '<button class="btn btn-ghost" id="confirm-cancel">Cancelar</button>' +
          '<button class="btn btn-primary" id="confirm-ok">Aceptar</button>' +
        '</div></div>';
      document.body.appendChild(backdrop);
      document.getElementById('confirm-cancel').focus();
      function cerrar(resultado) {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        resolve(resultado);
      }
      document.getElementById('confirm-ok').onclick = function() { cerrar(true); };
      document.getElementById('confirm-cancel').onclick = function() { cerrar(false); };
      backdrop.addEventListener('click', function(e) { if (e.target === backdrop) cerrar(false); });
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { cerrar(false); document.removeEventListener('keydown', handler); }
      });
    });
  },

  modalForm: function(titulo, html, onSave) {
    var backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-base-300/60 backdrop-blur-sm z-[90] flex items-center justify-center';
    backdrop.innerHTML = '<div class="modal-box max-w-2xl animate__animated animate__fadeInUp" @click.outside="close">' +
      '<h3 class="font-bold text-lg mb-2 flex items-center gap-2">' +
        '<i class="bi bi-pencil-square"></i> ' + titulo +
      '</h3>' +
      '<div id="modal-form-body" class="py-4">' + html + '</div>' +
      '<div class="modal-action">' +
        '<button class="btn btn-ghost" id="modal-cancel">Cancelar</button>' +
        '<button class="btn btn-primary" id="modal-save">Guardar</button>' +
      '</div></div>';
    document.body.appendChild(backdrop);
    document.getElementById('modal-cancel').focus();
    function cerrar() {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }
    document.getElementById('modal-cancel').onclick = cerrar;
    backdrop.addEventListener('click', function(e) { if (e.target === backdrop) cerrar(); });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', handler); }
    });
    document.getElementById('modal-save').onclick = function() {
      var formData = {};
      var inputs = backdrop.querySelectorAll('[name]');
      for (var i = 0; i < inputs.length; i++) {
        var inp = inputs[i];
        if (inp.type === 'checkbox') {
          formData[inp.name] = inp.checked;
        } else if (inp.type === 'number') {
          formData[inp.name] = parseFloat(inp.value) || 0;
        } else {
          formData[inp.name] = inp.value;
        }
      }
      onSave(formData).then(function() { cerrar(); }).catch(function(e) {
        UI.toast(e.message || 'Error al guardar', 'error');
      });
    };
  },

  loading: function(show) {
    var el = document.getElementById('loading-overlay');
    if (show) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'loading-overlay';
        el.className = 'fixed inset-0 bg-base-300/40 backdrop-blur-sm z-[99] flex items-center justify-center';
        el.innerHTML = '<span class="loading loading-spinner loading-lg text-primary"></span>';
        document.body.appendChild(el);
      }
      el.style.display = 'flex';
    } else {
      if (el) el.style.display = 'none';
    }
  },

  formatDate: function(d) {
    if (!d) return '—';
    var date = new Date(d);
    var meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    return date.getDate() + ' ' + meses[date.getMonth()] + ' ' + date.getFullYear();
  },

  formatCurrency: function(n) {
    if (n === null || n === undefined) return '$0.00';
    return '$' + parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  formatBytes: function(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  formatRelative: function(d) {
    if (!d) return '—';
    var diff = Date.now() - new Date(d).getTime();
    var segundos = Math.floor(diff / 1000);
    if (segundos < 60) return 'hace ' + segundos + 's';
    var minutos = Math.floor(segundos / 60);
    if (minutos < 60) return 'hace ' + minutos + 'min';
    var horas = Math.floor(minutos / 60);
    if (horas < 24) return 'hace ' + horas + 'h';
    var dias = Math.floor(horas / 24);
    if (dias < 30) return 'hace ' + dias + 'd';
    return this.formatDate(d);
  }
};
