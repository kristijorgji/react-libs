import { cleanup, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { NavLink as ReactRouterNavLink } from 'react-router-dom';
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocalizedNavLink } from '../src/LocalizedNavLink';
import * as localizeModule from '../src/localizeRoutePath';
import type { RouteParams } from '../src/types';
import { DEFAULT_LOCALE, TEST_ROUTES, type TestRouteId } from './fixtures/routes';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const { createMockNavLinkComponent, createReactRouterDomPartialMock } =
        await import('./mocks/react-router-dom');
    return createReactRouterDomPartialMock({
        NavLink: createMockNavLinkComponent(),
    });
});

vi.mock('../src/localizeRoutePath', () => ({
    localizeRoutePath: vi.fn(),
}));

vi.mock('../src/LocalizedRouterContext', () => ({
    useLocalizedRouterContext: () => ({
        config: { useLocaleInPath: true, usePrefixForDefaultLocale: false },
        defaultLocale: DEFAULT_LOCALE,
        routes: TEST_ROUTES,
    }),
}));

type TranslationMockValue = { i18n: { language: string } };

const MockReactRouterNavLink = ReactRouterNavLink as unknown as Mock;
const mockUseTranslation = useTranslation as unknown as Mock;
const mockLocalizeRoutePath = localizeModule.localizeRoutePath as unknown as Mock;

describe('LocalizedNavLink', () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseTranslation.mockReturnValue({ i18n: { language: DEFAULT_LOCALE } } satisfies TranslationMockValue);

        mockLocalizeRoutePath.mockImplementation((_routes, _defaultLocale, locale, routeId, params) => {
            let path = `/${locale}/${routeId}`;
            if (params?.urlParams) {
                path += `/${Object.values(params.urlParams).join('/')}`;
            }
            if (params?.query) {
                path += `?${new URLSearchParams(params.query as Record<string, string>).toString()}`;
            }
            if (params?.hash) {
                path += `#${params.hash}`;
            }
            return path;
        });
    });

    it('renders with href', () => {
        const testHref = '/some-external-link';
        render(<LocalizedNavLink href={testHref}>External Link</LocalizedNavLink>);

        expect(MockReactRouterNavLink).toHaveBeenCalledWith(
            expect.objectContaining({ to: testHref, children: 'External Link' }),
            undefined
        );
        expect(screen.getByTestId('mock-navlink')).toHaveAttribute('href', testHref);
    });

    it('renders with routeId', () => {
        const testRouteId: TestRouteId = 'LOGIN';
        const testParams: RouteParams = { urlParams: { id: '123' }, query: { ref: 'abc' } };
        const expectedLocalizedPath = '/en/LOGIN/123?ref=abc';

        render(
            <LocalizedNavLink params={testParams ?? undefined} routeId={testRouteId}>
                Login Page
            </LocalizedNavLink>
        );

        expect(mockLocalizeRoutePath).toHaveBeenCalledWith(
            TEST_ROUTES,
            DEFAULT_LOCALE,
            DEFAULT_LOCALE,
            testRouteId,
            testParams,
            expect.any(Object)
        );
        expect(MockReactRouterNavLink).toHaveBeenCalledWith(
            expect.objectContaining({ to: expectedLocalizedPath }),
            undefined
        );
    });

    it('re-localizes when language changes', () => {
        const testRouteId: TestRouteId = 'LOGIN';
        mockLocalizeRoutePath.mockReturnValueOnce('/en/login');
        const { rerender } = render(<LocalizedNavLink routeId={testRouteId}>About Us</LocalizedNavLink>);

        mockUseTranslation.mockReturnValue({ i18n: { language: 'de' } } satisfies TranslationMockValue);
        mockLocalizeRoutePath.mockReturnValueOnce('/de/anmelden');
        rerender(<LocalizedNavLink routeId={testRouteId}>About Us</LocalizedNavLink>);

        expect(mockLocalizeRoutePath).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('mock-navlink')).toHaveAttribute('href', '/de/anmelden');
    });
});
