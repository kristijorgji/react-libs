import type { Location } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { findRoute } from '../src/findRoute';
import type { FindRouteResult } from '../src/types';
import { TEST_ROUTES } from './fixtures/routes';

describe('findRoute', () => {
    const prefixedEnLocation: Location = {
        pathname: '/en/settings',
        search: '?q=test',
        hash: '#section',
        state: {},
        key: '',
    };

    const nonPrefixedEnLocation: Location = {
        pathname: '/settings',
        search: '?q=test',
        hash: '#section',
        state: {},
        key: '',
    };

    const expectedFoundSettingsRoute: FindRouteResult<string> = {
        params: {
            hash: '#section',
            query: { q: 'test' },
            urlParams: {},
        },
        routeId: 'SETTINGS',
    };

    it('normalizes trailing slash for /{locale}', () => {
        expect(
            findRoute(
                { useLocaleInPath: true, usePrefixForDefaultLocale: false },
                'en',
                TEST_ROUTES,
                'en',
                { ...prefixedEnLocation, pathname: `/en` }
            )
        ).toEqual({
            params: {
                hash: '#section',
                query: { q: 'test' },
                urlParams: {},
            },
            routeId: 'INDEX',
        });
    });

    it('finds default locale routes with and without prefixes', () => {
        expect(
            findRoute(
                { useLocaleInPath: true, usePrefixForDefaultLocale: false },
                'en',
                TEST_ROUTES,
                'en',
                prefixedEnLocation
            )
        ).toEqual(expectedFoundSettingsRoute);

        expect(
            findRoute(
                { useLocaleInPath: true, usePrefixForDefaultLocale: true },
                'en',
                TEST_ROUTES,
                'en',
                prefixedEnLocation
            )
        ).toEqual(expectedFoundSettingsRoute);

        expect(
            findRoute(
                { useLocaleInPath: false, usePrefixForDefaultLocale: false },
                'en',
                TEST_ROUTES,
                'en',
                nonPrefixedEnLocation
            )
        ).toEqual(expectedFoundSettingsRoute);
    });

    it('finds non-default locale routes', () => {
        for (const pathname of ['/de/einstellungen', '/de/einstellungen/']) {
            expect(
                findRoute(
                    { useLocaleInPath: true, usePrefixForDefaultLocale: false },
                    'en',
                    TEST_ROUTES,
                    'de',
                    { ...prefixedEnLocation, pathname }
                )
            ).toEqual(expectedFoundSettingsRoute);
        }

        for (const pathname of ['/einstellungen', '/einstellungen/']) {
            expect(
                findRoute(
                    { useLocaleInPath: false, usePrefixForDefaultLocale: true },
                    'en',
                    TEST_ROUTES,
                    'de',
                    { ...prefixedEnLocation, pathname }
                )
            ).toEqual(expectedFoundSettingsRoute);
        }
    });

    it('returns null when no route matches', () => {
        expect(
            findRoute(
                { useLocaleInPath: true, usePrefixForDefaultLocale: true },
                'en',
                TEST_ROUTES,
                'de',
                { ...prefixedEnLocation, pathname: '/not-existing' }
            )
        ).toBe(null);
    });
});
