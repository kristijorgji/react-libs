import { act, renderHook } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { type Location, useLocation } from 'react-router-dom';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import * as findRouteModule from '../src/findRoute';
import type { FindRouteResult, LocalizationConfig } from '../src/types';
import { useMatchedRoute } from '../src/useMatchedRoute';
import { DEFAULT_LOCALE, TEST_ROUTES, type TestRouteId } from './fixtures/routes';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useLocation: vi.fn(),
}));

vi.mock('../src/LocalizedRouterContext', () => ({
    useLocalizedRouterContext: vi.fn(),
}));

vi.mock('../src/findRoute', () => ({
    findRoute: vi.fn(),
}));

const mockUseTranslation = useTranslation as unknown as Mock;
const mockUseLocation = useLocation as unknown as Mock;
const { useLocalizedRouterContext } = await import('../src/LocalizedRouterContext');
const mockUseRouterContext = useLocalizedRouterContext as unknown as Mock;
const mockFindRoute = findRouteModule.findRoute as unknown as Mock;

const MOCK_ROUTER_CONFIG: LocalizationConfig = {
    useLocaleInPath: true,
    usePrefixForDefaultLocale: false,
};
const MOCK_DEFAULT_LOCATION: Location = {
    pathname: '/settings',
    search: '',
    hash: '',
    state: null,
    key: 'default',
};

describe('useMatchedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUseTranslation.mockReturnValue({ i18n: { language: DEFAULT_LOCALE } });
        mockUseLocation.mockReturnValue(MOCK_DEFAULT_LOCATION);
        mockUseRouterContext.mockReturnValue({
            config: MOCK_ROUTER_CONFIG,
            defaultLocale: DEFAULT_LOCALE,
            routes: TEST_ROUTES,
        });
        mockFindRoute.mockReturnValue(null);
    });

    it('calls findRoute with context values', () => {
        const mockFoundRoute: FindRouteResult<TestRouteId> = { routeId: 'SETTINGS', params: null };
        mockFindRoute.mockReturnValueOnce(mockFoundRoute);

        const { result } = renderHook(() => useMatchedRoute());

        expect(mockFindRoute).toHaveBeenCalledWith(
            MOCK_ROUTER_CONFIG,
            DEFAULT_LOCALE,
            TEST_ROUTES,
            DEFAULT_LOCALE,
            MOCK_DEFAULT_LOCATION
        );
        expect(result.current).toEqual(mockFoundRoute);
    });

    it('recomputes when language changes', () => {
        mockFindRoute.mockReturnValueOnce({ routeId: 'SETTINGS', params: null });
        mockFindRoute.mockReturnValueOnce({ routeId: 'SETTINGS', params: null });

        const { rerender } = renderHook(() => useMatchedRoute());
        expect(mockFindRoute).toHaveBeenCalledTimes(1);

        mockUseTranslation.mockReturnValue({ i18n: { language: 'fr' } });
        act(() => rerender());

        expect(mockFindRoute).toHaveBeenCalledTimes(2);
        expect(mockFindRoute).toHaveBeenLastCalledWith(
            MOCK_ROUTER_CONFIG,
            DEFAULT_LOCALE,
            TEST_ROUTES,
            'fr',
            MOCK_DEFAULT_LOCATION
        );
    });

    it('does not call findRoute again when deps are unchanged', () => {
        mockFindRoute.mockReturnValue({ routeId: 'SETTINGS', params: null });
        const { rerender } = renderHook(() => useMatchedRoute());
        expect(mockFindRoute).toHaveBeenCalledTimes(1);
        act(() => rerender());
        expect(mockFindRoute).toHaveBeenCalledTimes(1);
    });
});
