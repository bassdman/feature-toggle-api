const featureToggleApi = require('../../feature-toggle-api.module.js');
const urlplugin = require('../../src/plugins/urlplugin/plugin-url.js');
const window = require('./polyfills.js')

describe("Initialisation / Basic Tests", function () {
    it("should return a function", function () {
        const type = typeof featureToggleApi;
        expect(type).toBe('function');
    });

    it("should return 'feature-toggle-api' for property name", function () {
        const api = new featureToggleApi();
        expect(api.name).toBe('feature-toggle-api');
    });

    it("should return true if feature is initialized in constructor", function () {
        const api = new featureToggleApi({ feature: true });
        expect(api.isVisible('feature')).toBe(true);
    });

    it("should return true if feature with variant is initialized in constructor", function () {
        const api = new featureToggleApi({ "feature#variant": true });
        expect(api.isVisible('feature', 'variant')).toBe(true);
    });

    it("should return true if feature with variant is initialized in constructor with function", function () {
        const api = new featureToggleApi({ "feature#variant": true });
        expect(api.isVisible('feature', 'variant')).toBe(true);
    });
});

describe("Basic visibility of features", function () {
    const api = new featureToggleApi();
    
    it("should return true if parameter is boolean", function () {
        api.visibility('featurebool', true);
        const visibility = api.isVisible('featurebool');
        expect(visibility).toBe(true);
    });

    it("should return true if parameter is function", function () {
        api.visibility('featurebool', function () { return true });
        const visibility = api.isVisible('featurebool');
        expect(visibility).toBe(true);
    });

    it("should return true if feature is true", function () {
        api.visibility('featureTrue', true);
        const visibility = api.isVisible('featureTrue');
        expect(visibility).toBe(true);
    });

    it("should return false if feature is false", function () {
        api.visibility('featureFalse', false);
        const visibility = api.isVisible('featureFalse');
        expect(visibility).toBe(false);
    });

    it("should return false if feature does not exist", function () {
        const visibility = api.isVisible('featureNotExists');
        expect(visibility).toBe(false);
    });

    it("should return true if feature with variant is true", function () {
        api.visibility('featureTrue', 'variant', true);
        const visibility = api.isVisible('featureTrue', 'variant');
        expect(visibility).toBe(true);
    });

    it("should return false if feature with variant is false", function () {
        api.visibility('featureFalse', 'variant', false);
        const visibility = api.isVisible('featureFalse', 'variant');
        expect(visibility).toBe(false);
    });

    it("should return false if feature with variant does not exist", function () {
        const visibility = api.isVisible('featureNotExists', 'variant', false);
        expect(visibility).toBe(false);
    });

    it("should return true if feature with variant is requested but only featurerule exists", function () {
        api.visibility('featureTrue', true);
        const visibility = api.isVisible('featureTrue', 'variant');
        expect(visibility).toBe(true);
    });

    it("should return false if data returns false", function () {
        api.visibility('featureFalse', 'variant', function (rule) { return rule.data == 'succeed' });
        const visibility = api.isVisible('featureFalse', 'variant', 'fail');
        expect(visibility).toBe(false);
    });

    it("should return false if data returns true", function () {
        api.visibility('featureFalse', 'variant', function (rule) { return rule.data == 'succeed' });
        const visibility = api.isVisible('featureFalse', 'variant', 'succeed');
        expect(visibility).toBe(true);
    });

    it("should pass correct parameters for visibilityrule", function () {
        api.visibility('featureFalse2', 'variant', function (rule) { 
            if(rule._internalCall)
                return;
            expect(rule.name).toBe('featureFalse2');
            expect(rule.variant).toBe('variant');
            expect(rule.data).toBe('succeed');
        });

        api.isVisible('featureFalse2', 'variant', 'succeed');
        
    });
});

describe("Default Visibility", function () {
    const api = new featureToggleApi();
    api.defaultVisibility((result) => {
        return true;
    });
    it("should return true if feature does not exist", function () {
        const visibility = api.isVisible('featureNotExists');
        expect(visibility).toBe(true);
    });

    it("should return true if feature withVariant does not exist", function () {
        const visibility = api.isVisible('featureNotExists', 'variant');
        expect(visibility).toBe(true);
    });

    it("should return false if feature is False", function () {
        api.visibility('featureFalse', false);
        const visibility = api.isVisible('featureFalse');
        expect(visibility).toBe(false);
    });

    it("should return false if feature with variant isFalse", function () {
        api.visibility('featureFalse2', false)
        const visibility = api.isVisible('featureFalse2', 'variant', false);
        expect(visibility).toBe(false);
    });
});

describe("Required Visibility", function () {
    const api = new featureToggleApi();
    api.requiredVisibility((result) => {
        return result.variant == "valid";
    });

    it("should return false if feature does not exist and requirerule matches", function () {
        api.visibility('featureNotExists', 'valid', false);
        const visibility = api.isVisible('featureNotExists', 'valid');
        expect(visibility).toBe(false);
    });
    it("should return false if feature does not exist and requirerule matches not", function () {
        api.visibility('featureNotExists', 'invalid', false);
        const visibility = api.isVisible('featureNotExists', 'invalid');
        expect(visibility).toBe(false);
    });


    it("should return false if only required rule matches", function () {
        api.visibility('featureFalse', false);
        const visibility = api.isVisible('featureFalse', 'valid');
        expect(visibility).toBe(false);
    });

    it("should return true if required rule matches and visibiltiyrule", function () {
        api.visibility('featureTrue', true);
        const visibility = api.isVisible('featureTrue', 'valid');
        expect(visibility).toBe(true);
    });

    it("should return false if defaultVisibility returns true", function () {
        api.defaultVisibility((result) => {
            return true;
        });
        const visibility = api.isVisible('featureTrue', 'invalid');
        expect(visibility).toBe(false);
    });
});

describe("Listener", function () {
    const api = new featureToggleApi({
        feature: true,
        "feature2#variant": true
    });

    it("should have an event called on('visibilityrule')", function () {
        api.on('visibilityrule', function () {

        });
    });

    it("should access function twice for two initial eventnames", function () {
        var listenedEvents = [];

        api.on('visibilityrule', function (event) {
            listenedEvents.push(event.name+","+event.variant+","+event.result);
        })

        expect(JSON.stringify(listenedEvents)).toBe(JSON.stringify(['feature,undefined,true','feature2,variant,true']));
    });

    it("should access function twice if visibilityrule is added before listener", function () {
        var listenedEvents = [];
        var localapi = new featureToggleApi({feature: true});
        localapi.visibility("feature2","variant",true);
        localapi.on('visibilityrule', function (event) {
            listenedEvents.push(event.name+","+event.variant+","+event.result);
        })

        expect(JSON.stringify(listenedEvents)).toBe(JSON.stringify(['feature,undefined,true','feature2,variant,true']));
    });

    it("should access function twice if visibilityrule is added after listener", function () {
        var listenedEvents = [];
        var localapi = new featureToggleApi({feature: true});
        localapi.on('visibilityrule', function (event) {
            listenedEvents.push(event.name+","+event.variant+","+event.result);
        });
        localapi.visibility("feature2","variant",true);

        expect(JSON.stringify(listenedEvents)).toBe(JSON.stringify(['feature,undefined,true','feature2,variant,true']));
    });

    it("should pass parameters as an object with result,name,variant,data", function () {
        var api = new featureToggleApi();
        api.visibility('feature', 'variant','gruempfel',function(rule){
            return (rule.data + rule.name + rule.variant) == 'gruempfelfeaturevariant';
        });

        api.on('visibilityrule', function (event) {
            expect(event.result).toBe(true);
            expect(event.name).toBe("feature");
            expect(event.variant).toBe("variant");
            expect(event.data).toBe("gruempfel");
        })
    });

    it("should be executed, when data has changed", function () {
        var api = new featureToggleApi();
        var totalData = '';

        api.on('visibilityrule', function (event) {
            totalData += event.data + ','; 
        });

        api.visibility('feature', 'variant','gruempfel',true);
        api.setData('feature','variant','newgruempfel');
        api.visibility('feature2', null,'gruempfel2',true);
        api.setData('feature2','newgruempfel2');
        expect(totalData).toBe('gruempfel,newgruempfel,gruempfel2,newgruempfel2,');
    });

    it("should trigger a custom defined event", function () {
        var api = new featureToggleApi();

        let customEvent = false;
        api.on('customevent', function (param) {
            customEvent = param;
        });

        api.trigger('customevent','fired');
        expect(customEvent).toBe('fired');
    });
});

describe("Plugins", function () {

    it("function addPlugin should exist", function () {
        var api = new featureToggleApi();
        
        expect(api.addPlugin).not.toBe(null);
    });

    it("should add attribute 'newplugin' to the api", function () {
        function newPlugin(api,window){
            api.newplugin = true;
        }

        var api = new featureToggleApi();
        api.addPlugin(newPlugin);
        expect(api.newplugin).toBe(true);
    });

    it("should add plugins via attribute constructor config", function () {
        function newPlugin(api,window){
            api.newplugin = true;
        }

        var api = new featureToggleApi({_plugins: [newPlugin]});

        expect(api.newplugin).toBe(true);
        expect(api.isVisible('_plugin')).toBe(false);
    });

    it("should only be executed once", function () {
        var api = new featureToggleApi();
        api.count = 0;
        function countPlugin(api){
            api.count += 1;
        }

        api.addPlugin(countPlugin);
        api.addPlugin(countPlugin);
        expect(api.count).toBe(1);
    });

    it("should trigger the init-event", function () {
        function newPlugin(api){
            api.on('init',function(){
                api.initTriggered = true;
            })
        }

        var api = new featureToggleApi({_plugins: [newPlugin]});
        expect(api.initTriggered).toBe(true);
    });
});

describe("URL-Plugin", function () {
    it("should return empty string for url", function(){
        var api = new featureToggleApi({
            _plugins: [urlplugin({window})]
        });
        expect(api.url).toBe("");
    })
    it("should have api.url = anydomain.de if set in pluginconfig", function(){
        var api = new featureToggleApi({
            _plugins: [urlplugin({
                url: "http://anydomain.de",
                window
            })]
        });
        expect(api.url).toBe("http://anydomain.de");
    })
    it("should have feature1 visible if param feature1=true exists", function(){
        var api = new featureToggleApi({
            _plugins: [urlplugin({url: 'anydomain.de?feature1=true', window})]
        });
        const visibilityF1 = api.isVisible("feature1");
        const visibilityF2 = api.isVisible("feature2");
        expect(visibilityF1).toBe(true);
        expect(visibilityF2).toBe(false);
    })
    it("should only regard params with prefix", function(){
        var api = new featureToggleApi({
            _plugins: [urlplugin({
                url: 'anydomain.de?feature1=true&_feature2=true', 
                prefix: '_',
                window
            })]
        });
        const visibilityF1 = api.isVisible("feature1");
        const visibilityF2 = api.isVisible("feature2");
        const visibility_F1 = api.isVisible("_feature1");
        const visibility_F2 = api.isVisible("_feature2");
        expect(visibilityF1).toBe(false);
        expect(visibilityF2).toBe(true);
        expect(visibility_F1).toBe(false);
        expect(visibility_F2).toBe(false);
    })
});