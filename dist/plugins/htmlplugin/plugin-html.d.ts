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
export { htmlPlugin };
