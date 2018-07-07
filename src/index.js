
const parseToFn = function (fnOrBool) {
    if (typeof fnOrBool == 'boolean')
        return function () { return fnOrBool };

    return fnOrBool;
}

function initVisibilities(visibilities = {}) {
    const returnVisibilities = {};
    Object.keys(visibilities).forEach(key => {
        returnVisibilities[key] = parseToFn(visibilities[key]);
    });

    return returnVisibilities;
}

export default function featuretoggleapi(rawVisibilities,config={}) {

    const globals = {
        datas: {},
        listeners: [],
        visibilities: initVisibilities(rawVisibilities),
        showLogs: false,
        globalScope: {}
    }

    function init(api){
        if(typeof window !== undefined){
            globals.globalScope = window;
        }
        
        if(config.plugins)
        {
            if(!Array.isArray(config.plugins))
                throw new Error('featuretoggleapi()-constructor: config.plugins must be an array.');
            
            config.plugins.forEach(plugin =>{
                if(typeof plugin !== 'function')
                    throw new Error('featuretoggleapi()-constructor: config.plugins needs functions as entries, not ' + typeof plugin + '.');
                
                addPlugin(plugin,api);
            });
        }
    }

    function addPlugin(plugin,api)
    {
        plugin(api,globals.globalScope);
    }

    function executeListener(event) {
        globals.listeners.forEach(listener => {
            listener(event);

            //zeige die logs an
            if(global.showLogs)
                api.isVisible(event.name,event.variant,event.data);
        });
    }

    const log = function (message) {
        if (!globals.showLogs)
            return;

        //Nur Browser können Syntaxhighlighting die anderen geben die Nachricht einfach aus und schneiden
        //die styletags raus
        if (typeof window === 'undefined') {
            const loggedMessage = message.replace(/<b>/g, "");
            console.log(loggedMessage);
            return;
        }

        var hasBoldTag = message.indexOf('<b>') != -1;
        var hasVisibleKeyword = message.indexOf('visible') != -1;
        var hasHiddenKeyword = message.indexOf('hidden') != -1;

        var _message = message.replace('visible', '%cvisible');
        _message = _message.replace('hidden', '%chidden');

        if (hasVisibleKeyword)
            console.log(_message, "color:green;font-weight:bold;");
        else if (hasHiddenKeyword)
            console.log(_message, "color:red;font-weight:bold;");
        else if (hasBoldTag) {
            _message = _message.replace('<b>', '%c');
            var parts = [_message, 'font-weight:bold;']
            console.log.apply(null, parts);
        }
        else
            console.log(message);
    }

    const logAndReturn = function (returnValue, message) {
        log(message);
        log('');
        return returnValue;
    }

    const getVisibility = function (visibilityFn, functionname, name, variant, data) {
        if (visibilityFn == null)
            return undefined;

        var calculatedVisibility = visibilityFn({ name: name, variant: variant, data: data });

        if (typeof calculatedVisibility == 'boolean') {
            return calculatedVisibility;
        }

        return logAndReturn(false, `The ${functionname} returns ${calculatedVisibility}. => Please return true or false. This result (and all non-boolean results) will return false.`);
    }

    function getKey(name, variant) {
        var _name = name.toLowerCase();
        if (typeof variant == 'string') {
            _name += "#" + variant.toLowerCase();
        }

        return _name;
    }
    function parseKey(key) {
        const parts = key.split('#');
        return {
            name: parts[0],
            variant: parts.length > 1 ? parts[1] : undefined,
            data: globals.datas[key],
        }
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
    function visibilityFnParams(param1, param2, param3, param4) {
        //name must always be set
        if (param1 == undefined)
            throw new Error('feature.visibility(): 1st parameter name must be defined');

        if (arguments.length == 1)
            throw new Error('feature.visibility(): 2nd parameter name must be a boolean or function, but is empty');

        let name = param1, variant = null, data = null, result = null;
        if (param3 == undefined && param4 == undefined) {
            result = param2;
        }
        else if (param4 == undefined) {
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
            result
        }
    }

    function getEvent(name, variant, data, result) {

        let event;

        event = { name: name, variant: variant, data: data };

        event.key = getKey(event.name, event.variant);

        if (result == null)
            return event;

        event.visibilityFunction = parseToFn(result);
        event.result = event.visibilityFunction({ 
            name: event.name, 
            variant: event.variant, 
            data: event.data, 
            _internalCall: true,
            description:  'When attaching a function, the result must be calculated internally. You can filter this out with the _internalCall:true -Flag.'
        })
        return event;
    }



    function isVisible(name, variant, data) {
        const visibilities = globals.visibilities;

        log(`\nCheck Visibility of <b>Feature "${name}", variant "${variant == undefined ? '' : variant}"${data ? " with data " + JSON.stringify(data) : ""}.`);
        if (name == undefined)
            throw new Error('The attribute "name" is required for tag <feature></feature>. Example: <feature name="aname"></feature>');

        var requiredFn = visibilities['_required'];
        var requiredFnExists = visibilities['_required'] != null;
        var requiredFnResult = getVisibility(requiredFn, 'requiredVisibility', name, variant, data);

        var visibilityFnKey = getKey(name, variant);
        var visibilityFn = visibilities[visibilityFnKey];
        var visibilityFnExists = visibilities[visibilityFnKey] != null;
        var visibilityFnResult = getVisibility(visibilityFn, 'visibility function', name, variant, data);

        var variantExists = variant != null;
        var visibilityOnlyNameFnKey = getKey(name, null);
        var visibilityOnlyNameFn = visibilities[visibilityOnlyNameFnKey];
        var visibilityOnlyNameFnExists = visibilities[visibilityOnlyNameFnKey] != null;
        var visibilityOnlyNameFnResult = getVisibility(visibilityOnlyNameFn, 'visibility function (only name)', name, variant, data);

        var defaultFn = visibilities['_default'];
        var defaultFnExists = visibilities['_default'] != null;
        var defaultFnResult = getVisibility(defaultFn, 'defaultVisibility', name, variant, data);

        if (!requiredFnExists)
            log("No requiredVisibility rule specified for this feature.");
        else if (requiredFnExists && requiredFnResult === true)
            log("The requiredVisibility rule returns true. This feature will be shown when no other rule rejects it.")
        else if (requiredFnExists && requiredFnResult === false)
            return logAndReturn(false, "The requiredVisibility rule returns false. This feature will be hidden.");

        if (visibilityFnExists)
            return logAndReturn(visibilityFnResult, `The visibility rule returns ${visibilityFnResult}. This feature will be ${visibilityFnResult ? 'visible' : 'hidden'}.`);
        log('No visibility rule found matching name and variant.');

        if (variantExists && typeof visibilityOnlyNameFnResult == 'boolean')
            return logAndReturn(visibilityOnlyNameFnResult, `Found a visibility rule for name ${name} without variants. The rule returns ${visibilityOnlyNameFnResult}. => This feature will be ${visibilityOnlyNameFnResult ? 'visible' : 'hidden'}.`);
        else if (variantExists)
            log(`No rules found for name ${name} without variants.`)


        if (defaultFnExists)
            return logAndReturn(defaultFnResult, `Found a defaultVisibility rule. The rule returns ${defaultFnResult}. => This feature will be ${defaultFnResult ? 'visible' : 'hidden'}.`);
        log(`No default rule found.`)

        if (requiredFnExists)
            return logAndReturn(true, `Only the requiredVisibility rule was found. This returned true. => This feature will be visible.`);

        return logAndReturn(false, 'No rules were found. This feature will be hidden.');
    }

    const api = {
        name: 'feature-toggle-api',
        setData: function (nameParam, variantOrDataParam, dataParam) {
            if (nameParam == undefined)
                throw new Error('setData(): The name must of the feature must be defined, but ist undefined');

            const variant = dataParam != undefined ? variantOrDataParam : undefined;
            const data = dataParam || variantOrDataParam;

            const event = getEvent(nameParam, variant, data);

            globals.datas[event.key] = event.data;

            executeListener(event);
        },
        on: function (eventtype, fn, config) {
            const validEventTypes = ['visibilityrule'];
            if (validEventTypes.indexOf(eventtype.toLowerCase()) == -1)
                throw new Error('Eventtype "' + eventtype.toLowerCase() + '" does not exist. Only "visibilityrule" is valid');

            globals.listeners.push(fn);

            if (config != undefined && config.ignorePreviousRules)
                return;

            Object.keys(globals.visibilities).forEach(key => {
                const event = parseKey(key, globals);
                const rule = globals.visibilities[key];
                event.result = rule(event.name, event.variant, event.data);
                fn(event);
            });
        },
        showLogs: function (showLogs) {
            globals.showLogs = showLogs == undefined ? true : showLogs;
        },
        isVisible,
        /*
            the following function calls are possible:
            visibility(name,result);
            visibility(name,variant,result);
            visibility(name,variant,data,result);
        */
        visibility: function (param1, param2, param3, param4) {
            const params = visibilityFnParams(param1, param2, param3, param4);
            const event = getEvent(params.name, params.variant, params.data, params.result);

            globals.visibilities[event.key] = event.visibilityFunction;
            globals.datas[event.key] = event.data;

            executeListener(event);
        },
        requiredVisibility: function (fn) {
            if (typeof fn != "function")
                throw new Error('feature.requiredVisibility(): 1st parameter must be a function, but is ' + typeof fn);

            globals.visibilities['_required'] = parseToFn(fn);
        },
        defaultVisibility: function (fn) {
            if (typeof fn != "function")
                throw new Error('feature.defaultVisibility(): 1st parameter must be a function, but is ' + typeof fn);

            globals.visibilities['_default'] = parseToFn(fn);
        },
        addPlugin: function(plugin){
            addPlugin(plugin,this);
        },
    };
    init(api);
    return api;
}