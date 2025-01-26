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
interface OnEvent {
    name: string;
    variant: string;
    data: any;
    result?: boolean;
}
interface VisibilityConfig {
    [key: string]: boolean | (() => boolean);
}
interface FeatureToggleConfig {
    _plugins?: ((api: any) => void)[];
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
    visibility(name: string, result: boolean | ((rule: Rule) => boolean)): void;
    visibility(name: string, variant: string | null, result: boolean | ((rule: Rule) => boolean)): void;
    visibility(name: string, variant: string | null, data: any, result: boolean | ((rule: Rule) => boolean)): void;
    visibility(name: string, resultOrVariant: string | null | boolean | ((rule: Rule) => boolean), resultOrData?: any, result?: boolean | (() => boolean)): void;
    requiredVisibility(fn: boolean | ((result: Rule) => boolean)): void;
    defaultVisibility(fn: boolean | ((result: Rule) => boolean)): void;
    addPlugin(plugin: ((api: any) => void)): any;
}
declare function useFeatureToggle(visibilityConfig?: VisibilityConfig, config?: FeatureToggleConfig): FeatureToggleApi;

export { htmlPlugin, urlPlugin, useFeatureToggle };
