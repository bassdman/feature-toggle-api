import { urlPlugin } from "./plugins/urlplugin/plugin-url"
import { htmlPlugin } from "./plugins/htmlplugin/plugin-html"
import useFeatureToggle from "./featureToggle"
import type {
    FeatureFlag, FeatureFlagKey, FeatureToggleApi, FeatureToggleApiBase, FeatureToggleConfig, FirstCharOfFeatureFlagKey, OnConfiguration, EventType, OnEvent
} from './types';

export {
    useFeatureToggle,
    urlPlugin,
    htmlPlugin,
    FeatureFlag, FeatureFlagKey, FeatureToggleApi, FeatureToggleApiBase, FeatureToggleConfig, FirstCharOfFeatureFlagKey, OnConfiguration, EventType, OnEvent
}