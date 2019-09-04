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
const portfinder_1 = __importDefault(require("portfinder"));
/**
 *
 * @param port is just a suggestion.
 * there's no grantuee for the number
 *
 * The IANA suggested ephemeral port range.
 * @see http://en.wikipedia.org/wiki/Ephemeral_ports
 *
 * const DEFAULT_IANA_RANGE = {min: 49152, max: 65535}
 *
 */
function getPort(basePort) {
    return __awaiter(this, void 0, void 0, function* () {
        if (basePort) {
            portfinder_1.default.basePort = basePort;
        }
        return portfinder_1.default.getPortPromise();
    });
}
exports.getPort = getPort;
//# sourceMappingURL=get-port.js.map