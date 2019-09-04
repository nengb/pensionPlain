"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_retry_1 = __importDefault(require("promise-retry"));
function tryWait(retryableFn) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * 60 seconds: (to be confirmed)
         *  factor: 3
         *  minTimeout: 10
         *  maxTimeout: 20 * 1000
         *  retries: 9
         */
        const factor = 3;
        const minTimeout = 10;
        const maxTimeout = 20 * 1000;
        const retries = 9;
        // const unref      = true
        const retryOptions = {
            factor,
            maxTimeout,
            minTimeout,
            retries,
        };
        return promise_retry_1.default(retryOptions, retryableFn);
    });
}
exports.tryWait = tryWait;
//# sourceMappingURL=try-wait.js.map