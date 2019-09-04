#!/usr/bin/env ts-node
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
const blue_tape_1 = __importDefault(require("blue-tape"));
// import sinon from 'sinon'
const clone_class_1 = require("clone-class");
const wechaty_puppet_mock_1 = require("wechaty-puppet-mock");
const contact_1 = require("./contact");
// tslint:disable-next-line:variable-name
const Contact = clone_class_1.cloneClass(contact_1.Contact);
blue_tape_1.default('Should not be able to instanciate directly', (t) => __awaiter(this, void 0, void 0, function* () {
    // tslint:disable-next-line:variable-name
    const MyContact = clone_class_1.cloneClass(Contact);
    t.throws(() => {
        const c = MyContact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `Contact.load()`');
    t.throws(() => {
        const c = MyContact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `Contact.load()`');
}));
blue_tape_1.default('Should not be able to instanciate through cloneClass without puppet', (t) => __awaiter(this, void 0, void 0, function* () {
    // tslint:disable-next-line:variable-name
    const MyContact = clone_class_1.cloneClass(Contact);
    t.throws(() => {
        const c = MyContact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `MyContact.load()` without puppet');
    t.throws(() => {
        const c = MyContact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `MyContact.load()` without puppet');
}));
blue_tape_1.default('should be able to instanciate through cloneClass with puppet', (t) => __awaiter(this, void 0, void 0, function* () {
    // tslint:disable-next-line:variable-name
    const MyContact = clone_class_1.cloneClass(Contact);
    MyContact.puppet = new wechaty_puppet_mock_1.PuppetMock();
    t.doesNotThrow(() => {
        const c = MyContact.load('xxx');
        t.ok(c, 'should get contact instance from `MyContact.load()');
    }, 'should not throw when `MyContact().load`');
    t.doesNotThrow(() => {
        const c = MyContact.load('xxx');
        t.ok(c, 'should get contact instance from `MyContact.load()`');
    }, 'should not throw when `MyContact.load()`');
}));
blue_tape_1.default('should throw when instanciate the global class', (t) => __awaiter(this, void 0, void 0, function* () {
    t.throws(() => {
        const c = contact_1.Contact.load('xxx');
        t.fail('should not run to here');
        t.fail(c.toString());
    }, 'should throw when we instanciate a global class');
}));
//# sourceMappingURL=contact.accessory.spec.js.map