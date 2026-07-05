// modules/pipeline/module.js — Pipeline Kanban con drag & drop nativo
var ModuloPipeline = {
  id: 'pipeline',
  titulo: 'Pipeline',
  icono: 'bi-kanban',
  items: [],
  etapas: ['prospecto', 'contactado', 'propuesta', 'negociacion', 'cerrado'],
  etapasLabels: {
    prospecto: 'Prospecto',
    contactado: 'Contactado',
    propuesta: 'Propuesta',
    negociacion: 'Negociaci\u00f3n',
    cerrado: 'Cerrado'
  },
  etapasColores: {
    prospecto: 'badge-ghost',
    contactado: 'badge-info',
    propuesta: 'badge-warning',
    negociacion: 'badge-secondary',
    cerrado: 'badge-success'
  },

  init: function(params) {
    console.log('💡 [pipeline] Inicializado');
    this.cargarDatos();
  },

  render: function(params) {
    var self = this;
    return '' +
    '<div x-data="pipelineData()" x-init="initData()" class="animate__animated animate__fadeInUp">' +
      '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
        '<div>' +
          '<h2 class="text-2xl font-bold flex items-center gap-2"><i class="bi bi-kanban-fill text-primary"></i> Pipeline de Ventas</h2>' +
          '<p class="text-sm text-base-content/50">Arrastra las tarjetas entre etapas</p>' +
        '</div>' +
        '<button class="btn btn-primary" @click="abrirForm()">' +
          '<i class="bi bi-plus-lg"></i> Nuevo deal' +
        '</button>' +
      '</div>' +

      '<!-- Skeleton -->' +
      '<template x-if="cargando">' +
        '<div class="flex gap-4 overflow-x-auto pb-4">' +
          '<template x-for="i in 5">' +
            '<div class="sk-el h-96 w-72 shrink-0"></div>' +
          '</template>' +
        '</div>' +
      '</template>' +

      '<!-- Kanban Board -->' +
      '<template x-if="!cargando">' +
        '<div class="flex gap-4 overflow-x-auto pb-4" style="scroll-snap-type: x proximity;">' +
          '<template x-for="etapa in etapas" :key="etapa.id">' +
            '<div class="kanban-column bg-base-100 rounded-2xl border border-base-300 p-4 w-72 shrink-0" style="scroll-snap-align: start;"' +
                 '@drop.prevent="onDrop($event, etapa.id)"' +
                 '@dragover.prevent="onDragOver($event)"' +
                 '@dragleave.prevent="onDragLeave($event)">' +
              '<div class="flex items-center justify-between mb-4">' +
                '<div class="flex items-center gap-2">' +
                  '<h3 class="font-semibold text-sm" x-text="etapa.label"></h3>' +
                  '<span class="badge badge-sm" :class="etapa.color" x-text="etapa.count"></span>' +
                '</div>' +
                '<button class="btn btn-ghost btn-xs btn-square" @click="abrirForm(null, etapa.id)" title="Agregar deal">' +
                  '<i class="bi bi-plus"></i>' +
                '</button>' +
              '</div>' +

              '<div class="space-y-3 min-h-[200px]">' +
                '<template x-for="deal in getDeals(etapa.id)" :key="deal.id">' +
                  '<div class="kanban-card bg-base-100 rounded-xl border border-base-200 p-4 shadow-sm hover:shadow-md transition-shadow"' +
                       'draggable="true"' +
                       '@dragstart="onDragStart($event, deal)"' +
                       '@dragend="onDragEnd($event)">' +
                    '<div class="flex items-start justify-between gap-2 mb-2">' +
                      '<h4 class="font-medium text-sm leading-tight" x-text="deal.nombre"></h4>' +
                      '<span class="text-sm font-bold text-primary shrink-0" x-text="UI.formatCurrency(deal.monto)"></span>' +
                    '</div>' +
                    '<div class="flex items-center gap-2 text-xs text-base-content/60 mb-2">' +
                      '<i class="bi bi-person"></i>' +
                      '<span x-text="deal.contactoNombre || \'Sin contacto\'"></span>' +
                    '</div>' +
                    '<div class="flex items-center justify-between">' +
                      '<div class="flex items-center gap-1">' +
                        '<div class="radial-progress text-xs shrink-0" :style="\'--value:\' + (deal.probabilidad || 0) + \';--size:1.5rem;--thickness:3px\'" ' +
                             ':class="deal.probabilidad >= 70 ? \'text-success\' : deal.probabilidad >= 40 ? \'text-warning\' : \'text-base-content/30\'">' +
                          '<span class="text-[8px]" x-text="deal.probabilidad + \'%\'"></span>' +
                        '</div>' +
                      '</div>' +
                      '<div class="flex gap-1">' +
                        '<button class="btn btn-ghost btn-xs btn-square" @click.stop="abrirForm(deal)" title="Editar">' +
                          '<i class="bi bi-pencil text-xs"></i>' +
                        '</button>' +
                        '<button class="btn btn-ghost btn-xs btn-square text-error" @click.stop="eliminar(deal)" title="Eliminar">' +
                          '<i class="bi bi-trash text-xs"></i>' +
                        '</button>' +
                      '</div>' +
                    '</div>' +
                    '<div x-show="deal.fechaCierre" class="mt-2 text-xs text-base-content/40 flex items-center gap-1">' +
                      '<i class="bi bi-calendar3"></i>' +
                      '<span x-text="UI.formatDate(deal.fechaCierre)"></span>' +
                    '</div>' +
                  '</div>' +
                '</template>' +
                '<template x-if="!getDeals(etapa.id).length">' +
                  '<div class="flex flex-col items-center justify-center py-8 text-base-content/30 text-xs gap-2">' +
                    '<i class="bi bi-inbox text-2xl"></i>' +
                    '<p>Sin deals</p>' +
                  '</div>' +
                '</template>' +
              '</div>' +
            '</div>' +
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
    return db.deals.orderBy('updatedAt').reverse().toArray().then(function(deals) {
      // Para cada deal, obtener nombre del contacto
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
      return Promise.all(promises);
    }).then(function(deals) {
      self.items = deals;
    }).catch(function(e) {
      console.error('Error cargando deals:', e);
    });
  },

  abrirForm: function(item, etapaInicial) {
    var editando = !!item;
    var nombre = item ? item.nombre || '' : '';
    var monto = item ? item.monto || '' : '';
    var probabilidad = item ? item.probabilidad || 20 : 20;
    var fechaCierre = item ? item.fechaCierre || '' : '';
    var contactoId = item ? item.contactoId || '' : '';

    var self = this;

    // Obtener contactos para el select
    db.contactos.toArray().then(function(contactos) {
      var options = '<option value="">Sin contacto</option>';
      contactos.forEach(function(c) {
        var selected = c.id === contactoId ? 'selected' : '';
        options += '<option value="' + c.id + '" ' + selected + '>' + self._escHtml(c.nombre) + '</option>';
      });

      var etapasOptions = '';
      self.etapas.forEach(function(e) {
        var selected = (editando && item.etapa === e) || (!editando && e === etapaInicial) ? 'selected' : '';
        etapasOptions += '<option value="' + e + '" ' + selected + '>' + self.etapasLabels[e] + '</option>';
      });

      var html = '' +
        '<div class="space-y-4">' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Nombre del deal *</span>' +
            '<input type="text" name="nombre" value="' + self._escHtml(nombre) + '" required class="input input-bordered w-full" placeholder="Ej: Plataforma Cloud">' +
          '</label>' +
          '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text font-medium">Monto $</span>' +
              '<input type="number" name="monto" value="' + monto + '" step="0.01" min="0" class="input input-bordered w-full" placeholder="0.00">' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text font-medium">Probabilidad %</span>' +
              '<input type="number" name="probabilidad" value="' + probabilidad + '" min="0" max="100" class="input input-bordered w-full">' +
            '</label>' +
          '</div>' +
          '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<label class="form-control w-full">' +
              '<span class="label-text font-medium">Contacto</span>' +
              '<select name="contactoId" class="select select-bordered w-full">' + options + '</select>' +
            '</label>' +
            '<label class="form-control w-full">' +
              '<span class="label-text font-medium">Fecha cierre</span>' +
              '<input type="date" name="fechaCierre" value="' + fechaCierre + '" class="input input-bordered w-full">' +
            '</label>' +
          '</div>' +
          '<label class="form-control w-full">' +
            '<span class="label-text font-medium">Etapa</span>' +
            '<select name="etapa" class="select select-bordered w-full">' + etapasOptions + '</select>' +
          '</label>' +
          '<div class="text-xs text-base-content/40">' +
            '<i class="bi bi-info-circle"></i> Los campos marcados con * son obligatorios' +
          '</div>' +
        '</div>';

      UI.modalForm(
        editando ? 'Editar deal' : 'Nuevo deal',
        html,
        function(data) {
          if (!data.nombre || !data.nombre.trim()) {
            throw new Error('El nombre del deal es obligatorio');
          }
          var datos = {
            nombre: data.nombre.trim(),
            monto: parseFloat(data.monto) || 0,
            probabilidad: parseInt(data.probabilidad) || 0,
            contactoId: data.contactoId || '',
            fechaCierre: data.fechaCierre || '',
            etapa: data.etapa || 'prospecto'
          };
          if (editando) {
            return ModuloPipeline.actualizar(item.id, datos);
          } else {
            return ModuloPipeline.guardar(datos);
          }
        }
      );
    });
  },

  guardar: function(datos) {
    var registro = {
      id: uuid(),
      nombre: datos.nombre,
      monto: datos.monto,
      probabilidad: datos.probabilidad,
      contactoId: datos.contactoId || '',
      fechaCierre: datos.fechaCierre || '',
      etapa: datos.etapa || 'prospecto',
      createdBy: APP_CONFIG?.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return db.deals.put(registro).then(function() {
      UI.toast('Deal creado', 'success');
      ModuloPipeline.cargarDatos();
    }).catch(function(e) {
      UI.toast('Error al guardar: ' + e.message, 'error');
    });
  },

  actualizar: function(id, datos) {
    return db.deals.get(id).then(function(existente) {
      if (!existente) { UI.toast('Deal no encontrado', 'error'); return; }
      var actualizado = {
        id: id,
        nombre: datos.nombre,
        monto: datos.monto,
        probabilidad: datos.probabilidad,
        contactoId: datos.contactoId,
        fechaCierre: datos.fechaCierre,
        etapa: datos.etapa,
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.deals.put(actualizado).then(function() {
        UI.toast('Deal actualizado', 'success');
        ModuloPipeline.cargarDatos();
      });
    });
  },

  moverEtapa: function(dealId, nuevaEtapa) {
    return db.deals.get(dealId).then(function(deal) {
      if (!deal) return;
      deal.etapa = nuevaEtapa;
      deal.updatedAt = new Date();
      return db.deals.put(deal).then(function() {
        ModuloPipeline.cargarDatos();
      });
    });
  },

  eliminar: function(item) {
    UI.confirm('Eliminar deal "' + item.nombre + '"?').then(function(ok) {
      if (!ok) return;
      db.deals.delete(item.id).then(function() {
        UI.toast('Deal eliminado', 'success');
        ModuloPipeline.cargarDatos();
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
window.MODULES['pipeline'] = ModuloPipeline;

// Alpine data function
function pipelineData() {
  return {
    items: [],
    cargando: true,
    dragItem: null,
    etapas: [
      { id: 'prospecto', label: 'Prospecto', color: 'badge-ghost', count: 0 },
      { id: 'contactado', label: 'Contactado', color: 'badge-info', count: 0 },
      { id: 'propuesta', label: 'Propuesta', color: 'badge-warning', count: 0 },
      { id: 'negociacion', label: 'Negociaci\u00f3n', color: 'badge-secondary', count: 0 },
      { id: 'cerrado', label: 'Cerrado', color: 'badge-success', count: 0 }
    ],

    initData: function() {
      var self = this;
      this.cargando = true;
      ModuloPipeline.cargarDatos = function() {
        return db.deals.orderBy('updatedAt').reverse().toArray().then(function(deals) {
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
          return Promise.all(promises);
        }).then(function(deals) {
          ModuloPipeline.items = deals;
          self.items = deals;
          self.actualizarContadores();
          self.cargando = false;
        }).catch(function(e) {
          console.error(e);
          self.cargando = false;
        });
      };
      ModuloPipeline.cargarDatos();
    },

    actualizarContadores: function() {
      var self = this;
      this.etapas.forEach(function(e) {
        e.count = self.items.filter(function(d) { return d.etapa === e.id; }).length;
      });
    },

    getDeals: function(etapa) {
      return this.items.filter(function(d) { return d.etapa === etapa; });
    },

    onDragStart: function(e, deal) {
      this.dragItem = deal.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', deal.id);
      setTimeout(function() {
        if (e.target) e.target.classList.add('dragging');
      }, 0);
    },

    onDragEnd: function(e) {
      if (e.target) e.target.classList.remove('dragging');
      this.dragItem = null;
    },

    onDragOver: function(e) {
      e.currentTarget.classList.add('drag-over');
    },

    onDragLeave: function(e) {
      e.currentTarget.classList.remove('drag-over');
    },

    onDrop: function(e, etapa) {
      e.currentTarget.classList.remove('drag-over');
      var dealId = e.dataTransfer.getData('text/plain');
      if (dealId) {
        ModuloPipeline.moverEtapa(dealId, etapa);
      }
    },

    abrirForm: function(item, etapaInicial) {
      ModuloPipeline.abrirForm(item, etapaInicial);
    },

    eliminar: function(item) {
      ModuloPipeline.eliminar(item);
    }
  };
}
