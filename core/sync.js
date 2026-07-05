// core/sync.js — Export/Import de datos offline-first
window.SyncEngine = {
  _password: '',
  _excludeTables: ['modelos_cache', '_ia_sqlite'],

  setPassword: function(pwd) {
    this._password = pwd || '';
  },

  exportar: function(password) {
    var pwd = password || this._password;
    var self = this;
    return new Promise(function(resolve, reject) {
      UI.toast('Preparando respaldo...', 'info');
      try {
        var tables = {};
        var filesPromise = db._files ? db._files.toArray() : Promise.resolve([]);
        var blobsPromise = (db._file_blobs && APP_CONFIG.perfil === 'lite') ? db._file_blobs.toArray() : Promise.resolve([]);

        Promise.all([filesPromise, blobsPromise]).then(function(results) {
          var files = results[0];
          var blobs = results[1];
          var tablePromises = [];
          var tableNames = [];
          for (var i = 0; i < db.tables.length; i++) {
            var t = db.tables[i];
            if (self._excludeTables.indexOf(t.name) !== -1) continue;
            if (t.name === '_files' || t.name === '_file_blobs') continue;
            tableNames.push(t.name);
            tablePromises.push(t.toArray());
          }
          return Promise.all(tablePromises).then(function(tableResults) {
            for (var j = 0; j < tableNames.length; j++) {
              if (tableResults[j].length) tables[tableNames[j]] = tableResults[j];
            }

            if (!Object.keys(tables).length && !files.length) {
              UI.toast('No hay datos para exportar', 'warning');
              resolve();
              return;
            }

            var payload = JSON.stringify({
              version: 2,
              app: APP_CONFIG.app.nombre || 'app',
              exportedAt: new Date().toISOString(),
              tables: tables,
              files: files,
              blobs: blobs
            });

            var compressed = pako.deflate(payload, { level: 9 });

            var blob;
            if (pwd) {
              var encrypted = CryptoJS.AES.encrypt(
                CryptoJS.lib.WordArray.create(compressed),
                pwd
              ).toString();
              blob = new Blob([encrypted], { type: 'application/octet-stream' });
            } else {
              blob = new Blob([compressed], { type: 'application/octet-stream' });
            }

            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = APP_CONFIG.app.nombre + '-' + new Date().toISOString().slice(0, 10) + '.ateje-backup';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            var fileInfo = files.length ? ' + ' + files.length + ' archivos' : '';
            UI.toast('Respaldo exportado (' + (blob.size / 1024).toFixed(1) + ' KB' + fileInfo + ')', 'success');
            resolve();
          });
        }).catch(function(err) {
          UI.toast('Error al exportar: ' + err.message, 'error');
          reject(err);
        });
      } catch (err) {
        UI.toast('Error al exportar: ' + err.message, 'error');
        reject(err);
      }
    });
  },

  importar: function(file, password) {
    var pwd = password || this._password;
    var self = this;
    return new Promise(function(resolve, reject) {
      UI.toast('Leyendo respaldo...', 'info');
      try {
        var reader = new FileReader();
        reader.onload = function(e) {
          var data = e.target.result;
          try {
            var compressed;
            if (pwd) {
              var decrypted = CryptoJS.AES.decrypt(data, pwd);
              compressed = decrypted.toString(CryptoJS.enc.Latin1);
              compressed = Uint8Array.from(compressed.split('').map(function(c) { return c.charCodeAt(0); }));
            } else {
              compressed = new Uint8Array(data);
            }

            var json = pako.inflate(compressed, { to: 'string' });
            var backup = JSON.parse(json);

            UI.toast('Restaurando datos...', 'info');

            var ops = [];

            // Restaurar archivos primero
            if (backup.files && backup.files.length && db._files) {
              ops.push(db._files.clear().then(function() { return db._files.bulkAdd(backup.files); }));
            }
            if (backup.blobs && backup.blobs.length && db._file_blobs) {
              ops.push(db._file_blobs.clear().then(function() { return db._file_blobs.bulkAdd(backup.blobs); }));
            }

            // Restaurar tablas
            for (var tableName in backup.tables) {
              if (backup.tables.hasOwnProperty(tableName)) {
                var table = db[tableName];
                if (table) {
                  (function(tn, records) {
                    ops.push(table.clear().then(function() { return table.bulkAdd(records); }));
                  })(tableName, backup.tables[tableName]);
                }
              }
            }

            Promise.all(ops).then(function() {
              UI.toast('Datos restaurados correctamente', 'success');
              // Recargar modulo actual
              if (window.appRouter && window.appRouter.currentModule) {
                window.appRouter.loadModule(window.appRouter.currentModule);
              }
              resolve();
            }).catch(function(err) {
              UI.toast('Error al restaurar: ' + err.message, 'error');
              reject(err);
            });

          } catch (parseErr) {
            UI.toast('Archivo de respaldo invalido', 'error');
            reject(parseErr);
          }
        };
        reader.onerror = function() {
          UI.toast('Error al leer archivo', 'error');
          reject(reader.error);
        };

        if (pwd) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      } catch (err) {
        UI.toast('Error al importar: ' + err.message, 'error');
        reject(err);
      }
    });
  }
};
