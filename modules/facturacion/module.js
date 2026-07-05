// modules/facturacion/module.js — Facturacion desde deals cerrados
var ModuloFacturacion = {
  id: 'facturacion',
  titulo: 'Facturaci\u00f3n',
  icono: 'bi-receipt',
  items: [],
  contadorFolio: 0,

  init: function(params) {
    console.log('💡 [facturacion] Inicializado');
    this.cargarDatos();
  },

  render: function(params) {
    var self = this;
    return '' +
    '<div x-data="facturacionData()" x-init="initData()" class="animate__animated animate__fadeInUp">' +
      '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
        '<div>' +
          '<h2 class="text-2xl font-bold flex items-center gap-2"><i class="bi bi-receipt-cutoff text-primary"></i> Facturaci\u00f3n</h2>' +
          '<p class="text-sm text-base-content/50">Genera facturas desde deals cerrados</p>' +
        '</div>' +
        '<button class="btn btn-primary" @click="generarDesdeDeal()" :disabled="!dealsCerrados.length">' +
          '<i class="bi bi-plus-lg"></i> Generar factura' +
        '</button>' +
      '</div>' +

      '<div class="flex flex-wrap gap-3 mb-4">' +
        '<select x-model="filtroEstado" @change="filtrar()" class="select select-bordered select-sm">' +
          '<option value="">Todos los estados</option>' +
          '<option value="pagada">Pagada</option>' +
          '<option value="pendiente">Pendiente</option>' +
          '<option value="vencida">Vencida</option>' +
        '</select>' +
        '<span class="text-sm text-base-content/50 self-center">' +
          'Total: <span class="font-semibold text-primary" x-text="UI.formatCurrency(totalGeneral)"></span>' +
        '</span>' +
      '</div>' +

      '<!-- Skeleton -->' +
      '<template x-if="cargando">' +
        '<div class="space-y-3">' +
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
                '<th>Folio</th>' +
                '<th class="hidden md:table-cell">Cliente</th>' +
                '<th>Total</th>' +
                '<th class="hidden sm:table-cell">Estado</th>' +
                '<th class="hidden md:table-cell">Fecha</th>' +
                '<th>Acciones</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<template x-for="item in filtrados" :key="item.id">' +
                '<tr class="hover">' +
                  '<td>' +
                    '<span class="font-mono font-medium" x-text="item.folio"></span>' +
                  '</td>' +
                  '<td class="hidden md:table-cell text-base-content/70" x-text="item.contactoNombre || \'—\'"></td>' +
                  '<td class="font-semibold" x-text="UI.formatCurrency(item.total)"></td>' +
                  '<td class="hidden sm:table-cell">' +
                    '<span class="badge" :class="{\'badge-success\': item.estado === \'pagada\', \'badge-warning\': item.estado === \'pendiente\', \'badge-error\': item.estado === \'vencida\'}"' +
                          'x-text="item.estado"></span>' +
                  '</td>' +
                  '<td class="hidden md:table-cell text-base-content/50 text-sm" x-text="UI.formatDate(item.createdAt)"></td>' +
                  '<td>' +
                    '<div class="flex gap-1">' +
                      '<button class="btn btn-sm btn-ghost btn-square" @click="toggleEstado(item)" :title="\'Cambiar a \' + (item.estado === \'pendiente\' ? \'pagada\' : \'pendiente\')">' +
                        '<i class="bi bi-check-circle"></i>' +
                      '</button>' +
                      '<button class="btn btn-sm btn-ghost btn-square" @click="exportPDF(item)" title="PDF">' +
                        '<i class="bi bi-file-earmark-pdf"></i>' +
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
          '<i class="bi bi-receipt text-6xl mb-4"></i>' +
          '<p class="text-lg mb-1 font-medium">No hay facturas</p>' +
          '<p class="text-sm mb-6">Genera facturas desde los deals cerrados</p>' +
          '<template x-if="dealsCerrados.length">' +
            '<button class="btn btn-primary" @click="generarDesdeDeal()">' +
              '<i class="bi bi-plus-lg"></i> Generar factura' +
            '</button>' +
          '</template>' +
          '<template x-if="!dealsCerrados.length">' +
            '<p class="text-xs">No hay deals cerrados disponibles. Cierra un deal en el pipeline primero.</p>' +
          '</template>' +
        '</div>' +
      '</template>' +
    '</div>';
  },

  destroy: function() {
    // Cleanup
  },

  cargarDatos: function() {
    var self = this;
    return db.facturas.orderBy('createdAt').reverse().toArray().then(function(items) {
      var promises = items.map(function(f) {
        if (f.contactoId) {
          return db.contactos.get(f.contactoId).then(function(c) {
            f.contactoNombre = c ? c.nombre : 'Cliente eliminado';
            return f;
          });
        }
        f.contactoNombre = 'Sin cliente';
        return Promise.resolve(f);
      });
      return Promise.all(promises);
    }).then(function(items) {
      self.items = items;
    }).catch(function(e) {
      console.error('Error cargando facturas:', e);
    });
  },

  generarFactura: function(deal, contacto) {
    var self = this;
    // Obtener ultimo folio
    return db.facturas.orderBy('folio').last().then(function(ultima) {
      var num = 1;
      if (ultima && ultima.folio) {
        var parts = ultima.folio.split('-');
        if (parts.length > 1) num = parseInt(parts[1]) + 1;
      }
      var folio = 'F-' + String(num).padStart(3, '0');

      var factura = {
        id: uuid(),
        dealId: deal.id,
        contactoId: contacto ? contacto.id : '',
        folio: folio,
        items: [],
        total: deal.monto || 0,
        estado: 'pendiente',
        createdBy: APP_CONFIG?.usuarioActual || 'anon',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return db.facturas.put(factura).then(function() {
        UI.toast('Factura ' + folio + ' generada', 'success');
        self.cargarDatos();
      });
    });
  },

  cambiarEstado: function(item) {
    var nuevoEstado = item.estado === 'pendiente' ? 'pagada' : 'pendiente';
    return db.facturas.get(item.id).then(function(f) {
      if (!f) return;
      f.estado = nuevoEstado;
      f.updatedAt = new Date();
      return db.facturas.put(f).then(function() {
        UI.toast('Factura ' + f.folio + ' marcada como ' + nuevoEstado, 'success');
        ModuloFacturacion.cargarDatos();
      });
    });
  },

  exportPDF: function(item) {
    try {
      var doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(37, 99, 235);
      doc.text('AHA CRM', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(60);
      doc.text('FACTURA ' + item.folio, 14, 32);
      doc.text('Fecha: ' + UI.formatDate(item.createdAt), 14, 38);
      doc.text('Estado: ' + (item.estado || 'pendiente'), 14, 44);

      if (item.contactoNombre) {
        doc.text('Cliente: ' + item.contactoNombre, 14, 50);
      }

      doc.setDrawColor(37, 99, 235);
      doc.line(14, 56, 194, 56);

      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Total: $' + (item.total || 0).toFixed(2), 150, 66);
      doc.setFont(undefined, 'normal');

      var pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180);
        doc.text('Generado por AHA CRM — ' + UI.formatDate(new Date()), 14, doc.internal.pageSize.height - 10);
      }

      var pdfBlob = doc.output('blob');
      var url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      UI.toast('PDF generado', 'success');
    } catch(e) {
      UI.toast('Error generando PDF: ' + e.message, 'error');
    }
  },

  eliminar: function(item) {
    UI.confirm('Eliminar factura ' + item.folio + '?').then(function(ok) {
      if (!ok) return;
      db.facturas.delete(item.id).then(function() {
        UI.toast('Factura eliminada', 'success');
        ModuloFacturacion.cargarDatos();
      });
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['facturacion'] = ModuloFacturacion;

// Alpine data function
function facturacionData() {
  return {
    items: [],
    filtrados: [],
    filtroEstado: '',
    cargando: true,
    dealsCerrados: [],

    get totalGeneral() {
      return this.filtrados.reduce(function(s, f) { return s + (parseFloat(f.total) || 0); }, 0);
    },

    initData: function() {
      var self = this;
      this.cargando = true;
      ModuloFacturacion.cargarDatos = function() {
        return db.facturas.orderBy('createdAt').reverse().toArray().then(function(items) {
          var promises = items.map(function(f) {
            if (f.contactoId) {
              return db.contactos.get(f.contactoId).then(function(c) {
                f.contactoNombre = c ? c.nombre : 'Cliente eliminado';
                return f;
              });
            }
            f.contactoNombre = 'Sin cliente';
            return Promise.resolve(f);
          });
          return Promise.all(promises);
        }).then(function(items) {
          ModuloFacturacion.items = items;
          self.items = items;
          self.filtrar();
          self.cargando = false;
        }).catch(function(e) {
          console.error(e);
          self.cargando = false;
        });
      };
      ModuloFacturacion.cargarDatos();

      // Obtener deals cerrados
      db.deals.where('etapa').equals('cerrado').toArray().then(function(deals) {
        self.dealsCerrados = deals;
      });
    },

    filtrar: function() {
      if (!this.filtroEstado) {
        this.filtrados = this.items;
      } else {
        var self = this;
        this.filtrados = this.items.filter(function(f) { return f.estado === self.filtroEstado; });
      }
    },

    generarDesdeDeal: function() {
      var self = this;
      db.deals.where('etapa').equals('cerrado').toArray().then(function(deals) {
        if (!deals.length) {
          UI.toast('No hay deals cerrados disponibles', 'warning');
          return;
        }
        // Mostrar selector de deals
        var opts = '';
        var promises = deals.map(function(d) {
          if (d.contactoId) {
            return db.contactos.get(d.contactoId).then(function(c) {
              d.contactoNombre = c ? c.nombre : 'Desconocido';
              return d;
            });
          }
          d.contactoNombre = 'Sin contacto';
          return Promise.resolve(d);
        });
        Promise.all(promises).then(function(dealsConNombre) {
          dealsConNombre.forEach(function(d) {
            opts += '<option value="' + d.id + '">' + self._esc(d.nombre) + ' (' + self._esc(d.contactoNombre) + ') - $' + (d.monto || 0).toFixed(2) + '</option>';
          });
          var html = '' +
            '<div class="space-y-4">' +
              '<label class="form-control">' +
                '<span class="label-text font-medium">Seleccionar deal cerrado</span>' +
                '<select id="deal-select" class="select select-bordered w-full">' + opts + '</select>' +
              '</label>' +
              '<div class="alert alert-info"><i class="bi bi-info-circle"></i> Se generar\u00e1 una factura con el monto total del deal.</div>' +
            '</div>';
          UI.modalForm('Generar factura desde deal', html, function(data) {
            var sel = document.getElementById('deal-select');
            var dealId = sel ? sel.value : '';
            if (!dealId) throw new Error('Selecciona un deal');
            var deal = dealsConNombre.find(function(d) { return d.id === dealId; });
            if (deal) {
              return db.contactos.get(deal.contactoId).then(function(c) {
                return ModuloFacturacion.generarFactura(deal, c);
              });
            }
            return Promise.resolve();
          });
        });
      });
    },

    toggleEstado: function(item) {
      ModuloFacturacion.cambiarEstado(item);
    },

    exportPDF: function(item) {
      ModuloFacturacion.exportPDF(item);
    },

    eliminar: function(item) {
      ModuloFacturacion.eliminar(item);
    },

    _esc: function(s) {
      if (!s) return '';
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  };
}
