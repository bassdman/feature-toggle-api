export interface OnConfiguration {
    ignorePreviousRules: boolean
}
export type Plugin = (api) => Partial<FeatureToggleApi>;

export type EventType = 'visibilityrule' | 'init' | 'registerEvent' | string;
export interface OnEvent {
    name: string,
    variant: string,
    data: any,
    result?: boolean
}

export type FirstCharOfFeatureFlagKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' |
    'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
    
export type FeatureFlagKey = `${FirstCharOfFeatureFlagKey}${string}`;
export type FeatureFlag = boolean | ((rule:Rule) => boolean);
export interface FeatureToggleConfig {
    [key: FeatureFlagKey]: FeatureFlag,
    $plugins?: Plugin[]
    /**
     * @deprecated Use key`$plugins` instead.
     */
    _plugins?: Plugin[]

    /**
     * This rule will always run before the main rule. 
     * If it returns false, the main rules will be skipped and false is returned
     */
    $required?: FeatureFlag

    /**
     * This rule will always run after the main rule. 
     * If the main rule returns false, the result of the default rule will be taken.s
     */
    $default?: FeatureFlag
}

export interface Rule {
    name: string,
    variant: string,
    data: any,
    _internalCall?: true,
    description?: string
}

export interface FeatureToggleApiBase {
    name: string,
    setData(name: string, dataParam?: any): void;
    setData(name: string, variant: string, dataParam?: any): void,
    setData(nameParam: string, variantOrDataParam: string | { [key: string]: any },
        dataParam?: any): void;

    on(eventType: EventType, fn: (event: OnEvent) => void, config?: OnConfiguration): void;
    trigger(eventtype: EventType, param?: any);
    showLogs(showLogs?: boolean): void

    /**
     * @deprecated Use `featureToggle.isActive` instead.
     */
    isVisible(name: string, variant?: string, data?: any): boolean

    isActive(name: string, variant?: string, data?: any): boolean

    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, result: boolean | ((rule: Rule) => boolean)): void,
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, variant: string | null, result: boolean | ((rule: Rule) => boolean)): void
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, variant: string | null, data: any, result: boolean | ((rule: Rule) => boolean)): void,
    /**
     * @deprecated Use `featureToggle.setFlag` instead.
     */
    visibility(name: string, resultOrVariant: string | null | boolean | ((rule: Rule) => boolean), resultOrData?: any, result?: boolean | (() => boolean)): void

    setFlag(name: string, result: boolean | ((rule: Rule) => boolean)): void,
    setFlag(name: string, variant: string | null, result: boolean | ((rule: Rule) => boolean)): void,
    setFlag(name: string, variant: string | null, data: any, result: boolean | ((rule: Rule) => boolean)): void,
    setFlag(name: string, resultOrVariant: string | null | boolean | ((rule: Rule) => boolean), resultOrData?: any, result?: boolean | (() => boolean)): void

    /**
     * @deprecated Use `featureToggle.setRequiredFlag` instead.
     */
    requiredVisibility(fn: boolean | ((result: Rule) => boolean)): void

    /**
     * @deprecated Use `featureToggle.setDefaultFlag` instead.
     */
    defaultVisibility(fn: boolean | ((result: Rule) => boolean)): void

    /**
     * This rule will run first and only if it is true, the feature.setFlag() - rules apply.
     * In other words: if the required-rule returns false, all feature.setFlag-rules return false - regardless of its normal result.
     * @param fn 
     */
    setRequiredFlag(fn: boolean | ((result: Rule) => boolean)): void

    /**
     * This is the default-rule and will be overwritten by feature.setFlag() - rules.
     * In other words: If feature.setFlag == false, the result of the defaultRule applies.
     * @param fn DefaultRule
     */
    setDefaultFlag(fn: boolean | ((result: Rule) => boolean)): void

    addPlugin(plugin: Plugin)
}

export type FeatureToggleApi = FeatureToggleApiBase & Record<string, any>;

export function abc(){}