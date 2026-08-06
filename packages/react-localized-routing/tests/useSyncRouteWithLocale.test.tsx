import { useEffect, useState } from 'react';

import { act, render } from '@testing-library/react';
import { type Location } from 'react-router-dom';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import * as localizeModule from '../src/localizeRoutePath';
import type { LocalizationConfig, LocalizedRouteMap } from '../src/types';
import { useSyncRouteWithLocale } from '../src/useSyncRouteWithLocale';
import { DEFAULT_LOCALE, TEST_ROUTES, TEST_ROUTES_IDS, type TestLocale } from './fixtures/routes';

let mockLanguage: TestLocale = DEFAULT_LOCALE;
const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn(),
}));

vi.mock('react-i18next', async () => {
    const { createReactI18nextPartialMock } = await import('./mocks/react-i18next');
    return createReactI18nextPartialMock({ getLanguage: () => mockLanguage });
});

const defaultLocation: Location = {
    pathname: '/en/settings',
    search: '?q=test',
    hash: '#section',
    state: {},
    key: '',
};
let mockLocation = defaultLocation;
vi.mock('react-router-dom', async () => {
    const { createReactRouterDomPartialMock } = await import('./mocks/react-router-dom');
    return createReactRouterDomPartialMock({
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocation,
    });
});

vi.mock('../src/localizeRoutePath', () => ({
    localizeRoutePath: vi.fn(),
}));

describe('useSyncRouteWithLocale', () => {
    let mockRoutes: LocalizedRouteMap<TestLocale, string, 'en'> = TEST_ROUTES;
    const mockLocalizeRouteReturn = 'mockLocalizeRouteReturn';
    const mockLocalizationConfig: LocalizationConfig = {
        useLocaleInPath: true,
        usePrefixForDefaultLocale: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocation = defaultLocation;
        mockRoutes = TEST_ROUTES;
        (localizeModule.localizeRoutePath as Mock).mockReturnValue(mockLocalizeRouteReturn);
    });

    function TestComponentThatChangesLocale({
        initialLocale,
        localizationConfig,
        changeToLocale,
    }: {
        initialLocale: TestLocale;
        localizationConfig: LocalizationConfig;
        changeToLocale: TestLocale;
    }) {
        const [lang, setLang] = useState(initialLocale);

        // Override mocks to reflect dynamic language and navigate
        useEffect(() => {
            // After initial render, simulate locale change
            setTimeout(() => {
                mockLanguage = changeToLocale;
                setLang(changeToLocale);
            }, 0);
        }, [changeToLocale]);

        useSyncRouteWithLocale(localizationConfig, DEFAULT_LOCALE, mockRoutes);

        return <div>{lang}</div>;
    }

    async function assertNavigationOnLocaleChange(
        mocks: {
            pathname: string;
            initialLocale: TestLocale;
            changeToLocale: TestLocale;
            localizationConfig: LocalizationConfig;
        },
        expected: {
            routeId: string | null;
            urlParams?: Record<string, string | number>;
        } = { routeId: TEST_ROUTES_IDS.SETTINGS }
    ) {
        mockLanguage = mocks.initialLocale;
        mockLocation = { ...mockLocation, pathname: mocks.pathname };

        render(
            <TestComponentThatChangesLocale
                changeToLocale={mocks.changeToLocale}
                initialLocale={mocks.initialLocale}
                localizationConfig={mocks.localizationConfig}
            />
        );

        await act(() => new Promise((r) => setTimeout(r, 0)));

        if (expected.routeId) {
            expect(localizeModule.localizeRoutePath).toHaveBeenCalledWith(
                mockRoutes,
                DEFAULT_LOCALE,
                mocks.changeToLocale,
                expected.routeId,
                {
                    urlParams: expected.urlParams ?? {},
                    hash: '#section',
                    query: { q: 'test' },
                },
                mocks.localizationConfig
            );
            expect(mockNavigate).toHaveBeenCalledWith(mockLocalizeRouteReturn, { replace: true });
        } else {
            expect(localizeModule.localizeRoutePath).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        }
    }

    it('navigates when switching from default to non-default locale', async () => {
        await assertNavigationOnLocaleChange({
            pathname: '/settings',
            initialLocale: 'en',
            changeToLocale: 'de',
            localizationConfig: mockLocalizationConfig,
        });
    });

    it('navigates with path params', async () => {
        await assertNavigationOnLocaleChange(
            {
                pathname: '/de/d/23',
                initialLocale: 'de',
                changeToLocale: 'en',
                localizationConfig: mockLocalizationConfig,
            },
            { routeId: 'DEMO', urlParams: { id: '23' } }
        );
    });

    it('does not navigate if locale has not changed', () => {
        function TestComponent() {
            useSyncRouteWithLocale(mockLocalizationConfig, DEFAULT_LOCALE, mockRoutes);
            return <div>Test</div>;
        }

        render(<TestComponent />);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
