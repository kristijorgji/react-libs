import { renderHook } from '@testing-library/react';
import { type NavigateOptions } from 'react-router-dom';
import { type Mock, expect, it, vi } from 'vitest';

import * as localizeModule from '../src/localizeRoutePath';
import type { RouteParams } from '../src/types';
import { useLocalizedNavigate } from '../src/useLocalizedNavigate';
import { DEFAULT_LOCALE, TEST_ROUTES } from './fixtures/routes';

const mockLanguage = 'de';
const { mockNavigateFn } = vi.hoisted(() => ({
    mockNavigateFn: vi.fn(),
}));

const mockConfig = { useLocaleInPath: false, usePrefixForDefaultLocale: false };

vi.mock('react-i18next', async () => {
    const { createReactI18nextPartialMock } = await import('./mocks/react-i18next');
    return createReactI18nextPartialMock({ getLanguage: () => mockLanguage });
});

vi.mock('react-router-dom', async () => {
    const { createReactRouterDomPartialMock } = await import('./mocks/react-router-dom');
    return createReactRouterDomPartialMock({
        useNavigate: () => mockNavigateFn,
        useLocation: vi.fn(),
    });
});

vi.mock('../src/localizeRoutePath', () => ({
    localizeRoutePath: vi.fn().mockReturnValue('dummy'),
}));

vi.mock('../src/LocalizedRouterContext', () => ({
    useLocalizedRouterContext: () => ({
        config: mockConfig,
        defaultLocale: DEFAULT_LOCALE,
        routes: TEST_ROUTES,
    }),
}));

it('calls react navigate with the localized route path', () => {
    const { result } = renderHook(() => useLocalizedNavigate());
    const navigate = result.current;

    const expectedParams: RouteParams = {
        urlParams: { id: 'abc' },
        query: { a: '23', b: '6c' },
    };

    const expectedNavigateOptions: NavigateOptions = { replace: true };

    navigate('DEMO', expectedParams ?? undefined, expectedNavigateOptions);

    expect(localizeModule.localizeRoutePath as Mock).toHaveBeenCalledWith(
        TEST_ROUTES,
        DEFAULT_LOCALE,
        'de',
        'DEMO',
        expectedParams,
        mockConfig
    );
    expect(mockNavigateFn).toHaveBeenCalledWith('dummy', expectedNavigateOptions);
});
