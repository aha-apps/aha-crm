// core/db.js — Inicializacion Dexie para AHA CRM
var db = new Dexie('AHA_CRM');

db.version(2).stores({
  contactos: 'id, nombre, *empresa, *telefono, email, *notas, *createdBy, createdAt, updatedAt',
  deals: 'id, *contactoId, *nombre, *monto, *etapa, *probabilidad, *fechaCierre, *createdBy, createdAt, updatedAt',
  cotizaciones: 'id, *dealId, *items, *total, *pdfGenerado, *estado, *createdBy, createdAt, updatedAt',
  facturas: 'id, *dealId, *contactoId, *folio, *total, *estado, *createdBy, createdAt, updatedAt',
  interacciones: 'id, *contactoId, *tipo, *nota, *createdBy, createdAt',
  _sync_log: '++id, timestamp, tipo, estado',
  _ia_chats: 'id, titulo, createdAt',
  _ia_messages: '++id, chatId, rol, contenido, timestamp',
  _files: '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt',
  _file_blobs: '&path'
});

// Helper para busqueda en contactos por indice
db.buscarContactos = function(termino) {
  var self = this;
  return self.contactos.filter(function(c) {
    return (c.nombre && c.nombre.toLowerCase().indexOf(termino) !== -1) ||
           (c.empresa && c.empresa.toLowerCase().indexOf(termino) !== -1) ||
           (c.email && c.email.toLowerCase().indexOf(termino) !== -1) ||
           (c.telefono && c.telefono.indexOf(termino) !== -1);
  }).toArray();
};

window.db = db;
