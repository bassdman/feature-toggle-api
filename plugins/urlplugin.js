function getParams(window) {
    var params = {};
    if (window.location.search) {
      var parts = window.location.search.slice(1).split('&');

      parts.forEach(function (part) {
        var pair = part.split('=');
        pair[0] = window.decodeURIComponent(pair[0]);
        pair[1] = window.decodeURIComponent(pair[1]);
        params[pair[0]] = (pair[1] !== 'undefined') ?
          pair[1] : true;
      });
    }
    return params;
  }

module.exports = function (config={}) {
    return function(api,window){
        const urlparams = getParams(window);
        const prefix = config.prefix;

        Object.keys(urlparams).forEach(key => {
            const totalKey = prefix+key;
            api.visibility(totalKey,urlparams[key]);
        });
    }

}