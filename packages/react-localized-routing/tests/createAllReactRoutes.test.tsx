import type { ReactNode } from 'react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAllReactRoutes } from '../src/createAllReactRoutes';
import type { LocalizationConfig } from '../src/types';
import { DEFAULT_LOCALE, TEST_ROUTES } from './fixtures/routes';

vi.mock('../src/createLocalizedRoute', () => ({
    createLocalizedRoute: vi.fn((routes, defaultLocale, locale, routeId, element) => ({
        type: 'div',
        key: `${locale}-${routeId}`,
        props: { 'data-testid': `${locale}-${routeId}`, children: element, routes, defaultLocale },
    })),
}));

const mockCreateLocalizedRoute = (await import('../src/createLocalizedRoute'))
    .createLocalizedRoute as ReturnType<typeof vi.fn>;

describe('createAllReactRoutes', () => {
    const routeConfigs: Record<string, ReactNode> = {
        INDEX: <div>Home</div>,
        SETTINGS: <div>Settings</div>,
    };

    const NoLocaleInPathConfig: LocalizationConfig = {
        useLocaleInPath: false,
        usePrefixForDefaultLocale: false,
    };

    const supportedLocales = ['en', 'de'] as const;

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('creates routes when useLocaleInPath is false', () => {
        const config: LocalizationConfig = {
            useLocaleInPath: false,
            usePrefixForDefaultLocale: false,
        };

        const routes = createAllReactRoutes(
            config,
            DEFAULT_LOCALE,
            supportedLocales,
            routeConfigs,
            TEST_ROUTES
        );

        // Should create:
        // - 2 routes for default locale without prefix (SETTINGS, HOME)
        // - 0 routes for default locale with prefix (because useLocaleInPath is false)
        // - 2 for 'de' locale without prefix
        expect(routes).toHaveLength(4);
        expect(mockCreateLocalizedRoute).toHaveBeenCalledTimes(4);
        expect(mockCreateLocalizedRoute.mock.calls).toEqual([
            [TEST_ROUTES, 'en', 'en', 'INDEX', routeConfigs.INDEX, NoLocaleInPathConfig],
            [TEST_ROUTES, 'en', 'en', 'SETTINGS', routeConfigs.SETTINGS, NoLocaleInPathConfig],
            [TEST_ROUTES, 'en', 'de', 'INDEX', routeConfigs.INDEX, config],
            [TEST_ROUTES, 'en', 'de', 'SETTINGS', routeConfigs.SETTINGS, config],
        ]);
    });

    it('includes default locale prefixed routes when useLocaleInPath is true', () => {
        const config: LocalizationConfig = {
            useLocaleInPath: true,
            usePrefixForDefaultLocale: true,
        };

        const routes = createAllReactRoutes(
            config,
            DEFAULT_LOCALE,
            supportedLocales,
            routeConfigs,
            TEST_ROUTES
        );

        // Should create: 6
        // - 2 routes for default locale without prefix (SETTINGS, HOME)
        // - 2 routes for default locale with prefix (to allow switching between with and without prefix based on usePrefixForDefaultLocale in the other hooks)
        // - 2 for 'de' locale with prefix
        expect(routes).toHaveLength(6);
        expect(mockCreateLocalizedRoute).toHaveBeenCalledTimes(6);
        expect(mockCreateLocalizedRoute.mock.calls).toEqual([
            [TEST_ROUTES, 'en', 'en', 'INDEX', routeConfigs.INDEX, NoLocaleInPathConfig],
            [TEST_ROUTES, 'en', 'en', 'SETTINGS', routeConfigs.SETTINGS, NoLocaleInPathConfig],
            [TEST_ROUTES, 'en', 'en', 'INDEX', routeConfigs.INDEX, config],
            [TEST_ROUTES, 'en', 'en', 'SETTINGS', routeConfigs.SETTINGS, config],
            [TEST_ROUTES, 'en', 'de', 'INDEX', routeConfigs.INDEX, config],
            [TEST_ROUTES, 'en', 'de', 'SETTINGS', routeConfigs.SETTINGS, config],
        ]);
    });
});
