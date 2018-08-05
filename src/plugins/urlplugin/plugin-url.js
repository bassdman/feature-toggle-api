function parseValue(value){
    if(value === 'true')
        return true;
    return false;
}

function getParams(url,window) {
    var params = {};
    if (!url) 
        return [];
    
    var urlparts = url.split("?");

    //no params available for url
    if(urlparts.length < 2)
        return [];

    const parts = urlparts[1].split('&');

    parts.forEach(function (part) {
    var pair = part.split('=');
    pair[0] = window.decodeURIComponent(pair[0]);
    pair[1] = parseValue(window.decodeURIComponent(pair[1]));
    params[pair[0]] = (pair[1] !== 'undefined') ?
        pair[1] : true;
    });

    return params;
  }

 function urlplugin(config={}) {
    if(config.window)
        window = config.window;
    
    config = Object.assign({},{
        url: window.isMocked ? "" : window.location.href,
        prefix: ""
    },config);

    

    return function(api){
        api.url = config.url;
        const urlparams = getParams(config.url,window);
        const prefix = config.prefix;

        Object.keys(urlparams).forEach(key => {
            if(!key.startsWith(prefix))
                return;
                
            const keyWithoutPrefix = key.replace(prefix,"");
            api.visibility(keyWithoutPrefix,urlparams[key]);
        });

        return {name: 'urlplugin'};
    }

}

if(typeof window !== 'undefined')
    window.urlplugin = urlplugin;

if(typeof module !== 'undefined')
    module.exports = urlplugin;