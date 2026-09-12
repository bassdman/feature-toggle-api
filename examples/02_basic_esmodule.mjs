import { useFeatureToggle } from "feature-toggle-api";

const feature = useFeatureToggle({a:true, b:false});

console.log(feature.isActive('a'));
console.log(feature.isActive('c'));