import { describe, expect, it } from 'vitest';

import { createLocalizedRouting } from '../src/createLocalizedRouting';
import { DEFAULT_LOCALE, TEST_ROUTES } from './fixtures/routes';

describe('createLocalizedRouting', () => {
    it('returns a bound localizeRoutePath', () => {
        const { localizeRoutePath } = createLocalizedRouting({
            routes: TEST_ROUTES,
            defaultLocale: DEFAULT_LOCALE,
            config: { useLocaleInPath: true, usePrefixForDefaultLocale: false },
        });

        expect(localizeRoutePath('de', 'SETTINGS')).toBe('/de/einstellungen');
        expect(localizeRoutePath('en', 'SETTINGS')).toBe('/settings');
    });
});
