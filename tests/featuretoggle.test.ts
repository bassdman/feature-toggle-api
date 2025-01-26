import { describe, it, } from "node:test";
import assert from "node:assert";
import {useWindowMock} from './polyfills';
import { useFeatureToggle, urlPlugin } from '../src/';

describe("Initialisation / Basic Tests", function() {
    it("should return a function", function() {
        const type = typeof useFeatureToggle;
        assert.strictEqual(type,'function');
    });

    it("should return 'feature-toggle-api' for property name", function() {
        const api = useFeatureToggle();
        assert.strictEqual(api.name,'feature-toggle-api');
    });

    it("should return true if feature is initialized in constructor", function() {
        const api = useFeatureToggle({ feature: true });
        assert.strictEqual(api.isVisible('feature'),true);
    });

    it("should return true if feature with variant is initialized in constructor", function() {
        const api = useFeatureToggle({ "feature#variant": true });
        assert.strictEqual(api.isVisible('feature','variant'),true);
    });

    it("should return true if feature with variant is initialized in constructor with function", function() {
        const api = useFeatureToggle({ "feature#variant": true });
        assert.strictEqual(api.isVisible('feature','variant'),true);
    });
});

describe("Basic visibility of features", function() {
    const api = useFeatureToggle();

    it("should return true if parameter is boolean", function() {
        api.setFlag('featurebool', true);
        const visibility = api.isVisible('featurebool');
        assert.strictEqual(visibility,true);
    });

    it("should ignore case for the api-keys", function() {
        api.setFlag('ignoreCase', true);
        const visibility1 = api.isVisible('ignorecase');
        const visibility2 = api.isVisible('iGNOrEcaSe');
        assert.strictEqual(visibility1,true);
        assert.strictEqual(visibility2,true);
    });

    it("should return true if parameter is function", function() {
        api.setFlag('featurebool', function() { return true });
        const visibility = api.isVisible('featurebool');
        assert.strictEqual(visibility,true);
    });

    it("should return true if feature is true", function() {
        api.setFlag('featureTrue', true);
        const visibility = api.isVisible('featureTrue');
        assert.strictEqual(visibility,true);
    });

    it("should return false if feature is false", function() {
        api.setFlag('featureFalse', false);
        const visibility = api.isVisible('featureFalse');
        assert.strictEqual(visibility,false);
    });

    it("should return false if feature does not exist", function() {
        const visibility = api.isVisible('featureNotExists');
        assert.strictEqual(visibility,false);
    });

    it("should return true if feature with variant is true", function() {
        api.setFlag('featureTrue', 'variant', true);
        const visibility = api.isVisible('featureTrue', 'variant');
        assert.strictEqual(visibility,true);
    });

    it("should return false if feature with variant is false", function() {
        api.setFlag('featureFalse', 'variant', false);
        const visibility = api.isVisible('featureFalse', 'variant');
        assert.strictEqual(visibility,false);
    });

    it("should return false if feature with variant does not exist", function() {
        const visibility = api.isVisible('featureNotExists', 'variant', false);
        assert.strictEqual(visibility,false);
    });

    it("should return true if feature with variant is requested but only featurerule exists", function() {
        api.setFlag('featureTrue', true);
        const visibility = api.isVisible('featureTrue', 'variant');
        assert.strictEqual(visibility,true);
    });

    it("should return false if data returns false", function() {
        api.setFlag('featureFalse', 'variant', function(rule) { return rule.data == 'succeed' });
        const visibility = api.isVisible('featureFalse', 'variant', 'fail');
        assert.strictEqual(visibility,false);
    });

    it("should return false if data returns true", function() {
        api.setFlag('featureFalse', 'variant', function(rule) { return rule.data == 'succeed' });
        const visibility = api.isVisible('featureFalse', 'variant', 'succeed');
        assert.strictEqual(visibility,true);
    });

    it("should pass correct parameters for visibilityrule", function() {
        api.setFlag('featureFalse2', 'variant', function(rule) {
            if (rule._internalCall)
                return;
            assert.strictEqual(rule.name,'featureFalse2');
            assert.strictEqual(rule.variant,'variant');
            assert.strictEqual(rule.data,'succeed');
        });

        api.isVisible('featureFalse2', 'variant', 'succeed');

    });
});

describe("Default Visibility", function() {
    const api = useFeatureToggle();
    api.setDefaultFlag((result) => {
        return true;
    });

    it("should return true with legacy function-call defaultFlagif feature does not exist", function() {
        const legacyApi = useFeatureToggle();
        legacyApi.defaultVisibility((result) => {
            return true;
        });
        const visibility = legacyApi.isVisible('featureNotExists');
        assert.strictEqual(visibility,true);
    });
    it("should return true if feature does not exist", function() {
        const visibility = api.isVisible('featureNotExists');
        assert.strictEqual(visibility,true);
    });

    it("should return true if feature withVariant does not exist", function() {
        const visibility = api.isVisible('featureNotExists', 'variant');
        assert.strictEqual(visibility,true);
    });

    it("should return false if feature is False", function() {
        api.setFlag('featureFalse', false);
        const visibility = api.isVisible('featureFalse');
        assert.strictEqual(visibility,false);
    });

    it("should return false if feature with variant isFalse", function() {
        api.setFlag('featureFalse2', false)
        const visibility = api.isVisible('featureFalse2', 'variant', false);
        assert.strictEqual(visibility,false);
    });
});

describe("Required Flag", function() {
    const api = useFeatureToggle();
    api.setRequiredFlag((result) => {
        return result.variant == "valid";
    });

    it("should return true with legacy function requiredFlag if required rule matches and visibiltiyrule", function() {
        const legacyApi = useFeatureToggle();
        legacyApi.requiredVisibility((result) => {
            return result.variant == "valid";
        });
        legacyApi.setFlag('featureTrue', true);
        const visibility = legacyApi.isVisible('featureTrue', 'valid');
        assert.strictEqual(visibility,true);
    });

    it("should return false if feature does not exist and requirerule matches", function() {
        api.setFlag('featureNotExists', 'valid', false);
        const visibility = api.isVisible('featureNotExists', 'valid');
        assert.strictEqual(visibility,false);
    });
    it("should return false if feature does not exist and requirerule matches not", function() {
        api.setFlag('featureNotExists', 'invalid', false);
        const visibility = api.isVisible('featureNotExists', 'invalid');
        assert.strictEqual(visibility,false);
    });


    it("should return false if only required rule matches", function() {
        api.setFlag('featureFalse', false);
        const visibility = api.isVisible('featureFalse', 'valid');
        assert.strictEqual(visibility,false);
    });

    it("should return true if required rule matches and visibiltiyrule", function() {
        api.setFlag('featureTrue', true);
        const visibility = api.isVisible('featureTrue', 'valid');
        assert.strictEqual(visibility,true);
    });

    it("should return false if defaultFlag returns true", function() {
        api.setDefaultFlag((result) => {
            return true;
        });
        const visibility = api.isVisible('featureTrue', 'invalid');
        assert.strictEqual(visibility,false);
    });
});

describe("Listener", function() {
    const api = useFeatureToggle({
        feature: true,
        "feature2#variant": true
    });

    it("should have an event called on('visibilityrule')", function() {
        api.on('visibilityrule', function() {

        });
    });

    it("should access function twice for two initial eventnames", function() {
        var listenedEvents : string[] = [];

        api.on('visibilityrule', function(event) {
            listenedEvents.push(event.name + "," + event.variant + "," + event.result);
        })

        assert.strictEqual(JSON.stringify(listenedEvents),JSON.stringify(['feature,undefined,true', 'feature2,variant,true']));
    });

    it("should access function twice if visibilityrule is added before listener", function() {
        var listenedEvents :string[]= [];
        var localapi = useFeatureToggle({ feature: true });
        localapi.setFlag("feature2", "variant", true);
        localapi.on('visibilityrule', function(event) {
            listenedEvents.push(event.name + "," + event.variant + "," + event.result);
        })

        assert.strictEqual(JSON.stringify(listenedEvents),JSON.stringify(['feature,undefined,true', 'feature2,variant,true']));
    });

    it("should access function twice if visibilityrule is added after listener", function() {
        var listenedEvents :string[]= [];
        var localapi = useFeatureToggle({ feature: true });
        localapi.on('visibilityrule', function(event) {
            listenedEvents.push(event.name + "," + event.variant + "," + event.result);
        });
        localapi.setFlag("feature2", "variant", true);

        assert.strictEqual(JSON.stringify(listenedEvents),JSON.stringify(['feature,undefined,true', 'feature2,variant,true']));
    });

    it("should pass parameters as an object with result,name,variant,data", function() {
        var api = useFeatureToggle();
        api.setFlag('feature', 'variant', 'gruempfel', function(rule) {
            return (rule.data + rule.name + rule.variant) == 'gruempfelfeaturevariant';
        });

        api.on('visibilityrule', function(event) {
            assert.strictEqual(event.result,true);
            assert.strictEqual(event.name,"feature");
            assert.strictEqual(event.variant,"variant");
            assert.strictEqual(event.data,"gruempfel");
        })
    });

    it("should be executed, when data has changed", function() {
        var api = useFeatureToggle();
        var totalData = '';

        api.on('visibilityrule', function(event) {
            totalData += event.data + ',';
        });

        api.setFlag('feature', 'variant', 'gruempfel', true);
        api.setData('feature', 'variant', 'newgruempfel');
        api.setFlag('feature2', null, 'gruempfel2', true);
        api.setData('feature2', 'newgruempfel2');
        assert.strictEqual(totalData,'gruempfel,newgruempfel,gruempfel2,newgruempfel2,');
    });

    it("should trigger a custom defined event", function() {
        var api = useFeatureToggle();

        let customEvent :any= false;
        api.on('customevent', function(param) {
            customEvent = param;
        });

        api.trigger('customevent', 'fired');
        assert.strictEqual(customEvent,'fired');
    });
});

describe("Plugins", function() {

    it("function addPlugin should exist", function() {
        var api = useFeatureToggle();

        assert.notStrictEqual(api.addPlugin,null);
    });

    it("should add attribute 'newplugin' to the api", function() {
        function newPlugin(api) {
            api.newplugin = true;
        }

        var api = useFeatureToggle();
        api.addPlugin(newPlugin);
        assert.strictEqual(api.newplugin,true);
    });

    it("should add plugins via attribute constructor config", function() {
        function newPlugin(api) {
            api.newplugin = true;
        }

        var api = useFeatureToggle({},{ _plugins: [newPlugin] });

        assert.strictEqual(api.newplugin,true);
        assert.strictEqual(api.isVisible('_plugin'),false);
    });

    it("should only be executed once", function() {
        var api = useFeatureToggle();
        api.count = 0;

        function countPlugin(api) {
            api.count += 1;
        }

        api.addPlugin(countPlugin);
        api.addPlugin(countPlugin);
        assert.strictEqual(api.count,1);
    });

    it("should trigger the init-event", function() {
        function newPlugin(api) {
            api.on('init', function() {
                api.initTriggered = true;
            })
        }

        var api = useFeatureToggle({},{ _plugins: [newPlugin] });
        assert.strictEqual(api.initTriggered,true);
    });
});

describe("URL-Plugin", function() {
    it("should return empty string for url", function() {
        var api = useFeatureToggle({},{
            _plugins: [urlPlugin({ useMockedWindow:true})]
        });
        assert.strictEqual(api.url,"");
    })
    it("should have api.url = anydomain.de if set in pluginconfig", function() {
        var api = useFeatureToggle({},{
            _plugins: [urlPlugin({
                url: "http://anydomain.de",
                useMockedWindow:true
            })]
        });
        assert.strictEqual(api.url,"http://anydomain.de");
    })
    it("should have feature1 visible if param feature1=true exists", function() {
        var api = useFeatureToggle({},{
            _plugins: [urlPlugin({ url: 'anydomain.de?feature1=true', useMockedWindow:true })]
        });
        const visibilityF1 = api.isVisible("feature1");
        const visibilityF2 = api.isVisible("feature2");
        assert.strictEqual(visibilityF1,true);
        assert.strictEqual(visibilityF2,false);
    })
    it("should only regard params with prefix", function() {
        var api = useFeatureToggle({},{
            _plugins: [urlPlugin({
                url: 'anydomain.de?feature1=true&_feature2=true',
                prefix: '_',
                useMockedWindow:true
            })]
        });
        const visibilityF1 = api.isVisible("feature1");
        const visibilityF2 = api.isVisible("feature2");
        const visibility_F1 = api.isVisible("_feature1");
        const visibility_F2 = api.isVisible("_feature2");
        assert.strictEqual(visibilityF1,false);
        assert.strictEqual(visibilityF2,true);
        assert.strictEqual(visibility_F1,false);
        assert.strictEqual(visibility_F2,false);
    })
});