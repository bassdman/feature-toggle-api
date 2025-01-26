

import { useFeatureToggle } from "feature-toggle-api";

const feature = useFeatureToggle({      
    a:true, 
});

console.log(feature.isVisible('a')); //true
console.log(feature.isVisible('c')); //false