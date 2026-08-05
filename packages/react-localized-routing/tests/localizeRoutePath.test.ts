import { describe, expect, it } from 'vitest';

import { formPath } from '../src/formPath';
import { localizeRoutePath } from '../src/localizeRoutePath';
import type { FormPathParams, LocalizationConfig } from '../src/types';
import { DEFAULT_LOCALE, TEST_ROUTES } from './fixtures/routes';

describe('localizeRoutePath', () => {
    const demoParams = {
        urlParams: { id: 'mysuper7param' },
        query: { a: 'abdf', magicNR: 129978 },
        hash: 'abc',
    };

    function localize(locale: 'en' | 'de', config: LocalizationConfig): string {
        return localizeRoutePath(TEST_ROUTES, DEFAULT_LOCALE, locale, 'DEMO', demoParams, config);
    }

    describe('default locale', () => {
        it('prefixes when useLocaleInPath and usePrefixForDefaultLocale are true', () => {
            expect(
                localize('en', { useLocaleInPath: true, usePrefixForDefaultLocale: true })
            ).toBe('/en/demo/mysuper7param?a=abdf&magicNR=129978#abc');
        });

        it('omits prefix when usePrefixForDefaultLocale is false', () => {
            expect(
                localize('en', { useLocaleInPath: true, usePrefixForDefaultLocale: false })
            ).toBe('/demo/mysuper7param?a=abdf&magicNR=129978#abc');
        });

        it('ignores usePrefixForDefaultLocale when useLocaleInPath is false', () => {
            expect(
                localize('en', { useLocaleInPath: false, usePrefixForDefaultLocale: true })
            ).toBe('/demo/mysuper7param?a=abdf&magicNR=129978#abc');
        });
    });

    describe('non-default locale', () => {
        it('prefixes when useLocaleInPath is true', () => {
            for (const usePrefixForDefaultLocale of [true, false]) {
                expect(
                    localize('de', { useLocaleInPath: true, usePrefixForDefaultLocale })
                ).toBe('/de/d/mysuper7param?a=abdf&magicNR=129978#abc');
            }
        });

        it('omits locale prefix when useLocaleInPath is false', () => {
            for (const usePrefixForDefaultLocale of [true, false]) {
                expect(
                    localize('de', { useLocaleInPath: false, usePrefixForDefaultLocale })
                ).toBe('/d/mysuper7param?a=abdf&magicNR=129978#abc');
            }
        });
    });
});

describe('formPath', () => {
    const cases: [string, FormPathParams, string][] = [
        ['just_pathname', { pathname: '/superpage/' }, '/superpage/'],
        [
            'with_url_param_and_query_param',
            { pathname: '/superpage/:id', urlParams: { id: '23233223' }, query: { super: 222 } },
            '/superpage/23233223?super=222',
        ],
        [
            'with_two_url_param',
            { pathname: '/superpage/:id/:test/haha', urlParams: { id: '23233223', test: 'mmmm' } },
            '/superpage/23233223/mmmm/haha',
        ],
        [
            'with_two_url_param_and_query_esc',
            {
                pathname: '/superpage/:id/:test/haha',
                urlParams: { id: '23233223', test: 'mmmm' },
                query: { specialone: 'dddd&2+212=', inhouse: 'true' },
            },
            '/superpage/23233223/mmmm/haha?specialone=dddd%262%2B212%3D&inhouse=true',
        ],
        [
            'should_escape_qp_value',
            {
                pathname: '/escape',
                query: { returnUrl: 'https://test.dev/checkout?ref=bcplm&pid=6' },
            },
            '/escape?returnUrl=https%3A%2F%2Ftest.dev%2Fcheckout%3Fref%3Dbcplm%26pid%3D6',
        ],
        [
            'with_hash_and_query',
            { pathname: '/escape', query: { dd: 'dd' }, hash: 'kjkjkj' },
            '/escape?dd=dd#kjkjkj',
        ],
        [
            'with_param_hash_and_query',
            {
                pathname: '/demo/:id',
                urlParams: { id: '1729' },
                hash: '#kj177795',
                query: { gari: 2, miri: 3 },
            },
            '/demo/1729?gari=2&miri=3#kj177795',
        ],
        [
            'with_wildcard_param',
            { pathname: '/mmm/:slug*', urlParams: { 'slug*': 'iam/the/slug' } },
            '/mmm/iam/the/slug',
        ],
        [
            'with_catchall_param',
            { pathname: '/p/:...slug', urlParams: { '...slug': 'iam/the/slug' } },
            '/p/iam/the/slug',
        ],
    ];

    it.each(cases)('%s', (_, path, expected) => {
        expect(formPath(path)).toEqual(expected);
    });
});
