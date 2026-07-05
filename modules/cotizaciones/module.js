// modules/cotizaciones/module.js — Cotizaciones con PDF
var ModuloCotizaciones = {
  id: 'cotizaciones',
  titulo: 'Cotizaciones',
  icono: 'bi-file-text',
  items: [],
  estados: ['borrador', 'enviada', 'aceptada', 'rechazada'],

  init: function(params) {
    console.log('💡 [cotizaciones] Inicializado');
    this.cargarDatos();
  },

  render: function(params) {
    var self = this;
    return '' +
    '<div x-data="cotizacionesData()" x-init="initData()" class="animate__animated animate__fadeInUp">' +
      '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
        '<div>' +
          '<h2 class="text-2xl font-bold flex items-center gap-2"><i class="bi bi-file-text-fill text-primary"></i> Cotizaciones</h2>' +
          '<p class="text-sm text-base-content/50">Crea cotizaciones desde tus deals</p>' +
        '</div>' +
        '<button class="btn btn-primary" @click="abrirForm()">' +
          '<i class="bi bi-plus-lg"></i> Nueva cotizaci\u00f3n' +
        '</button>' +
      '</div>' +

      '<div class="flex flex-wrap gap-3 mb-4">' +
        '<label class="input input-bordered flex items-center gap-2 flex-1 min-w-[200px]">' +
          '<i class="bi bi-search text-base-content/40"></i>' +
          '<input type="search" x-model="busqueda" @input.debounce="filtrar()" placeholder="Buscar cotizaciones..." class="grow bg-transparent outline-none">' +
        '</label>' +
        '<select x-model="filtroEstado" @change="filtrar()" class="select select-bordered select-sm">' +
          '<option value="">Todos los estados</option>' +
          '<option value="borrador">Borrador</option>' +
          '<option value="enviada">Enviada</option>' +
          '<option value="aceptada">Aceptada</option>' +
          '<option value="rechazada">Rechazada</option>' +
        '</select>' +
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
                '<th>Deal / Servicio</th>' +
                '<th class="hidden md:table-cell">Items</th>' +
                '<th>Total</th>' +
                '<th class="hidden sm:table-cell">Estado</th>' +
                '<th>Acciones</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<template x-for="item in filtrados" :key="item.id">' +
                '<tr class="hover">' +
                  '<td>' +
                    '<div class="font-medium" x-text="item.dealNombre || \'Sin deal\'"></div>' +
                    '<div class="text-xs text-base-content/50" x-text="\'Cotizaci\u00f3n #\' + item.id.slice(0,8)"></div>' +
                  '</td>' +
                  '<td class="hidden md:table-cell text-base-content/70">' +
                    '<span x-text="(item.items ? item.items.length : 0) + \' items\'"></span>' +
                  '</td>' +
                  '<td class="font-semibold" x-text="UI.formatCurrency(item.total)"></td>' +
                  '<td class="hidden sm:table-cell">' +
                    '<span class="badge" :class="{\'badge-ghost\': item.estado === \'borrador\', \'badge-info\': item.estado === \'enviada\', \'badge-success\': item.estado === \'aceptada\', \'badge-error\': item.estado === \'rechazada\'}"' +
                          'x-text="item.estado || \'borrador\'"></span>' +
                  '</td>' +
                  '<td>' +
                    '<div class="flex gap-1">' +
                      '<button class="btn btn-sm btn-ghost btn-square" @click="verPDF(item)" title="Ver PDF">' +
                        '<i class="bi bi-file-earmark-pdf"></i>' +
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
          '<i class="bi bi-file-text text-6xl mb-4"></i>' +
          '<p class="text-lg mb-1 font-medium">No hay cotizaciones</p>' +
          '<p class="text-sm mb-6">Crea cotizaciones desde tus deals de venta</p>' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Nueva cotizaci\u00f3n' +
          '</button>' +
        '</div>' +
      '</template>' +
    '</div>';
  },

  destroy: function() {
    // Cleanup
  },

  cargarDatos: function() {
    var self = this;
    return db.cotizaciones.orderBy('createdAt').reverse().toArray().then(function(items) {
      var promises = items.map(function(c) {
        if (c.dealId) {
          return db.deals.get(c.dealId).then(function(d) {
            c.dealNombre = d ? d.nombre : 'Deal eliminado';
            return c;
          });
        }
        c.dealNombre = 'Sin deal';
        return Promise.resolve(c);
      });
      return Promise.all(promises);
    }).then(function(items) {
      self.items = items;
    }).catch(function(e) {
      console.error('Error cargando cotizaciones:', e);
    });
  },

  abrirForm: function(item) {
    var editando = !!item;
    var self = this;

    db.deals.toArray().then(function(deals) {
      var opts = '<option value="">Seleccionar deal (opcional)</option>';
      deals.forEach(function(d) {
        var sel = editando && item.dealId === d.id ? 'selected' : '';
        opts += '<option value="' + d.id + '" ' + sel + '>' + self._escHtml(d.nombre) + ' - ' + UI.formatCurrency(d.monto) + '</option>';
      });

      var itemsHtml = '';
      if (editando && item.items && item.items.length) {
        item.items.forEach(function(it, idx) {
          itemsHtml += '' +
            '<div class="item-row grid grid-cols-12 gap-2 items-end border-b border-base-200 pb-3">' +
              '<div class="col-span-5"><input type="text" name="item_servicio_' + idx + '" value="' + self._escHtml(it.servicio) + '" class="input input-bordered input-sm w-full" placeholder="Servicio"></div>' +
              '<div class="col-span-2"><input type="number" name="item_cantidad_' + idx + '" value="' + (it.cantidad || 1) + '" min="1" class="input input-bordered input-sm w-full" placeholder="Cant"></div>' +
              '<div class="col-span-3"><input type="number" name="item_precio_' + idx + '" value="' + (it.precio || 0) + '" step="0.01" min="0" class="input input-bordered input-sm w-full" placeholder="Precio"></div>' +
              '<div class="col-span-2 text-right text-sm font-medium">$' + ((it.cantidad || 0) * (it.precio || 0)).toFixed(0) + '</div>' +
            '</div>';
        });
      } else {
        itemsHtml = '' +
          '<div class="item-row grid grid-cols-12 gap-2 items-end border-b border-base-200 pb-3">' +
            '<div class="col-span-5"><input type="text" name="item_servicio_0" class="input input-bordered input-sm w-full" placeholder="Servicio"></div>' +
            '<div class="col-span-2"><input type="number" name="item_cantidad_0" value="1" min="1" class="input input-bordered input-sm w-full" placeholder="Cant"></div>' +
            '<div class="col-span-3"><input type="number" name="item_precio_0" value="0" step="0.01" min="0" class="input input-bordered input-sm w-full" placeholder="Precio"></div>' +
            '<div class="col-span-2 text-right text-sm font-medium">$0</div>' +
          '</div>';
      }

      var estadosOptions = '';
      self.estados.forEach(function(e) {
        var sel = editando && item.estado === e ? 'selected' : '';
        estadosOptions += '<option value="' + e + '" ' + sel + '>' + e.charAt(0).toUpperCase() + e.slice(1) + '</option>';
      });

      var html = '' +
        '<div class="space-y-4">' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Deal asociado</span>' +
            '<select name="dealId" class="select select-bordered w-full">' + opts + '</select>' +
          '</label>' +
          '<div>' +
            '<div class="flex items-center justify-between mb-2">' +
              '<span class="label-text font-medium">Items de la cotizaci\u00f3n</span>' +
              '<button type="button" class="btn btn-ghost btn-xs" onclick="document.querySelector(\'#items-container\').insertAdjacentHTML(\'beforeend\', \'' +
                '<div class=\\\\"item-row grid grid-cols-12 gap-2 items-end border-b border-base-200 pb-3\\\">' +
                  '<div class=\\\\"col-span-5\\\"><input type=\\\\"text\\\" name=\\\\"item_servicio_\\\" class=\\\\"input input-bordered input-sm w-full\\\" placeholder=\\\\"Servicio\\\"></div>' +
                  '<div class=\\\\"col-span-2\\\"><input type=\\\\"number\\\" name=\\\\"item_cantidad_\\\" value=\\\\"1\\\" min=\\\\"1\\\" class=\\\\"input input-bordered input-sm w-full\\\" placeholder=\\\\"Cant\\\"></div>' +
                  '<div class=\\\\"col-span-3\\\"><input type=\\\\"number\\\" name=\\\\"item_precio_\\\" value=\\\\"0\\\" step=\\\\"0.01\\\" min=\\\\"0\\\" class=\\\\"input input-bordered input-sm w-full\\\" placeholder=\\\\"Precio\\\"></div>' +
                  '<div class=\\\\"col-span-2 flex gap-1 items-center\\\"><button type=\\\\"button\\\" class=\\\\"btn btn-ghost btn-xs text-error\\\" onclick=\\\\"this.closest(\\\'.item-row\\\').remove()\\\"><i class=\\\\"bi bi-trash\\\"></i></button></div>' +
                '</div>\'); return false;">' +
              '<i class="bi bi-plus"></i> Agregar item' +
            '</button></div>' +
            '<div id="items-container" class="space-y-2">' + itemsHtml + '</div>' +
          '</div>' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Estado</span>' +
            '<select name="estado" class="select select-bordered w-full">' + estadosOptions + '</select>' +
          '</label>' +
        '</div>';

      UI.modalForm(
        editando ? 'Editar cotizaci\u00f3n' : 'Nueva cotizaci\u00f3n',
        html,
        function(data) {
          var items = [];
          var container = document.getElementById('items-container');
          if (container) {
            var rows = container.querySelectorAll('.item-row');
            rows.forEach(function(row) {
              var inputs = row.querySelectorAll('input');
              if (inputs.length >= 3) {
                var servicio = inputs[0].value.trim();
                var cantidad = parseInt(inputs[1].value) || 1;
                var precio = parseFloat(inputs[2].value) || 0;
                if (servicio) {
                  items.push({ servicio: servicio, cantidad: cantidad, precio: precio });
                }
              }
            });
          }
          if (!items.length) throw new Error('Agrega al menos un item');
          var total = items.reduce(function(sum, it) { return sum + (it.cantidad * it.precio); }, 0);
          if (editando) {
            return ModuloCotizaciones.actualizar(item.id, {
              dealId: data.dealId || '',
              items: items,
              total: total,
              estado: data.estado || 'borrador'
            });
          } else {
            return ModuloCotizaciones.guardar({
              dealId: data.dealId || '',
              items: items,
              total: total,
              estado: data.estado || 'borrador'
            });
          }
        }
      );
    });
  },

  guardar: function(datos) {
    var registro = {
      id: uuid(),
      dealId: datos.dealId || '',
      items: datos.items,
      total: datos.total,
      pdfGenerado: false,
      estado: datos.estado || 'borrador',
      createdBy: APP_CONFIG?.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return db.cotizaciones.put(registro).then(function() {
      UI.toast('Cotizaci\u00f3n guardada', 'success');
      ModuloCotizaciones.cargarDatos();
    }).catch(function(e) {
      UI.toast('Error: ' + e.message, 'error');
    });
  },

  actualizar: function(id, datos) {
    return db.cotizaciones.get(id).then(function(existente) {
      if (!existente) { UI.toast('Cotizaci\u00f3n no encontrada', 'error'); return; }
      var actualizado = {
        id: id,
        dealId: datos.dealId,
        items: datos.items,
        total: datos.total,
        pdfGenerado: existente.pdfGenerado,
        estado: datos.estado || 'borrador',
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.cotizaciones.put(actualizado).then(function() {
        UI.toast('Cotizaci\u00f3n actualizada', 'success');
        ModuloCotizaciones.cargarDatos();
      });
    });
  },

  generarPDF: function(item) {
    var self = this;
    try {
      var doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text('AHA CRM', 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Cotizaci\u00f3n #' + item.id.slice(0, 8).toUpperCase(), 14, 30);
      doc.text('Fecha: ' + UI.formatDate(item.createdAt), 14, 36);
      doc.text('Estado: ' + (item.estado || 'borrador'), 14, 42);

      if (item.dealId) {
        db.deals.get(item.dealId).then(function(deal) {
          if (deal) {
            doc.text('Deal: ' + deal.nombre, 14, 48);
            if (deal.contactoId) {
              db.contactos.get(deal.contactoId).then(function(c) {
                if (c) {
                  doc.text('Cliente: ' + c.nombre, 14, 54);
                  doc.text('Empresa: ' + (c.empresa || '—'), 14, 60);
                }
                self._generarTablaPDF(doc, item, 66);
              });
            } else {
              self._generarTablaPDF(doc, item, 48);
            }
          } else {
            self._generarTablaPDF(doc, item, 48);
          }
        });
      } else {
        self._generarTablaPDF(doc, item, 48);
      }
    } catch(e) {
      UI.toast('Error generando PDF: ' + e.message, 'error');
    }
  },

  _generarTablaPDF: function(doc, item, startY) {
    var y = startY;
    doc.setFontSize(10);
    doc.setTextColor(60);

    // Encabezados
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(255);
    doc.rect(14, y, 180, 7, 'F');
    doc.text('Servicio', 16, y + 5);
    doc.text('Cant.', 130, y + 5);
    doc.text('Precio', 150, y + 5);
    doc.text('Subtotal', 170, y + 5);
    y += 10;

    doc.setTextColor(50);
    if (item.items && item.items.length) {
      item.items.forEach(function(it) {
        doc.text(it.servicio || '', 16, y);
        doc.text(String(it.cantidad || 1), 132, y);
        doc.text('$' + (it.precio || 0).toFixed(2), 150, y);
        doc.text('$' + ((it.cantidad || 0) * (it.precio || 0)).toFixed(2), 170, y);
        y += 8;
      });
    }

    // Total
    y += 4;
    doc.setDrawColor(37, 99, 235);
    doc.line(14, y, 194, y);
    y += 6;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total: $' + (item.total || 0).toFixed(2), 150, y);
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

    // Marcar PDF generado
    db.cotizaciones.get(item.id).then(function(c) {
      if (c) {
        c.pdfGenerado = true;
        db.cotizaciones.put(c);
      }
    });

    UI.toast('PDF generado', 'success');
  },

  eliminar: function(item) {
    UI.confirm('Eliminar esta cotizaci\u00f3n?').then(function(ok) {
      if (!ok) return;
      db.cotizaciones.delete(item.id).then(function() {
        UI.toast('Cotizaci\u00f3n eliminada', 'success');
        ModuloCotizaciones.cargarDatos();
      }).catch(function(e) {
        UI.toast('Error: ' + e.message, 'error');
      });
    });
  },

  _escHtml: function(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['cotizaciones'] = ModuloCotizaciones;

// Alpine data function
function cotizacionesData() {
  return {
    items: [],
    filtrados: [],
    busqueda: '',
    filtroEstado: '',
    cargando: true,

    initData: function() {
      var self = this;
      this.cargando = true;
      ModuloCotizaciones.cargarDatos = function() {
        return db.cotizaciones.orderBy('createdAt').reverse().toArray().then(function(items) {
          var promises = items.map(function(c) {
            if (c.dealId) {
              return db.deals.get(c.dealId).then(function(d) {
                c.dealNombre = d ? d.nombre : 'Deal eliminado';
                return c;
              });
            }
            c.dealNombre = 'Sin deal';
            return Promise.resolve(c);
          });
          return Promise.all(promises);
        }).then(function(items) {
          ModuloCotizaciones.items = items;
          self.items = items;
          self.filtrar();
          self.cargando = false;
        }).catch(function(e) {
          console.error(e);
          self.cargando = false;
        });
      };
      ModuloCotizaciones.cargarDatos();
    },

    filtrar: function() {
      var q = (this.busqueda || '').toLowerCase().trim();
      var estado = this.filtroEstado;
      this.filtrados = this.items.filter(function(c) {
        var matchNom = c.dealNombre && c.dealNombre.toLowerCase().indexOf(q) !== -1;
        var matchEst = !estado || c.estado === estado;
        return (!q || matchNom) && matchEst;
      });
    },

    abrirForm: function(item) {
      ModuloCotizaciones.abrirForm(item);
    },

    verPDF: function(item) {
      ModuloCotizaciones.generarPDF(item);
    },

    eliminar: function(item) {
      ModuloCotizaciones.eliminar(item);
    }
  };
}
