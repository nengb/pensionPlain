"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cuid_1 = __importDefault(require("cuid"));
function generateToken() {
    const token = cuid_1.default().substr(1) + cuid_1.default().substr(1); // substr: get rid of the starting `c`
    return token.toUpperCase();
}
exports.generateToken = generateToken;
//# sourceMappingURL=generate-token.js.map