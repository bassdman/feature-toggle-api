interface URLPluginConfig {
    useMockedWindow?: boolean;
    url?: string;
    prefix?: string;
}
declare global {
    interface Window {
        isMocked: boolean;
    }
}
declare function urlPlugin(config?: URLPluginConfig): (api: any) => {
    name: string;
};

type Display = 'block' | 'inline-block' | 'inline' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid';
interface HtmlPluginConfig {
    renderedTag?: string;
    featureTagName?: string;
    tagAttributeName?: string;
    nameAttributeName?: string;
    variantAttributeName?: string;
    dataAttributeName?: string;
    displayAttributeName?: string;
    defaultDisplay?: Display;
}
declare function htmlPlugin(config?: HtmlPluginConfig): (api: any) => {
    name: string;
};

interface OnConfiguration {
    ignorePreviousRules: boolean;
}
type Plugin = (api: any) => void;
interface OnEvent {
    name: string;
    variant: string;
    data: any;
    result?: boolean;
}
interface FeatureToggleConfig {
    [key: FeatureFlagKey]: boolean | (() => boolean);
    $plugins?: Plugin[];
    /**
     * @deprecated Use key`$plugins` instead.
     */
    _plugins?: Plugin[];
}
interface Rule {
    name: string;
    variant: string;
    data: any;
    _internalCall?: true;
    description?: string;
}
interface FeatureToggleApi {
    name: string;
    setData(name: string, dataParam?: any): void;
    setData(name: string, variant: string, dataParam?: any): void;
    setData(nameParam: string, variantOrDataParam: string | {
        [key: string]: any;
    }, dataParam?: any): void;
    on(eventType: string, fn: (event: OnEvent) => void, config?: OnConfiguration): void;
    trigger(eventtype: string, param?: any): any;
    showLogs(showLogs?: boolean): void;
    isVisible(name: string, variant?: string, data?: any): boolean;
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, result: boolean | ((rule: Rule) => boolean)): void;
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, variant: string | null, result: boolean | ((rule: Rule) => boolean)): void;
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, variant: string | null, data: any, result: boolean | ((rule: Rule) => boolean)): void;
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, resultOrVariant: string | null | boolean | ((rule: Rule) => boolean), resultOrData?: any, result?: boolean | (() => boolean)): void;
    setFlag(name: string, result: boolean | ((rule: Rule) => boolean)): void;
    setFlag(name: string, variant: string | null, result: boolean | ((rule: Rule) => boolean)): void;
    setFlag(name: string, variant: string | null, data: any, result: boolean | ((rule: Rule) => boolean)): void;
    setFlag(name: string, resultOrVariant: string | null | boolean | ((rule: Rule) => boolean), resultOrData?: any, result?: boolean | (() => boolean)): void;
    /**
     * @deprecated Use `featureToggle.setRequiredFlag` instead.
     */
    requiredVisibility(fn: boolean | ((result: Rule) => boolean)): void;
    /**
     * @deprecated Use `featureToggle.setDefaultFlag` instead.
     */
    defaultVisibility(fn: boolean | ((result: Rule) => boolean)): void;
    /**
     * This rule will run first and only if it is true, the feature.setFlag() - rules apply.
     * In other words: if the required-rule returns false, all feature.setFlag-rules return false - regardless of its normal result.
     * @param fn
     */
    setRequiredFlag(fn: boolean | ((result: Rule) => boolean)): void;
    /**
     * This is the default-rule and will be overwritten by feature.setFlag() - rules.
     * In other words: If feature.setFlag == false, the result of the defaultRule applies.
     * @param fn DefaultRule
     */
    setDefaultFlag(fn: boolean | ((result: Rule) => boolean)): void;
    addPlugin(plugin: Plugin): any;
}
declare function useFeatureToggle(config?: FeatureToggleConfig): FeatureToggleApi;

export { htmlPlugin, urlPlugin, useFeatureToggle };
