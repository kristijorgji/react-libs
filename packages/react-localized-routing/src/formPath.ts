import { addOrUpdateUrlQueryParameters } from './queryUtils.js';
import type { FormPathParams } from './types.js';

export function formPath(route: FormPathParams): string {
    let r = route.pathname;

    const urlTokens = [...r.matchAll(/:([^:/]+)/g)].flatMap((match) =>
        match[1] !== undefined ? [match[1]] : []
    );

    if (route.urlParams) {
        const urlParams = JSON.parse(JSON.stringify(route.urlParams)) as Record<string, string>;
        for (const paramKey of urlTokens) {
            const value = urlParams[paramKey];
            if (value !== undefined) {
                r = r.replace(`:${paramKey}`, value);
            }
            delete urlParams[paramKey];
        }
    }

    r = route.query ? addOrUpdateUrlQueryParameters(r, route.query as Record<string, string>) : r;

    if (route.hash) {
        const normalizedHash = route.hash.startsWith('#') ? route.hash.slice(1) : route.hash;
        r += `#${normalizedHash}`;
    }

    return r;
}
