import { render, renderHook, waitFor } from '@testing-library/react';
import { type Location, useLocation } from 'react-router-dom';
import { type Mock, beforeEach, expect, it, vi } from 'vitest';

import type { LocalizationConfig, LocaleRouteMap } from '../src/types';
import { useNormalizeDefaultLocalePath } from '../src/useNormalizeDefaultLocalePath';
import { DEFAULT_LOCALE, TEST_ROUTES, type TestLocale } from './fixtures/routes';

let mockLanguage: TestLocale = DEFAULT_LOCALE;
const { mockNavigateFn } = vi.hoisted(() => ({
    mockNavigateFn: vi.fn(),
}));

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

const dummyLocation: Location = {
    pathname: '/demo',
    search: '?q=test',
    hash: '#section',
    state: {},
    key: '',
};

function TestComponent({ config, defaultLocale }: { config: LocalizationConfig; defaultLocale: TestLocale }) {
    const location = useLocation();

    useNormalizeDefaultLocalePath(
        config,
        defaultLocale,
        TEST_ROUTES[defaultLocale] as LocaleRouteMap<string>,
        TEST_ROUTES
    );

    return (
        <div>
            <span data-testid="pathname">{location.pathname}</span>
        </div>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    mockLanguage = DEFAULT_LOCALE;
});

it('does nothing when locale is not the default', async () => {
    (useLocation as Mock).mockReturnValue({
        ...dummyLocation,
        pathname: '/settings',
    } satisfies Location);
    mockLanguage = 'de';

    render(
        <TestComponent
            config={{ useLocaleInPath: true, usePrefixForDefaultLocale: true }}
            defaultLocale="en"
        />
    );

    await waitFor(() => {
        expect(mockNavigateFn).not.toHaveBeenCalled();
    });
});

it('adds default locale prefix when usePrefixForDefaultLocale is true', async () => {
    (useLocation as Mock).mockReturnValue({
        ...dummyLocation,
        pathname: '/settings',
    } satisfies Location);

    render(
        <TestComponent
            config={{ useLocaleInPath: true, usePrefixForDefaultLocale: true }}
            defaultLocale={mockLanguage}
        />
    );

    await waitFor(() => {
        expect(mockNavigateFn).toHaveBeenCalledWith('/en/settings?q=test#section', { replace: true });
    });
});

it('should do nothing when the route cannot be found', async () => {
    (useLocation as Mock).mockReturnValue({
        ...dummyLocation,
        pathname: '/non-existing-route',
    } satisfies Location);

    render(
        <TestComponent
            config={{
                useLocaleInPath: true,
                usePrefixForDefaultLocale: true,
            }}
            defaultLocale={mockLanguage}
        />
    );

    await waitFor(() => {
        expect(mockNavigateFn).not.toHaveBeenCalled();
    });
});

it('adds default locale prefix when usePrefixForDefaultLocale is true and route has params, hash and query', async () => {
    (useLocation as Mock).mockReturnValue({
        ...dummyLocation,
        pathname: '/demo/1',
    } satisfies Location);

    render(
        <TestComponent
            config={{
                useLocaleInPath: true,
                usePrefixForDefaultLocale: true,
            }}
            defaultLocale={mockLanguage}
        />
    );

    await waitFor(() => {
        expect(mockNavigateFn).toHaveBeenCalledWith('/en/demo/1?q=test#section', { replace: true });
    });
});

it('removes default locale prefix when usePrefixForDefaultLocale is false', async () => {
    (useLocation as Mock).mockReturnValue({
        ...dummyLocation,
        pathname: '/en/settings',
    } satisfies Location);

    render(
        <TestComponent
            config={{ useLocaleInPath: true, usePrefixForDefaultLocale: false }}
            defaultLocale={mockLanguage}
        />
    );

    await waitFor(() => {
        expect(mockNavigateFn).toHaveBeenCalledWith('/settings?q=test#section', { replace: true });
    });
});

it('should do nothing if we had a previously set locale', () => {
    (useLocation as Mock).mockReturnValue({
        ...dummyLocation,
        pathname: '/en/settings',
    } satisfies Location);
    mockLanguage = 'en';

    const { rerender } = renderHook(() =>
        useNormalizeDefaultLocalePath(
            { useLocaleInPath: true, usePrefixForDefaultLocale: false },
            mockLanguage,
            TEST_ROUTES.en,
            TEST_ROUTES
        )
    );
    expect(mockNavigateFn).toHaveBeenCalledWith('/settings?q=test#section', { replace: true });

    mockNavigateFn.mockClear();
    rerender();
    expect(mockNavigateFn).not.toHaveBeenCalled();
});
