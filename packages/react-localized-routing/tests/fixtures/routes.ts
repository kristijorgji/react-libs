export const TEST_ROUTES_IDS = {
    INDEX: 'INDEX',
    LOGIN: 'LOGIN',
    ANALYTICS: 'ANALYTICS',
    SETTINGS: 'SETTINGS',
    DEMO: 'DEMO',
} as const;

export type TestRouteId = (typeof TEST_ROUTES_IDS)[keyof typeof TEST_ROUTES_IDS];
export type TestLocale = 'en' | 'de';

export const DEFAULT_LOCALE = 'en' as const satisfies TestLocale;

export const TEST_ROUTES = {
    en: {
        [TEST_ROUTES_IDS.INDEX]: { href: '/' },
        [TEST_ROUTES_IDS.LOGIN]: { href: '/login' },
        [TEST_ROUTES_IDS.ANALYTICS]: { href: '/analytics' },
        [TEST_ROUTES_IDS.SETTINGS]: { href: '/settings' },
        [TEST_ROUTES_IDS.DEMO]: { href: '/demo/:id' },
    },
    de: {
        [TEST_ROUTES_IDS.LOGIN]: { href: '/anmelden' },
        [TEST_ROUTES_IDS.ANALYTICS]: { href: '/analytik' },
        [TEST_ROUTES_IDS.SETTINGS]: { href: '/einstellungen' },
        [TEST_ROUTES_IDS.DEMO]: { href: '/d/:id' },
    },
} as const;
