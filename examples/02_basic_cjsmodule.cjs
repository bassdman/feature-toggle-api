const {useFeatureToggle} = require("feature-toggle-api/dist/feature-toggle.cjs");

const feature = useFeatureToggle({a:true, b:false});

console.log(feature.isVisible('a'));
console.log(feature.isVisible('c'));
