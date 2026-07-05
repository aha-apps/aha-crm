// core/file-store.js — Gestion unificada de archivos
window.FileStore = {
  APP_DATA_DIR: 'data/',

  save: function(tipo, nombre, blob) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        var base64 = reader.result;
        var id = uuid();
        var path = tipo + 's/' + id + '-' + nombre.replace(/[^a-zA-Z0-9._-]/g, '_');
        var record = {
          path: path,
          tipo: tipo,
          nombre: nombre,
          mime: blob.type || 'application/octet-stream',
          size: blob.size,
          hash: '',
          refCount: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        db._files.put(record).then(function() {
          return db._file_blobs.put({ path: path, data: base64 });
        }).then(function() {
          var url = URL.createObjectURL(blob);
          resolve({ path: path, hash: '', url: url });
        }).catch(function(err) {
          reject(err);
        });
      };
      reader.onerror = function() { reject(reader.error); };
      reader.readAsDataURL(blob);
    });
  },

  getURL: function(path) {
    if (!path) return null;
    // Para perfiles Lite, devolvemos el blob desde _file_blobs como ObjectURL
    return null; // Se resuelve bajo demanda via read()
  },

  read: function(path) {
    return new Promise(function(resolve, reject) {
      if (!path) { reject(new Error('Path requerido')); return; }
      db._file_blobs.get(path).then(function(entry) {
        if (!entry) { reject(new Error('Archivo no encontrado: ' + path)); return; }
        resolve(entry.data);
      }).catch(reject);
    });
  },

  delete: function(path) {
    return db._file_blobs.delete(path).then(function() {
      return db._files.delete(path);
    });
  },

  cleanOrphans: function() {
    return db._files.filter(function(f) { return f.refCount <= 0; }).delete();
  },

  meta: function(path) {
    return db._files.get(path);
  },

  avatarDefault: function() {
    return 'data/defaults/avatar.svg';
  }
};
