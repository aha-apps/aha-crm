// core/search-palette.js — Command Palette (Cmd+K) global
(function() {
  var searchPalette = {
    open: false,
    query: '',
    selectedIdx: 0,
    keyboardNav: false,
    items: [],

    get filtered() {
      var self = this;
      if (!this.query || this.query.length < 2) {
        // Mostrar modulos
        var modulos = [];
        for (var id in APP_CONFIG.modulos) {
          if (APP_CONFIG.modulos[id].activo) {
            modulos.push({
              type: 'module',
              id: id,
              title: APP_CONFIG.modulos[id].titulo,
              icon: APP_CONFIG.modulos[id].icono,
              subtitle: 'Ir al modulo'
            });
          }
        }
        this.items = modulos;
        return modulos;
      }
      var q = this.query.toLowerCase();
      var results = [];
      for (var mid in APP_CONFIG.modulos) {
        var m = APP_CONFIG.modulos[mid];
        if (m.activo && m.titulo.toLowerCase().indexOf(q) !== -1) {
          results.push({ type: 'module', id: mid, title: m.titulo, icon: m.icono, subtitle: 'Ir al modulo' });
        }
      }
      // Registrar resultados desde IA si existe
      if (window.ia && window.ia.search) {
        try {
          var iaResults = window.ia.search(q);
          if (iaResults && iaResults.length) {
            results.push({ type: 'separator' });
            for (var i = 0; i < iaResults.length && results.length < 10; i++) {
              results.push({ type: 'record', title: iaResults[i].titulo || iaResults[i].nombre, subtitle: iaResults[i].modulo || '', icon: 'bi-file-text' });
            }
          }
        } catch(e) {}
      }
      this.items = results;
      return results;
    },

    get hasResults() {
      return this.filtered.length > 0;
    },

    openPalette: function() {
      this.open = true;
      this.query = '';
      this.selectedIdx = 0;
      var self = this;
      setTimeout(function() {
        var input = document.querySelector('.sp-search-input');
        if (input) input.focus();
      }, 100);
    },

    closePalette: function() {
      this.open = false;
    },

    selectItem: function(item) {
      if (item.type === 'separator') return;
      if (item.type === 'module') {
        this.closePalette();
        window.appRouter.navigate(item.id);
      }
    },

    onKeydown: function(e) {
      if (!this.open) return;
      var self = this;
      if (e.key === 'Escape') { this.closePalette(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.keyboardNav = true;
        var items = this.filtered.filter(function(i) { return i.type !== 'separator'; });
        for (var i = 0; i < items.length; i++) items[i]._kIdx = i;
        this.selectedIdx = Math.min(this.selectedIdx + 1, items.length - 1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.keyboardNav = true;
        var items2 = this.filtered.filter(function(i) { return i.type !== 'separator'; });
        for (var i = 0; i < items2.length; i++) items2[i]._kIdx = i;
        this.selectedIdx = Math.max(this.selectedIdx - 1, 0);
      }
      if (e.key === 'Enter' && this.filtered.length) {
        var visibles = this.filtered.filter(function(i) { return i.type !== 'separator'; });
        var selected = visibles[this.selectedIdx];
        if (selected) this.selectItem(selected);
      }
    }
  };

  window.searchPalette = searchPalette;
})();
