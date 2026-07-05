// core/license.js — Verificador de licencias AHA offline
window.APP_ID = 'aha-crm';
window.APP_CONFIG = window.APP_CONFIG || {};

// Asegurar defaults para plan Lite
window.APP_CONFIG.plan = window.APP_CONFIG.plan || 'lite';
window.APP_CONFIG.maxRecords = window.APP_CONFIG.maxRecords || (window.APP_CONFIG.plan === 'lite' ? 30 : Infinity);
window.APP_CONFIG.canExport = window.APP_CONFIG.canExport !== undefined ? window.APP_CONFIG.canExport : (window.APP_CONFIG.plan !== 'lite');
window.APP_CONFIG.iaTier = window.APP_CONFIG.iaTier || 'lite';
window.APP_CONFIG.canWhiteLabel = window.APP_CONFIG.canWhiteLabel || false;
window.APP_CONFIG.customer = window.APP_CONFIG.customer || null;

function checkLicense() {
  if (ENV === 'development') {
    console.log('🔓 Modo desarrollo — licencia desbloqueada');
    return;
  }

  // En produccion buscar archivo .aha
  var licenseData = localStorage.getItem('aha_license_' + APP_ID);
  if (licenseData) {
    try {
      var parsed = JSON.parse(licenseData);
      APP_CONFIG.plan = parsed.plan || 'lite';
      APP_CONFIG.maxRecords = APP_CONFIG.plan === 'lite' ? 30 : Infinity;
      APP_CONFIG.canExport = APP_CONFIG.plan !== 'lite';
      APP_CONFIG.iaTier = parsed.iaTier || 'lite';
      APP_CONFIG.canWhiteLabel = parsed.canWhiteLabel || false;
      APP_CONFIG.customer = parsed.customer || null;
      console.log('🔐 Licencia cargada:', APP_CONFIG.plan);
    } catch(e) {
      console.warn('⚠️ Licencia invalida, usando defaults Lite');
    }
  } else {
    console.log('ℹ️ Sin licencia — modo Lite');
  }
}

window.cargarLicencia = function() {
  return new Promise(function(resolve) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.aha';
    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) { resolve(false); return; }
      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          var data = JSON.parse(ev.target.result);
          localStorage.setItem('aha_license_' + APP_ID, ev.target.result);
          checkLicense();
          UI.toast('Licencia cargada: ' + (data.plan || 'lite'), 'success');
          resolve(true);
        } catch(err) {
          UI.toast('Archivo de licencia invalido', 'error');
          resolve(false);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
};

checkLicense();
