import type { ReactElement } from 'react';

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, type RouteProps, Routes } from 'react-router-dom';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLocalizedRoute } from '../src/createLocalizedRoute';
import * as localizeModule from '../src/localizeRoutePath';
import { DEFAULT_LOCALE, TEST_ROUTES } from './fixtures/routes';

vi.mock('../src/localizeRoutePath', async () => ({
    ...(await vi.importActual('../src/localizeRoutePath')),
    localizeRoutePath: vi.fn(),
}));

describe('createLocalizedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns a Route element with correct path and element', () => {
        const mockedReturnedLocalizedPath = '/en/magic-route';
        (localizeModule.localizeRoutePath as Mock).mockReturnValue(mockedReturnedLocalizedPath);

        const DummyComponent: ReactElement = <div>Test Component</div>;
        const config = { useLocaleInPath: true, usePrefixForDefaultLocale: false };
        const route = createLocalizedRoute(
            TEST_ROUTES,
            DEFAULT_LOCALE,
            'en',
            'SETTINGS',
            DummyComponent,
            config
        );

        const routeProps: RouteProps = route.props;

        expect(route.type).toBe(Route);
        expect(route.key).toBe('SETTINGS');
        expect(routeProps.path).toBe(mockedReturnedLocalizedPath);
        expect(routeProps.element).toBe(DummyComponent);

        render(
            <MemoryRouter initialEntries={[mockedReturnedLocalizedPath]}>
                <Routes>{route}</Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Test Component')).toBeInTheDocument();
    });
});
