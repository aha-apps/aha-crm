// core/crypto.js — Cifrado AES offline + UUID generator
var cryptoHelpers = {
  _key: null,

  _getKey: function() {
    if (!this._key) {
      this._key = localStorage.getItem(APP_CONFIG.cifrado.storageKey) || 'aha-crm-default-key-2024';
    }
    return this._key;
  },

  setKey: function(k) {
    this._key = k;
    localStorage.setItem(APP_CONFIG.cifrado.storageKey, k);
  },

  encrypt: function(texto) {
    if (!texto) return texto;
    try {
      return CryptoJS.AES.encrypt(texto, this._getKey()).toString();
    } catch (e) {
      console.warn('Error al cifrar:', e);
      return texto;
    }
  },

  decrypt: function(textoCifrado) {
    if (!textoCifrado) return textoCifrado;
    if (textoCifrado.indexOf('U2FsdGVkX1') !== 0) return textoCifrado; // No cifrado
    try {
      var bytes = CryptoJS.AES.decrypt(textoCifrado, this._getKey());
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.warn('Error al descifrar:', e);
      return textoCifrado;
    }
  },

  esCifrado: function(texto) {
    return texto && texto.indexOf('U2FsdGVkX1') === 0;
  }
};

// Generador UUID v4 compatible file://
window.uuid = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

window.cryptoHelpers = cryptoHelpers;
