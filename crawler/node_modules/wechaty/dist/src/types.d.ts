import { Contact } from './user';
export declare type AnyFunction = (...args: any[]) => any;
export interface Sayable {
    say(text: string, replyTo?: Contact | Contact[]): Promise<void>;
}
export interface Acceptable {
    accept: () => Promise<void>;
}
//# sourceMappingURL=types.d.ts.map