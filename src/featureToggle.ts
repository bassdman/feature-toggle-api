import { EventType, FeatureToggleApi, FeatureToggleConfig, OnEvent } from "./types";

function parseToFn(fnOrBool: boolean | ((param?: any) => boolean)) {
    if (typeof fnOrBool == 'boolean')
        return function () { return fnOrBool };

    return fnOrBool;
}

function getKey(name: string, variant?: string): string {
    var _name = name.toLowerCase();
    if (variant && typeof variant == 'string') {
        _name += "#" + variant.toLowerCase();
    }

    return _name;
}

function initVisibilities(visibilities: FeatureToggleConfig = {}) {
    const returnVisibilities = {};
    Object.keys(visibilities).forEach(key => {
        if (key.startsWith('_') || key.startsWith('$'))
            return;
        returnVisibilities[getKey(key)] = parseToFn(visibilities[key]);
    });
    return returnVisibilities;
}

function useFeatureToggle(config: FeatureToggleConfig = {}): FeatureToggleApi {

    const globals = {
        datas: {},
        listeners: {},
        visibilities: initVisibilities(config),
        showLogs: false,
        usedPlugins: [],
    }

    function init(api: FeatureToggleApi) {
        if(config.$default){
            api.setDefaultFlag(config.$default);
        }

        if(config.$required){
            api.setRequiredFlag(config.$required);
        }

        const allPlugins = [...(config.$plugins||[]),...(config._plugins||[])];
        if(config._plugins){
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

    function triggerEvent(eventtype: EventType, param?: any) {
        (globals.listeners[eventtype] || []).forEach(listener => {
            listener(param);
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

    function parseKey(key: string): OnEvent {
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

    function getEvent(name: string, variant: string, data?, result?: any) {

        let event;

        event = { name, variant, data };

        event.key = getKey(event.name, event.variant);

        if (result == null)
            return event;

        event.visibilityFunction = parseToFn(result);
        event.result = event.visibilityFunction({
            name: event.name,
            variant: event.variant,
            data: event.data || {},
            _internalCall: true,
            description: 'When attaching a function, the result must be calculated internally. You can filter this out with the _internalCall:true -Flag.'
        })
        return event;
    }



    function isActive(name: string, variant?: string, data?: any): boolean {
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

    const api: FeatureToggleApi = {
        name: 'feature-toggle-api',
        setData: function (nameParam, variantOrDataParam, dataParam?): void {
            if (nameParam == undefined)
                throw new Error('setData(): The name must of the feature must be defined, but ist undefined');

            const variant = (dataParam != undefined ? variantOrDataParam : undefined) as string;
            const data = dataParam || variantOrDataParam;

            const event = getEvent(nameParam, variant, data);

            globals.datas[event.key] = event.data;

            triggerEvent('visibilityrule', event);
        },
        on(eventtype: EventType, fn, config?) {
            globals.listeners[eventtype] = globals.listeners[eventtype] || [];
            globals.listeners[eventtype].push(fn);

            triggerEvent('registerEvent', {
                type: eventtype
            })
            if (config != undefined && config.ignorePreviousRules)
                return;

            
            Object.keys(globals.visibilities).forEach(key => {
                const event = parseKey(key);
                const rule = globals.visibilities[key];
                event.result = rule(event);
                fn(event);
            });
        },
        trigger: triggerEvent,
        showLogs: function (showLogs?: boolean): void {
            globals.showLogs = showLogs == undefined ? true : showLogs;
        },
        isVisible(name,variant,data){
            console.log('featureToggle.isVisible is deprecated. use featureToggle.isActive instead. This function will be removed in one of the next major versions.');
            return isActive(name,variant,data);
        },
        isActive,
        /**
            the following function calls are possible:
            visibility(name,result);
            visibility(name,variant,result);
            visibility(name,variant,data,result);
         */
        setFlag(name, resultOrVariant, resultOrData?, result?) {
            const params = visibilityFnParams(name, resultOrVariant, resultOrData, result);
            const event = getEvent(params.name, params.variant, params.data, params.result);

            globals.visibilities[event.key] = event.visibilityFunction;
            globals.datas[event.key] = event.data;
            triggerEvent('visibilityrule', event);
        },
        visibility: function (name, resultOrVariant, resultOrData?, result?) {
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
            if (globals.usedPlugins.includes(plugin))
                return;

            const newPlugin = plugin(api);

            for(let _key of Object.keys(newPlugin)){
                api[_key] = newPlugin[_key];
            }

            globals.usedPlugins.push(plugin);
        },
    };
    init(api);

    return api;
}

export default useFeatureToggle;