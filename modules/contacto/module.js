// modules/contacto/module.js — Gestion de contactos AHA CRM
var ModuloContacto = {
  id: 'contacto',
  titulo: 'Contactos',
  icono: 'bi-people',
  items: [],
  busqueda: '',

  init: function(params) {
    console.log('💡 [contacto] Inicializado');
    this.cargarDatos();
  },

  render: function(params) {
    var self = this;
    return '' +
    '<div x-data="contactoData()" x-init="initData()" class="animate__animated animate__fadeInUp">' +
      '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
        '<div>' +
          '<h2 class="text-2xl font-bold flex items-center gap-2"><i class="bi bi-people-fill text-primary"></i> Contactos</h2>' +
          '<p class="text-sm text-base-content/50">Gestiona tus clientes y prospectos</p>' +
        '</div>' +
        '<button class="btn btn-primary" @click="abrirForm()">' +
          '<i class="bi bi-plus-lg"></i> Agregar contacto' +
        '</button>' +
      '</div>' +

      '<div class="flex flex-wrap gap-3 mb-4">' +
        '<label class="input input-bordered flex items-center gap-2 flex-1 min-w-[200px]">' +
          '<i class="bi bi-search text-base-content/40"></i>' +
          '<input type="search" x-model="busqueda" @input.debounce="filtrar()" placeholder="Buscar contactos..." class="grow bg-transparent outline-none">' +
        '</label>' +
        '<button class="btn btn-ghost" @click="exportar()" x-show="items.length">' +
          '<i class="bi bi-download"></i> Exportar' +
        '</button>' +
      '</div>' +

      '<!-- Skeleton -->' +
      '<template x-if="cargando">' +
        '<div class="space-y-3">' +
          '<div class="sk-el h-16 w-full"></div>' +
          '<div class="sk-el h-16 w-full"></div>' +
          '<div class="sk-el h-16 w-full"></div>' +
          '<div class="sk-el h-16 w-full"></div>' +
        '</div>' +
      '</template>' +

      '<!-- Lista -->' +
      '<template x-if="!cargando && filtrados.length">' +
        '<div class="overflow-x-auto rounded-xl border border-base-300">' +
          '<table class="table table-zebra">' +
            '<thead>' +
              '<tr>' +
                '<th>Nombre</th>' +
                '<th class="hidden md:table-cell">Empresa</th>' +
                '<th class="hidden lg:table-cell">Tel\u00e9fono</th>' +
                '<th class="hidden lg:table-cell">Email</th>' +
                '<th>Acciones</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<template x-for="item in filtrados" :key="item.id">' +
                '<tr class="hover">' +
                  '<td>' +
                    '<div class="flex items-center gap-3">' +
                      '<div class="avatar placeholder">' +
                        '<div class="w-9 rounded-full bg-primary text-primary-content text-xs font-bold">' +
                          '<span x-text="item.nombre ? item.nombre.charAt(0).toUpperCase() : \'?\'"></span>' +
                        '</div>' +
                      '</div>' +
                      '<div>' +
                        '<div class="font-medium" x-text="item.nombre"></div>' +
                        '<div class="text-xs text-base-content/50 md:hidden" x-text="item.empresa || \'\'"></div>' +
                      '</div>' +
                    '</div>' +
                  '</td>' +
                  '<td class="hidden md:table-cell text-base-content/70" x-text="item.empresa || \'—\'"></td>' +
                  '<td class="hidden lg:table-cell text-base-content/70" x-text="item.telefono || \'—\'"></td>' +
                  '<td class="hidden lg:table-cell text-base-content/70" x-text="item.email || \'—\'"></td>' +
                  '<td>' +
                    '<div class="flex gap-1">' +
                      '<button class="btn btn-sm btn-ghost btn-square" @click="verHistorial(item)" title="Historial">' +
                        '<i class="bi bi-clock-history"></i>' +
                      '</button>' +
                      '<button class="btn btn-sm btn-ghost btn-square" @click="abrirForm(item)" title="Editar">' +
                        '<i class="bi bi-pencil"></i>' +
                      '</button>' +
                      '<button class="btn btn-sm btn-ghost btn-square text-error" @click="eliminar(item)" title="Eliminar">' +
                        '<i class="bi bi-trash"></i>' +
                      '</button>' +
                    '</div>' +
                  '</td>' +
                '</tr>' +
              '</template>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</template>' +

      '<!-- Empty state -->' +
      '<template x-if="!cargando && !filtrados.length">' +
        '<div class="flex flex-col items-center justify-center py-20 text-base-content/40">' +
          '<i class="bi bi-people text-6xl mb-4"></i>' +
          '<p class="text-lg mb-1 font-medium">No hay contactos a\u00fan</p>' +
          '<p class="text-sm mb-6">Agrega tu primer contacto para empezar</p>' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Agregar contacto' +
          '</button>' +
        '</div>' +
      '</template>' +

      '<!-- Modal Historial -->' +
      '<div x-show="showHistorial" x-cloak class="fixed inset-0 bg-base-300/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"' +
           '@click.away="showHistorial = false">' +
        '<div class="modal-box max-w-lg max-h-[80vh] overflow-y-auto">' +
          '<h3 class="font-bold text-lg mb-4 flex items-center gap-2">' +
            '<i class="bi bi-clock-history"></i> Historial: <span x-text="historialContacto?.nombre"></span>' +
          '</h3>' +
          '<template x-if="!historialItems.length">' +
            '<div class="text-center py-8 text-base-content/40">' +
              '<i class="bi bi-inbox text-4xl mb-2"></i>' +
              '<p>Sin interacciones registradas</p>' +
            '</div>' +
          '</template>' +
          '<template x-for="h in historialItems" :key="h.id">' +
            '<div class="flex gap-3 py-3 border-b border-base-200 last:border-0">' +
              '<div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"' +
                   ':class="{\'bg-info/20 text-info\': h.tipo === \'llamada\', \'bg-success/20 text-success\': h.tipo === \'email\', \'bg-warning/20 text-warning\': h.tipo === \'reunion\'}">' +
                '<i :class="\'bi \' + (h.tipo === \'llamada\' ? \'bi-telephone\' : h.tipo === \'email\' ? \'bi-envelope\' : \'bi-person-lines-fill\')"></i>' +
              '</div>' +
              '<div class="flex-1">' +
                '<p class="text-sm font-medium capitalize" x-text="h.tipo"></p>' +
                '<p class="text-xs text-base-content/60" x-text="h.nota"></p>' +
                '<p class="text-xs text-base-content/40 mt-1" x-text="UI.formatRelative(h.createdAt)"></p>' +
              '</div>' +
            '</div>' +
          '</template>' +
          '<div class="modal-action">' +
            '<button class="btn btn-ghost" @click="showHistorial = false">Cerrar</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  },

  destroy: function() {
    // Cleanup
  },

  cargarDatos: function() {
    var self = this;
    return db.contactos.orderBy('nombre').toArray().then(function(items) {
      self.items = items;
      // Descifrar campos sensibles
      self.items.forEach(function(c) {
        if (c.email && cryptoHelpers.esCifrado(c.email)) c.email = cryptoHelpers.decrypt(c.email);
        if (c.telefono && cryptoHelpers.esCifrado(c.telefono)) c.telefono = cryptoHelpers.decrypt(c.telefono);
        if (c.notas && cryptoHelpers.esCifrado(c.notas)) c.notas = cryptoHelpers.decrypt(c.notas);
      });
      self.filtrar();
    }).catch(function(e) {
      console.error('Error cargando contactos:', e);
    });
  },

  filtrar: function() {
    // Se maneja via Alpine
  },

  abrirForm: function(item) {
    var editando = !!item;
    var nombre = item ? item.nombre : '';
    var empresa = item ? item.empresa || '' : '';
    var telefono = item ? item.telefono || '' : '';
    var email = item ? item.email || '' : '';
    var notas = item ? item.notas || '' : '';

    var html = '' +
      '<div class="space-y-4">' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Nombre *</span>' +
            '<input type="text" name="nombre" value="' + this._escHtml(nombre) + '" required class="input input-bordered w-full" placeholder="Nombre del contacto">' +
          '</label>' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Empresa</span>' +
            '<input type="text" name="empresa" value="' + this._escHtml(empresa) + '" class="input input-bordered w-full" placeholder="Empresa o negocio">' +
          '</label>' +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Tel\u00e9fono</span>' +
            '<input type="tel" name="telefono" value="' + this._escHtml(telefono) + '" class="input input-bordered w-full" placeholder="+52 555 123 4567">' +
          '</label>' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Email</span>' +
            '<input type="email" name="email" value="' + this._escHtml(email) + '" class="input input-bordered w-full" placeholder="correo@ejemplo.com">' +
          '</label>' +
        '</div>' +
        '<label class="form-control w-full">' +
          '<span class="label-text font-medium">Notas</span>' +
          '<textarea name="notas" class="textarea textarea-bordered h-24" placeholder="Informaci\u00f3n adicional...">' + this._escHtml(notas) + '</textarea>' +
        '</label>' +
      '</div>';

    UI.modalForm(
      editando ? 'Editar contacto' : 'Nuevo contacto',
      html,
      function(data) {
        if (!data.nombre || !data.nombre.trim()) {
          throw new Error('El nombre es obligatorio');
        }
        var datos = {
          nombre: data.nombre.trim(),
          empresa: data.empresa || '',
          telefono: cryptoHelpers.encrypt(data.telefono || ''),
          email: cryptoHelpers.encrypt(data.email || ''),
          notas: data.notas || ''
        };
        if (editando) {
          return ModuloContacto.actualizar(item.id, datos);
        } else {
          return ModuloContacto.guardar(datos);
        }
      }
    );
  },

  guardar: function(datos) {
    var registro = {
      id: uuid(),
      nombre: datos.nombre,
      empresa: datos.empresa,
      telefono: datos.telefono,
      email: datos.email,
      notas: datos.notas,
      createdBy: APP_CONFIG?.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return db.contactos.put(registro).then(function() {
      UI.toast('Contacto guardado', 'success');
      ModuloContacto.cargarDatos();
    }).catch(function(e) {
      UI.toast('Error al guardar: ' + e.message, 'error');
    });
  },

  actualizar: function(id, datos) {
    return db.contactos.get(id).then(function(existente) {
      if (!existente) { UI.toast('Contacto no encontrado', 'error'); return; }
      var actualizado = {
        id: id,
        nombre: datos.nombre,
        empresa: datos.empresa,
        telefono: datos.telefono,
        email: datos.email,
        notas: datos.notas,
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.contactos.put(actualizado).then(function() {
        UI.toast('Contacto actualizado', 'success');
        ModuloContacto.cargarDatos();
      });
    });
  },

  eliminar: function(item) {
    var self = this;
    UI.confirm('Eliminar a ' + item.nombre + '? Se borrar\u00e1n todos sus datos.').then(function(ok) {
      if (!ok) return;
      db.contactos.delete(item.id).then(function() {
        // Eliminar interacciones asociadas
        db.interacciones.where('contactoId').equals(item.id).delete().then(function() {
          UI.toast('Contacto eliminado', 'success');
          self.cargarDatos();
        });
      }).catch(function(e) {
        UI.toast('Error al eliminar: ' + e.message, 'error');
      });
    });
  },

  _escHtml: function(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['contacto'] = ModuloContacto;

// Alpine data function
function contactoData() {
  return {
    items: [],
    filtrados: [],
    busqueda: '',
    cargando: true,
    showHistorial: false,
    historialContacto: null,
    historialItems: [],

    initData: function() {
      var self = this;
      this.cargando = true;
      ModuloContacto.cargarDatos = function() {
        db.contactos.orderBy('nombre').toArray().then(function(items) {
          ModuloContacto.items = items;
          items.forEach(function(c) {
            if (c.email && cryptoHelpers.esCifrado(c.email)) c.email = cryptoHelpers.decrypt(c.email);
            if (c.telefono && cryptoHelpers.esCifrado(c.telefono)) c.telefono = cryptoHelpers.decrypt(c.telefono);
            if (c.notas && cryptoHelpers.esCifrado(c.notas)) c.notas = cryptoHelpers.decrypt(c.notas);
          });
          self.items = items;
          self.filtrar();
          self.cargando = false;
        }).catch(function(e) {
          console.error(e);
          self.cargando = false;
        });
      };
      ModuloContacto.cargarDatos();
    },

    filtrar: function() {
      var q = (this.busqueda || '').toLowerCase().trim();
      if (!q) {
        this.filtrados = this.items;
        return;
      }
      this.filtrados = this.items.filter(function(c) {
        return (c.nombre && c.nombre.toLowerCase().indexOf(q) !== -1) ||
               (c.empresa && c.empresa.toLowerCase().indexOf(q) !== -1) ||
               (c.email && c.email.toLowerCase().indexOf(q) !== -1) ||
               (c.telefono && c.telefono.indexOf(q) !== -1);
      });
    },

    abrirForm: function(item) {
      ModuloContacto.abrirForm(item);
    },

    verHistorial: function(contacto) {
      var self = this;
      this.historialContacto = contacto;
      db.interacciones.where('contactoId').equals(contacto.id).reverse().sortBy('createdAt').then(function(items) {
        self.historialItems = items;
        self.showHistorial = true;
      });
    },

    eliminar: function(item) {
      ModuloContacto.eliminar(item);
    },

    exportar: function() {
      var csv = 'Nombre,Empresa,Telefono,Email,Notas\n';
      this.filtrados.forEach(function(c) {
        csv += '"' + (c.nombre || '') + '","' + (c.empresa || '') + '","' + (c.telefono || '') + '","' + (c.email || '') + '","' + (c.notas || '') + '"\n';
      });
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'contactos-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.toast('CSV exportado', 'success');
    }
  };
}
