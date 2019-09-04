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
export declare function getPort(basePort?: number): Promise<number>;
//# sourceMappingURL=get-port.d.ts.map