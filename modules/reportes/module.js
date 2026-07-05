// modules/reportes/module.js — Reportes y graficos Chart.js
var ModuloReportes = {
  id: 'reportes',
  titulo: 'Reportes',
  icono: 'bi-bar-chart',

  init: function(params) {
    console.log('💡 [reportes] Inicializado');
  },

  render: function(params) {
    return '' +
    '<div x-data="reportesData()" x-init="initData()" class="animate__animated animate__fadeInUp">' +
      '<div class="flex flex-wrap items-center justify-between gap-3 mb-6">' +
        '<div>' +
          '<h2 class="text-2xl font-bold flex items-center gap-2"><i class="bi bi-bar-chart-fill text-primary"></i> Reportes</h2>' +
          '<p class="text-sm text-base-content/50">Visualiza el rendimiento de tus ventas</p>' +
        '</div>' +
        '<div class="flex gap-2">' +
          '<button class="btn btn-ghost btn-sm" @click="exportCSV">' +
            '<i class="bi bi-download"></i> Exportar CSV' +
          '</button>' +
          '<select x-model="mesSeleccionado" @change="actualizarGraficos()" class="select select-bordered select-sm">' +
            '<template x-for="m in mesesDisponibles">' +
              '<option :value="m.value" x-text="m.label"></option>' +
            '</template>' +
          '</select>' +
        '</div>' +
      '</div>' +

      '<!-- Skeleton -->' +
      '<template x-if="cargando">' +
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
          '<div class="sk-el h-72 w-full"></div>' +
          '<div class="sk-el h-72 w-full"></div>' +
        '</div>' +
      '</template>' +

      '<template x-if="!cargando">' +
        '<div class="space-y-6">' +
          '<!-- Stats cards -->' +
          '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
            '<div class="stat bg-base-100 rounded-2xl border border-base-300 p-4 shadow-sm">' +
              '<div class="stat-title text-xs text-base-content/50">Total deals</div>' +
              '<div class="stat-value text-2xl text-primary" x-text="stats.totalDeals"></div>' +
            '</div>' +
            '<div class="stat bg-base-100 rounded-2xl border border-base-300 p-4 shadow-sm">' +
              '<div class="stat-title text-xs text-base-content/50">Cerrados</div>' +
              '<div class="stat-value text-2xl text-success" x-text="stats.cerrados"></div>' +
            '</div>' +
            '<div class="stat bg-base-100 rounded-2xl border border-base-300 p-4 shadow-sm">' +
              '<div class="stat-title text-xs text-base-content/50">En pipeline</div>' +
              '<div class="stat-value text-2xl text-info" x-text="stats.enPipeline"></div>' +
            '</div>' +
            '<div class="stat bg-base-100 rounded-2xl border border-base-300 p-4 shadow-sm">' +
              '<div class="stat-title text-xs text-base-content/50">Ingresos</div>' +
              '<div class="stat-value text-2xl text-secondary" x-text="UI.formatCurrency(stats.ingresos)"></div>' +
            '</div>' +
          '</div>' +

          '<!-- Graficos -->' +
          '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
            '<div class="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">' +
              '<h3 class="font-semibold mb-4 flex items-center gap-2">' +
                '<i class="bi bi-funnel text-primary"></i> Conversi\u00f3n por etapa (funnel)' +
              '</h3>' +
              '<canvas id="funnelChart" class="w-full h-64"></canvas>' +
            '</div>' +
            '<div class="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">' +
              '<h3 class="font-semibold mb-4 flex items-center gap-2">' +
                '<i class="bi bi-coin text-secondary"></i> Ingresos del mes por cliente' +
              '</h3>' +
              '<canvas id="ingresosChart" class="w-full h-64"></canvas>' +
            '</div>' +
          '</div>' +

          '<!-- Tabla de deals cerrados -->' +
          '<div class="bg-base-100 rounded-2xl border border-base-300 p-5 shadow-sm">' +
            '<h3 class="font-semibold mb-4 flex items-center gap-2">' +
              '<i class="bi bi-check-circle text-success"></i> Deals cerrados este mes' +
            '</h3>' +
            '<template x-if="dealsCerrados.length">' +
              '<div class="overflow-x-auto">' +
                '<table class="table table-sm">' +
                  '<thead>' +
                    '<tr>' +
                      '<th>Deal</th>' +
                      '<th>Cliente</th>' +
                      '<th>Monto</th>' +
                      '<th>Fecha cierre</th>' +
                    '</tr>' +
                  '</thead>' +
                  '<tbody>' +
                    '<template x-for="d in dealsCerrados" :key="d.id">' +
                      '<tr>' +
                        '<td x-text="d.nombre"></td>' +
                        '<td x-text="d.contactoNombre || \'—\'"></td>' +
                        '<td class="font-medium" x-text="UI.formatCurrency(d.monto)"></td>' +
                        '<td class="text-base-content/50 text-sm" x-text="UI.formatDate(d.fechaCierre)"></td>' +
                      '</tr>' +
                    '</template>' +
                  '</tbody>' +
                '</table>' +
              '</div>' +
            '</template>' +
            '<template x-if="!dealsCerrados.length">' +
              '<p class="text-sm text-base-content/40 text-center py-4">No hay deals cerrados este mes</p>' +
            '</template>' +
          '</div>' +
        '</div>' +
      '</template>' +
    '</div>';
  },

  destroy: function() {
    // Destruir graficos si existen
    if (window._funnelChart) { window._funnelChart.destroy(); window._funnelChart = null; }
    if (window._ingresosChart) { window._ingresosChart.destroy(); window._ingresosChart = null; }
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['reportes'] = ModuloReportes;

// Alpine data function
function reportesData() {
  return {
    cargando: true,
    stats: { totalDeals: 0, cerrados: 0, enPipeline: 0, ingresos: 0 },
    dealsCerrados: [],
    mesesDisponibles: [],
    mesSeleccionado: '',

    initData: function() {
      var self = this;
      this.cargando = true;

      // Generar meses disponibles
      var meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      var now = new Date();
      for (var i = 0; i < 6; i++) {
        var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        var val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        this.mesesDisponibles.push({ value: val, label: meses[d.getMonth()] + ' ' + d.getFullYear() });
      }
      this.mesSeleccionado = this.mesesDisponibles[0].value;

      this.actualizarGraficos();
    },

    actualizarGraficos: function() {
      var self = this;
      this.cargando = true;

      db.deals.toArray().then(function(deals) {
        // Stats generales
        var stats = {
          totalDeals: deals.length,
          cerrados: deals.filter(function(d) { return d.etapa === 'cerrado'; }).length,
          enPipeline: deals.filter(function(d) { return d.etapa !== 'cerrado'; }).length,
          ingresos: deals.filter(function(d) { return d.etapa === 'cerrado'; }).reduce(function(s, d) { return s + (parseFloat(d.monto) || 0); }, 0)
        };
        self.stats = stats;

        // Funnel data por etapa
        var etapas = ['prospecto', 'contactado', 'propuesta', 'negociacion', 'cerrado'];
        var etapaLabels = { prospecto: 'Prospecto', contactado: 'Contactado', propuesta: 'Propuesta', negociacion: 'Negociaci\u00f3n', cerrado: 'Cerrado' };
        var etapaColores = {
          prospecto: 'rgba(156, 163, 175, 0.7)',
          contactado: 'rgba(59, 130, 246, 0.7)',
          propuesta: 'rgba(245, 158, 11, 0.7)',
          negociacion: 'rgba(139, 92, 246, 0.7)',
          cerrado: 'rgba(34, 197, 94, 0.7)'
        };
        var counts = etapas.map(function(e) {
          return deals.filter(function(d) { return d.etapa === e; }).length;
        });

        // Ingresos del mes por cliente
        var mes = self.mesSeleccionado;
        var ingresosPorCliente = {};
        var promesas = deals.filter(function(d) { return d.etapa === 'cerrado'; }).map(function(d) {
          if (d.contactoId) {
            return db.contactos.get(d.contactoId).then(function(c) {
              var nombre = c ? c.nombre : 'Desconocido';
              ingresosPorCliente[nombre] = (ingresosPorCliente[nombre] || 0) + (parseFloat(d.monto) || 0);
            });
          }
          ingresosPorCliente['Sin cliente'] = (ingresosPorCliente['Sin cliente'] || 0) + (parseFloat(d.monto) || 0);
          return Promise.resolve();
        });

        return Promise.all(promesas).then(function() {
          // Deals cerrados del mes
          return db.deals.where('etapa').equals('cerrado').toArray().then(function(cerrados) {
            var promesas2 = cerrados.map(function(d) {
              if (d.contactoId) {
                return db.contactos.get(d.contactoId).then(function(c) {
                  d.contactoNombre = c ? c.nombre : 'Desconocido';
                  return d;
                });
              }
              d.contactoNombre = 'Sin contacto';
              return Promise.resolve(d);
            });
            return Promise.all(promesas2).then(function() {
              self.dealsCerrados = cerrados;

              // Renderizar graficos
              setTimeout(function() {
                self._renderFunnel(etapas, etapaLabels, etapaColores, counts);
                self._renderIngresos(ingresosPorCliente);
              }, 100);

              self.cargando = false;
            });
          });
        });
      });
    },

    _renderFunnel: function(etapas, labels, colores, counts) {
      // Destruir anterior
      if (window._funnelChart) { window._funnelChart.destroy(); window._funnelChart = null; }

      var canvas = document.getElementById('funnelChart');
      if (!canvas) return;

      var ctx = canvas.getContext('2d');
      window._funnelChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: etapas.map(function(e) { return labels[e]; }),
          datasets: [{
            label: 'Deals por etapa',
            data: counts,
            backgroundColor: colores,
            borderColor: colores.map(function(c) { return c.replace('0.7', '1'); }),
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } },
            y: { grid: { display: false } }
          }
        }
      });
    },

    _renderIngresos: function(ingresosPorCliente) {
      if (window._ingresosChart) { window._ingresosChart.destroy(); window._ingresosChart = null; }

      var canvas = document.getElementById('ingresosChart');
      if (!canvas) return;

      var clientes = Object.keys(ingresosPorCliente);
      var montos = clientes.map(function(c) { return ingresosPorCliente[c]; });

      var ctx = canvas.getContext('2d');
      window._ingresosChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: clientes,
          datasets: [{
            data: montos,
            backgroundColor: [
              'rgba(37, 99, 235, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(96, 165, 250, 0.7)',
              'rgba(147, 197, 253, 0.7)',
              'rgba(191, 219, 254, 0.7)'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 12, usePointStyle: true, font: { size: 11 } }
            }
          }
        }
      });
    },

    exportCSV: function() {
      var self = this;
      db.deals.where('etapa').equals('cerrado').toArray().then(function(deals) {
        var csv = 'Deal,Cliente,Monto,Fecha cierre\n';
        var promises = deals.map(function(d) {
          if (d.contactoId) {
            return db.contactos.get(d.contactoId).then(function(c) {
              return '"' + (d.nombre || '') + '","' + (c ? c.nombre : '') + '","' + (d.monto || 0) + '","' + (d.fechaCierre || '') + '"\n';
            });
          }
          return Promise.resolve('"' + (d.nombre || '') + '","Sin cliente","' + (d.monto || 0) + '","' + (d.fechaCierre || '') + '"\n');
        });
        Promise.all(promises).then(function(lines) {
          csv += lines.join('');
          var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'reporte-ventas.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          UI.toast('CSV exportado', 'success');
        });
      });
    }
  };
}
