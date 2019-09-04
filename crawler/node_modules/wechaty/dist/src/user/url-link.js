"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
class UrlLink {
    constructor(payload) {
        this.payload = payload;
        config_1.log.verbose('UrlLink', 'constructor()');
    }
    /**
     *
     * Create from URL
     *
     */
    static create(url) {
        return __awaiter(this, void 0, void 0, function* () {
            config_1.log.verbose('UrlLink', 'create(%s)', url);
            // TODO: get title/description/thumbnailUrl from url automatically
            const payload = {
                description: 'todo',
                thumbnailUrl: 'todo',
                title: 'todo',
                url,
            };
            return new UrlLink(payload);
        });
    }
    toString() {
        return `UrlLink<${this.payload.url}>`;
    }
    url() {
        return this.payload.url;
    }
    title() {
        return this.payload.title;
    }
    thumbnailUrl() {
        return this.payload.thumbnailUrl;
    }
    description() {
        return this.payload.description;
    }
}
exports.UrlLink = UrlLink;
//# sourceMappingURL=url-link.js.map