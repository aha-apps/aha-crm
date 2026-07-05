// core/theme.js — Inyeccion de CSS variables desde APP_CONFIG
(function() {
  function applyTheme() {
    var colores = APP_CONFIG.tema.colores;
    var root = document.documentElement;
    for (var key in colores) {
      if (colores.hasOwnProperty(key)) {
        var daisyKey = '--p';
        if (key === 'primary') daisyKey = '--p';
        else if (key === 'primary-content') daisyKey = '--pc';
        else if (key === 'secondary') daisyKey = '--s';
        else if (key === 'secondary-content') daisyKey = '--sc';
        else if (key === 'accent') daisyKey = '--a';
        else if (key === 'accent-content') daisyKey = '--ac';
        else if (key === 'neutral') daisyKey = '--n';
        else if (key === 'neutral-content') daisyKey = '--nc';
        else if (key === 'base-100') daisyKey = '--b1';
        else if (key === 'base-200') daisyKey = '--b2';
        else if (key === 'base-300') daisyKey = '--b3';
        else if (key === 'base-content') daisyKey = '--bc';
        // Convertir hex a valores HSL para DaisyUI
        var hex = colores[key];
        var hsl = hexToHSL(hex);
        if (hsl) root.style.setProperty(daisyKey, hsl);
      }
    }
    // Font family
    if (APP_CONFIG.tema.tipografia && APP_CONFIG.tema.tipografia.familia) {
      root.style.setProperty('--font-family', APP_CONFIG.tema.tipografia.familia);
    }
  }

  function hexToHSL(hex) {
    if (!hex) return null;
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return Math.round(h * 360) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '%';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTheme);
  } else {
    applyTheme();
  }

  window.themeStore = {
    toggleModo: function() {
      APP_CONFIG.tema.modo = APP_CONFIG.tema.modo === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', APP_CONFIG.tema.modo);
    }
  };
})();
