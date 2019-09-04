#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppet_manager_1 = require("../src/puppet-manager");
puppet_manager_1.PuppetManager.installAll()
    .catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=puppet-install.js.map