// core/app.js — Router hash-based y carga de modulos
window.appRouter = {
  currentModule: null,
  outlet: null,

  init: function() {
    var self = this;
    this.outlet = document.getElementById('module-outlet');
    window.addEventListener('hashchange', function() { self.route(); });
    if (!window.location.hash) {
      window.location.hash = '#/contacto';
    } else {
      this.route();
    }
  },

  route: function() {
    var hash = window.location.hash.replace('#', '') || '/contacto';
    var parts = hash.split('/');
    var moduleId = parts[1] || 'contacto';
    var params = {};
    if (parts[2]) params.id = parts[2];
    this.loadModule(moduleId, params);
  },

  loadModule: function(moduleId, params) {
    var self = this;
    params = params || {};

    if (this.currentModule && window.MODULES[this.currentModule]) {
      try { window.MODULES[this.currentModule].destroy(); } catch(e) {}
    }

    this.currentModule = moduleId;

    Alpine.store('loading', { phase: 'route', visible: false });
    if (!this.outlet) this.outlet = document.getElementById('module-outlet');
    this.outlet.innerHTML = '<div class="flex items-center justify-center py-20"><span class="loading loading-spinner loading-lg text-primary"></span></div>';

    var mod = window.MODULES[moduleId];
    if (mod) {
      try {
        var html = mod.render(params);
        this.outlet.innerHTML = html;
        mod.init(params);
      } catch(e) {
        console.error('Error cargando modulo', moduleId, e);
        this.outlet.innerHTML = '<div class="alert alert-error m-4"><i class="bi bi-exclamation-triangle"></i> Error al cargar modulo: ' + e.message + '</div>';
      }
    } else {
      this.outlet.innerHTML = '<div class="alert alert-warning m-4"><i class="bi bi-question-circle"></i> Modulo no encontrado: ' + moduleId + '</div>';
    }
  },

  navigate: function(moduleId) {
    window.location.hash = '#/' + moduleId;
  }
};
