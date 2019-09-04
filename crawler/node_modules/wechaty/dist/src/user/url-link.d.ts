import { UrlLinkPayload } from 'wechaty-puppet';
export declare class UrlLink {
    readonly payload: UrlLinkPayload;
    /**
     *
     * Create from URL
     *
     */
    static create(url: string): Promise<UrlLink>;
    constructor(payload: UrlLinkPayload);
    toString(): string;
    url(): string;
    title(): string;
    thumbnailUrl(): undefined | string;
    description(): undefined | string;
}
//# sourceMappingURL=url-link.d.ts.map