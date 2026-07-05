// main.js — Punto de entrada AHA CRM
(function() {
  console.log('🚀 AHA CRM v' + (APP_CONFIG.app.version || '1.0.0') + ' iniciando...');

  // Inicializar modulo de contactos y demas se hará bajo demanda via appRouter
  var init = function() {
    // Seed data
    SeedData.seed().then(function() {
      console.log('✅ Seed completado');
    }).catch(function(e) {
      console.warn('⚠️ Seed:', e);
    });

    // Inicializar router
    appRouter.init();

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(function(e) {
        console.warn('SW registration failed:', e);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer utilidades globales
  window.APP = {
    version: APP_CONFIG.app.version,
    name: APP_CONFIG.app.nombre
  };
})();
