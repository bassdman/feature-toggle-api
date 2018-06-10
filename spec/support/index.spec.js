const featureToggleApi = require('../../dist/feature-toggle-api.js').default;

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
        api.visibility('featureFalse', 'variant', function (data, name, variant) { return data == 'succeed' });
        const visibility = api.isVisible('featureFalse', 'variant', 'fail');
        expect(visibility).toBe(false);
    });

    it("should return false if data returns true", function () {
        api.visibility('featureFalse', 'variant', function (data, name, variant) { return data == 'succeed' });
        const visibility = api.isVisible('featureFalse', 'variant', 'succeed');
        expect(visibility).toBe(true);
    });
});

describe("Default Visibility", function () {
    const api = new featureToggleApi();
    api.defaultVisibility((data, name, variant) => {
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

    it("should return false if feature isFalse", function () {
        api.visibility('featureFalse', false)
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
    api.requiredVisibility((data, name, variant) => {
        return variant == "valid";
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
        api.defaultVisibility((data, name, variant) => {
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
    it("should throw an error for an invalid eventname", function () {
        var addInvalidEvent = function () {
            api.on('changexxx', function () {

            })
        };
        expect(addInvalidEvent).toThrow();
    });
    it("should access function twice for two initial eventnames", function () {
        var listenedEvents = [];

        api.on('visibilityrule', function (result,name,variant,data) {
            listenedEvents.push(name+","+variant+","+result);
        })

        expect(JSON.stringify(listenedEvents)).toBe(JSON.stringify(['feature,undefined,true','feature2,variant,true']));
    });

    it("should access function twice if visibilityrule is added before listener", function () {
        var listenedEvents = [];
        var localapi = new featureToggleApi({feature: true});
        localapi.visibility("feature2","variant",true);
        localapi.on('visibilityrule', function (result,name,variant) {
            listenedEvents.push(name+","+variant+","+result);
        })

        expect(JSON.stringify(listenedEvents)).toBe(JSON.stringify(['feature,undefined,true','feature2,variant,true']));
    });

    it("should access function twice if visibilityrule is added after listener", function () {
        var listenedEvents = [];
        var localapi = new featureToggleApi({feature: true});
        localapi.on('visibilityrule', function (result,name,variant) {
            listenedEvents.push(name+","+variant+","+result);
        });
        localapi.visibility("feature2","variant",true);

        expect(JSON.stringify(listenedEvents)).toBe(JSON.stringify(['feature,undefined,true','feature2,variant,true']));
    });

    it("should pass parameters in order result,name,variant,visibilityruleFn", function () {
        var listenedEvents = [];
        var localapi2 = new featureToggleApi({feature: true});
        localapi2.on('visibilityrule', function (result,name,variant,fn) {
            listenedEvents.push(result);
            listenedEvents.push(name);
            listenedEvents.push(variant)
            listenedEvents.push(fn);
        });
        expect(listenedEvents[0]).toBe(true);
        expect(listenedEvents[1]).toBe("feature");
        expect(listenedEvents[2]).toBe(undefined);
        expect(typeof listenedEvents[3]).toBe('function');
    });

    it("should work with custom data", function () {
        var api = new featureToggleApi({feature: function(data,name,variant){return data == 'grumpfelfeature'}});
        
        //The result: 
        //true, 'feature', undefined
        //false, 'feature2, 'variant'
        api.on('visibilityrule', function (wrongResult,name,variant,visibilityrule) {
            const data = "grumpfel"+name;
            const result = visibilityrule(data,name,variant);
            expect(result).toBe(true);
            expect(name).toBe("feature");
            expect(variant).toBe(undefined);
        })
       // expect(listenedEvents[0]).toBe(true);
      //  expect(listenedEvents[1]).toBe("feature");
      //  expect(listenedEvents[2]).toBe(undefined);
      //  expect(typeof listenedEvents[3]).toBe('function');
    });
});