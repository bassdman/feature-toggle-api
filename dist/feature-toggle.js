function useWindowMock() {
    return {
        isMocked: true,
        decodeURIComponent: function (param1) {
            return param1;
        }
    };
}
function parseValue(value) {
    if (value === 'true')
        return true;
    return false;
}
function getParams(url, window) {
    var params = {};
    if (!url)
        return [];
    var urlparts = url.split("?");
    //no params available for url
    if (urlparts.length < 2)
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
function urlPlugin(config = {}) {
    let _window;
    if (config.useMockedWindow)
        _window = useWindowMock();
    else
        _window = window;
    config = Object.assign({}, {
        url: _window.isMocked ? "" : _window.location.href,
        prefix: ""
    }, config);
    return function (api) {
        api.url = config.url;
        const urlparams = getParams(config.url, _window);
        const prefix = config.prefix;
        Object.keys(urlparams).forEach(key => {
            if (!key.startsWith(prefix))
                return;
            const keyWithoutPrefix = key.replace(prefix, "");
            api.visibility(keyWithoutPrefix, urlparams[key]);
        });
        return { name: 'urlplugin' };
    };
}

/*
    creates a tag that is shown / hidden, depending on the visibility rules.
    if not configured dynamically, it looks like this:
    <feature name="featurename" variant="variantname" data="data">content </feature>

    Parameter: (config)
    - config.featureTagName: name of the tag. Default: "feature"
    - nameAttributeName: Name of the Name-Attribute: default: "name"
    - variantAttributeName: Name of the Variant-Attribute: default: "variant"
*/
const defaultparams = {
    renderedTag: 'div',
    featureTagName: 'feature',
    tagAttributeName: 'tag',
    nameAttributeName: 'name',
    variantAttributeName: 'variant',
    dataAttributeName: 'data',
    displayAttributeName: 'display',
    defaultDisplay: 'block',
};
function parseDataAttribute(attrAsString) {
    try {
        return JSON.parse(attrAsString);
    }
    catch (e) {
        if (!isNaN(parseFloat(attrAsString)))
            return parseFloat(attrAsString);
        return attrAsString;
    }
}
function htmlPlugin(config = {}) {
    config = Object.assign({}, defaultparams, config);
    function renderFeatureTag(elem, isVisible) {
        const tagname = elem.getAttribute(config.tagAttributeName) || config.renderedTag;
        const attributes = Array.from(elem.attributes);
        let attributesAsString = "";
        attributes.forEach(attr => {
            attributesAsString += ` ${attr.nodeName}="${attr.nodeValue.replace(/"/g, "&quot;")}"`;
        });
        const display = isVisible ? (elem.getAttribute(config.displayAttributeName) || config.defaultDisplay) : 'none';
        elem.outerHTML = `<${tagname}  style="display:${display}" _feature="true" ${attributesAsString}>${elem.innerHTML}</${tagname}>`;
    }
    return function (api) {
        var renderedTags = window.document.querySelectorAll(config.featureTagName);
        renderedTags.forEach(tag => { renderFeatureTag(tag, false); });
        api.on('visibilityrule', function (event) {
            var selector = `[_feature][${config.nameAttributeName}="${event.name}"]`;
            if (event.variant)
                selector += `[${config.variantAttributeName}="${event.variant}"]`;
            var elements = document.querySelectorAll(selector);
            elements.forEach(elem => {
                const dataAsString = elem.getAttribute(config.dataAttributeName);
                const data = parseDataAttribute(dataAsString);
                const isVisible = api.isVisible(event.name, event.variant, data);
                renderFeatureTag(elem, isVisible);
            });
        });
        return { name: 'htmlplugin' };
    };
}

function parseToFn(fnOrBool) {
    if (typeof fnOrBool === 'boolean') {
        return function () {
            return fnOrBool;
        };
    }
    return fnOrBool;
}
function getKey(name, variant) {
    let key = name.toLowerCase();
    if (variant && typeof variant === 'string') {
        key += `#${variant.toLowerCase()}`;
    }
    return key;
}
function initVisibilities(visibilities = {}) {
    const returnVisibilities = {};
    Object.entries(visibilities).forEach(([key, value]) => {
        if (key.startsWith('_') || key.startsWith('$')) {
            return;
        }
        returnVisibilities[getKey(key)] = parseToFn(value);
    });
    return returnVisibilities;
}
function useFeatureToggle(config = {}) {
    const globals = {
        datas: {},
        listeners: {},
        visibilities: initVisibilities(config),
        showLogs: false,
        usedPlugins: [],
    };
    function init(api) {
        if (config.$default) {
            api.setDefaultFlag(config.$default);
        }
        if (config.$required) {
            api.setRequiredFlag(config.$required);
        }
        const legacyPlugins = config._plugins || [];
        const allPlugins = [...(config.$plugins || []), ...legacyPlugins];
        if (legacyPlugins.length) {
            console.log('useFeatureToggle({_plugins:[]}): Key _plugins is deprecated. Use $plugins instead. This attribute will be removed in one of the next major versions.');
        }
        if (allPlugins.length) {
            allPlugins.forEach(plugin => {
                if (typeof plugin !== 'function')
                    throw new Error('featuretoggleapi()-constructor: config.plugins needs functions as entries, not ' + typeof plugin + '.');
                api.addPlugin(plugin);
            });
        }
        triggerEvent('init');
    }
    function triggerEvent(eventtype, param) {
        (globals.listeners[eventtype] || []).forEach((listener) => {
            listener(param);
        });
    }
    const log = function (message) {
        if (!globals.showLogs) {
            return;
        }
        // Nur Browser können Syntaxhighlighting, die anderen geben die Nachricht einfach aus und schneiden die Styletags raus
        if (globalThis.window === undefined) {
            const loggedMessage = message.replaceAll('<b>', '');
            console.log(loggedMessage);
            return;
        }
        const hasBoldTag = message.includes('<b>');
        const hasVisibleKeyword = message.includes('visible');
        const hasHiddenKeyword = message.includes('hidden');
        let formattedMessage = message.replaceAll('visible', '%cvisible');
        formattedMessage = formattedMessage.replaceAll('hidden', '%chidden');
        if (hasVisibleKeyword) {
            console.log(formattedMessage, 'color:green;font-weight:bold;');
        }
        else if (hasHiddenKeyword) {
            console.log(formattedMessage, 'color:red;font-weight:bold;');
        }
        else if (hasBoldTag) {
            formattedMessage = formattedMessage.replace('<b>', '%c');
            const parts = [formattedMessage, 'font-weight:bold;'];
            console.log(...parts);
        }
        else {
            console.log(message);
        }
    };
    const logAndReturn = function (returnValue, message) {
        log(message);
        log('');
        return returnValue;
    };
    const getVisibility = function (visibilityFn, functionName, name, variant, data) {
        if (visibilityFn == null) {
            return undefined;
        }
        const calculatedVisibility = visibilityFn({ name, variant: variant ?? undefined, data });
        if (typeof calculatedVisibility === 'boolean') {
            return calculatedVisibility;
        }
        return logAndReturn(false, `The ${functionName} returns ${calculatedVisibility}. => Please return true or false. This result (and all non-boolean results) will return false.`);
    };
    function parseKey(key) {
        const parts = key.split('#');
        return {
            name: parts[0],
            variant: parts.length > 1 ? parts[1] : undefined,
            data: globals.datas[key],
        };
    }
    /*
        the following calls are possible:
        visibility(name,result);
        visibility(name,variant,result);
        visibility(name,variant,data,result);
    
        =>
        param1: name
        param2: result || variant
        param3: result || data
        param4: result
    */
    const visibilityFnParams = function (param1, param2, param3, param4) {
        // name must always be set
        if (param1 === undefined) {
            throw new Error('feature.visibility(): 1st parameter name must be defined');
        }
        if (arguments.length === 1) {
            throw new Error('feature.visibility(): 2nd parameter name must be a boolean or function, but is empty');
        }
        const name = param1;
        let variant = null;
        let data = null;
        let result = undefined;
        if (param3 === undefined && param4 === undefined) {
            result = param2;
        }
        else if (param4 === undefined) {
            variant = param2;
            result = param3;
        }
        else {
            variant = param2;
            data = param3;
            result = param4;
        }
        return {
            name,
            variant,
            data,
            result,
        };
    };
    const getEvent = (name, variant, data, result) => {
        const event = {
            name,
            variant: variant ?? undefined,
            data,
        };
        event.key = getKey(event.name, event.variant);
        if (result == null) {
            return event;
        }
        event.visibilityFunction = parseToFn(result);
        event.result = event.visibilityFunction({
            name: event.name,
            variant: event.variant,
            data: event.data || {},
            _internalCall: true,
            description: 'When attaching a function, the result must be calculated internally. You can filter this out with the _internalCall:true -Flag.',
        });
        return event;
    };
    function isActive(name, variant, data) {
        const visibilities = globals.visibilities;
        const dataInfo = data ? ` with data ${JSON.stringify(data)}` : '';
        log(`\nCheck Visibility of <b>Feature "${name}", variant "${variant ?? ''}"${dataInfo}.`);
        if (name === undefined) {
            throw new Error('The attribute "name" is required for tag <feature></feature>. Example: <feature name="aname"></feature>');
        }
        const requiredFn = visibilities['_required'];
        const requiredFnExists = requiredFn != null;
        const requiredFnResult = getVisibility(requiredFn, 'requiredVisibility', name, variant, data);
        if (!requiredFnExists) {
            log('No requiredVisibility rule specified for this feature.');
        }
        else if (requiredFnResult === true) {
            log('The requiredVisibility rule returns true. This feature will be shown when no other rule rejects it.');
        }
        else {
            return logAndReturn(false, 'The requiredVisibility rule returns false. This feature will be hidden.');
        }
        const visibilityFnKey = getKey(name, variant);
        const visibilityFn = visibilities[visibilityFnKey];
        const visibilityFnExists = visibilityFn != null;
        const visibilityFnResult = getVisibility(visibilityFn, 'visibility function', name, variant, data);
        if (visibilityFnExists) {
            return logAndReturn(visibilityFnResult ?? false, `The visibility rule returns ${visibilityFnResult}. This feature will be ${visibilityFnResult ? 'visible' : 'hidden'}.`);
        }
        log('No visibility rule found matching name and variant.');
        const variantExists = variant != null;
        const visibilityOnlyNameFnKey = getKey(name);
        const visibilityOnlyNameFn = visibilities[visibilityOnlyNameFnKey];
        const visibilityOnlyNameFnResult = getVisibility(visibilityOnlyNameFn, 'visibility function (only name)', name, variant, data);
        if (variantExists && typeof visibilityOnlyNameFnResult === 'boolean') {
            return logAndReturn(visibilityOnlyNameFnResult, `Found a visibility rule for name ${name} without variants. The rule returns ${visibilityOnlyNameFnResult}. => This feature will be ${visibilityOnlyNameFnResult ? 'visible' : 'hidden'}.`);
        }
        if (variantExists) {
            log(`No rules found for name ${name} without variants.`);
        }
        const defaultFn = visibilities['_default'];
        const defaultFnExists = defaultFn != null;
        const defaultFnResult = getVisibility(defaultFn, 'defaultVisibility', name, variant, data);
        return evaluateFallbackRules(requiredFnExists, variantExists, visibilityOnlyNameFnResult, defaultFnExists, defaultFnResult, name);
    }
    function evaluateFallbackRules(requiredFnExists, variantExists, visibilityOnlyNameFnResult, defaultFnExists, defaultFnResult, name) {
        if (variantExists && typeof visibilityOnlyNameFnResult === 'boolean') {
            return logAndReturn(visibilityOnlyNameFnResult, `Found a visibility rule for name ${name} without variants. The rule returns ${visibilityOnlyNameFnResult}. => This feature will be ${visibilityOnlyNameFnResult ? 'visible' : 'hidden'}.`);
        }
        if (variantExists) {
            log(`No rules found for name ${name} without variants.`);
        }
        if (defaultFnExists) {
            return logAndReturn(defaultFnResult ?? false, `Found a defaultVisibility rule. The rule returns ${defaultFnResult}. => This feature will be ${defaultFnResult ? 'visible' : 'hidden'}.`);
        }
        log('No default rule found.');
        if (requiredFnExists) {
            return logAndReturn(true, 'Only the requiredVisibility rule was found. This returned true. => This feature will be visible.');
        }
        return logAndReturn(false, 'No rules were found. This feature will be hidden.');
    }
    const api = {
        name: 'feature-toggle-api',
        setData: function (nameParam, variantOrDataParam, dataParam) {
            if (nameParam === undefined) {
                throw new Error('setData(): The name of the feature must be defined, but is undefined');
            }
            const variant = dataParam === undefined ? undefined : variantOrDataParam;
            const data = dataParam === undefined ? variantOrDataParam : dataParam;
            const event = getEvent(nameParam, variant, data);
            globals.datas[event.key] = event.data;
            triggerEvent('visibilityrule', event);
        },
        on(eventtype, fn, config) {
            globals.listeners[eventtype] = globals.listeners[eventtype] || [];
            globals.listeners[eventtype].push(fn);
            triggerEvent('registerEvent', {
                type: eventtype,
            });
            if (config?.ignorePreviousRules) {
                return;
            }
            Object.keys(globals.visibilities).forEach(key => {
                const event = parseKey(key);
                const rule = globals.visibilities[key];
                event.result = rule(event);
                fn(event);
            });
        },
        trigger: triggerEvent,
        showLogs: function (showLogs) {
            globals.showLogs = showLogs ?? true;
        },
        isVisible(name, variant, data) {
            console.log('featureToggle.isVisible is deprecated. use featureToggle.isActive instead. This function will be removed in one of the next major versions.');
            return isActive(name, variant, data);
        },
        isActive,
        /**
            the following function calls are possible:
            visibility(name,result);
            visibility(name,variant,result);
            visibility(name,variant,data,result);
         */
        setFlag(name, resultOrVariant, resultOrData, result) {
            const params = visibilityFnParams(name, resultOrVariant, resultOrData, result);
            const event = getEvent(params.name, params.variant, params.data, params.result);
            globals.visibilities[event.key] = event.visibilityFunction;
            globals.datas[event.key] = event.data;
            triggerEvent('visibilityrule', event);
        },
        visibility: function (name, resultOrVariant, resultOrData, result) {
            console.log('featureToggle.visibility is deprecated. use featureToggle.setVisibility instead. This function will be removed in one of the next major versions.');
            api.setFlag(name, resultOrVariant, resultOrData, result);
        },
        requiredVisibility: function (fn) {
            console.log('featureToggle.requiredVisibility is deprecated. use featureToggle.setRequiredFlag instead. This function will be removed in one of the next major versions.');
            api.setRequiredFlag(fn);
        },
        defaultVisibility: function (fn) {
            console.log('featureToggle.requiredVisibility is deprecated. use featureToggle.setRequiredFlag instead. This function will be removed in one of the next major versions.');
            api.setDefaultFlag(fn);
        },
        setRequiredFlag(fn) {
            if (typeof fn != "function")
                throw new Error('feature.setRequiredFlag(): 1st parameter must be a function, but is ' + typeof fn);
            globals.visibilities['_required'] = parseToFn(fn);
        },
        setDefaultFlag(fn) {
            if (typeof fn != "function")
                throw new Error('feature.defaultVisibility(): 1st parameter must be a function, but is ' + typeof fn);
            globals.visibilities['_default'] = parseToFn(fn);
        },
        addPlugin: function (plugin) {
            if (globals.usedPlugins.includes(plugin)) {
                return;
            }
            const newPlugin = plugin(api);
            for (let _key of Object.keys(newPlugin)) {
                api[_key] = newPlugin[_key];
            }
            globals.usedPlugins.push(plugin);
        },
    };
    init(api);
    return api;
}

export { htmlPlugin, urlPlugin, useFeatureToggle };
