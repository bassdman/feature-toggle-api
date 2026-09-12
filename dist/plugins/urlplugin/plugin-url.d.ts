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
export { urlPlugin };
