// core/seed.js — Datos de ejemplo para AHA CRM
var SeedData = {
  contactos: [
    { id: uuid(), nombre: 'Carlos Mendoza', empresa: 'TechSolutions MX', telefono: '555-0101', email: 'carlos@techsol.mx', notas: 'Cliente potencial para soluciones cloud', createdAt: new Date(), updatedAt: new Date() },
    { id: uuid(), nombre: 'Ana Jimenez', empresa: 'Distribuidora del Norte', telefono: '555-0202', email: 'ana@dnorte.com', notas: 'Interesada en paquete premium', createdAt: new Date(), updatedAt: new Date() },
    { id: uuid(), nombre: 'Roberto Silva', empresa: 'Silva Consulting', telefono: '555-0303', email: 'roberto@silvac.com', notas: 'Recomendado por cliente anterior', createdAt: new Date(), updatedAt: new Date() },
    { id: uuid(), nombre: 'Maria Torres', empresa: 'Torres & Asociados', telefono: '555-0404', email: 'maria@torresasoc.com', notas: 'Cliente frecuente', createdAt: new Date(), updatedAt: new Date() },
    { id: uuid(), nombre: 'Luis Hernandez', empresa: 'Hernandez Group', telefono: '555-0505', email: 'luis@hgroup.com', notas: 'Presupuesto aprobado para Q3', createdAt: new Date(), updatedAt: new Date() }
  ],

  deals: function(contactos) {
    return [
      { id: uuid(), contactoId: contactos[0].id, nombre: 'Plataforma Cloud Enterprise', monto: 45000, etapa: 'negociacion', probabilidad: 70, fechaCierre: '2026-08-15', createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), contactoId: contactos[1].id, nombre: 'Paquete Distribucion Plus', monto: 28000, etapa: 'propuesta', probabilidad: 50, fechaCierre: '2026-07-30', createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), contactoId: contactos[2].id, nombre: 'Consultoria TI Integral', monto: 15000, etapa: 'contactado', probabilidad: 30, fechaCierre: '2026-08-01', createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), contactoId: contactos[3].id, nombre: 'Sistema Gestion Documental', monto: 32000, etapa: 'cerrado', probabilidad: 100, fechaCierre: '2026-06-01', createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
      { id: uuid(), contactoId: contactos[4].id, nombre: 'Migracion Infraestructura', monto: 55000, etapa: 'prospecto', probabilidad: 20, fechaCierre: '2026-09-01', createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() }
    ];
  },

  interacciones: function(contactos) {
    return [
      { id: uuid(), contactoId: contactos[0].id, tipo: 'llamada', nota: 'Llamada inicial, interesado en demo', createdAt: new Date(Date.now() - 86400000 * 5) },
      { id: uuid(), contactoId: contactos[0].id, tipo: 'email', nota: 'Envie propuesta comercial', createdAt: new Date(Date.now() - 86400000 * 3) },
      { id: uuid(), contactoId: contactos[1].id, tipo: 'reunion', nota: 'Presentacion de producto, pidio cotizacion', createdAt: new Date(Date.now() - 86400000 * 2) },
      { id: uuid(), contactoId: contactos[2].id, tipo: 'llamada', nota: 'Contacto inicial via referencia', createdAt: new Date(Date.now() - 86400000) },
      { id: uuid(), contactoId: contactos[3].id, tipo: 'email', nota: 'Factura pagada, cliente satisfecho', createdAt: new Date() }
    ];
  },

  seed: function() {
    var self = this;
    return db.contactos.count().then(function(count) {
      if (count > 0) {
        console.log('ℹ️ Datos de ejemplo ya existen, saltando seed');
        return;
      }
      console.log('🌱 Sembrando datos de ejemplo...');
      var contactos = self.contactos;
      var deals = self.deals(contactos);
      var interacciones = self.interacciones(contactos);
      return db.contactos.bulkAdd(contactos).then(function() {
        return db.deals.bulkAdd(deals);
      }).then(function() {
        return db.interacciones.bulkAdd(interacciones);
      }).then(function() {
        console.log('✅ Seed completado: ' + contactos.length + ' contactos, ' + deals.length + ' deals, ' + interacciones.length + ' interacciones');
      }).catch(function(e) {
        console.warn('⚠️ Error en seed (posiblemente datos ya existen):', e);
      });
    });
  }
};

window.SeedData = SeedData;
