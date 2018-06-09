var featureToggleApi = require('../../dist/feature-toggle-api.min.js');

describe("Feature Toggle API Tests", function () {
    it("should return a function", function () {
        const type = typeof featureToggleApi;
        expect(type).toBe('function');
    });

    it("should return 'feature-toggle-api' for property name", function () {
        const api = featureToggleApi();
        expect(api.name).toBe('feature-toggle-api');
    });
});