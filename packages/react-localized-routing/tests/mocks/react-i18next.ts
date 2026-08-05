import { vi } from 'vitest';

interface ReactI18nextMockOptions {
    language?: string;
    getLanguage?: () => string;
    changeLanguage?: (...args: unknown[]) => unknown;
    includeT?: boolean;
}

type I18nMock = {
    readonly language: string;
    changeLanguage?: (...args: unknown[]) => unknown;
};

type TranslationResult = {
    t: (key: string) => string;
    i18n: I18nMock;
};

export function createReactI18nextMockModule(options: ReactI18nextMockOptions = {}): {
    useTranslation: () => TranslationResult | Omit<TranslationResult, 't'>;
} {
    const includeT = options.includeT !== false;

    return {
        useTranslation: () => {
            const i18n: I18nMock = {
                get language() {
                    return options.getLanguage?.() ?? options.language ?? 'en';
                },
                ...(options.changeLanguage ? { changeLanguage: options.changeLanguage } : {}),
            };

            if (includeT) {
                return {
                    t: (key: string) => key,
                    i18n,
                };
            }

            return { i18n };
        },
    };
}

export async function createReactI18nextPartialMock(
    options: ReactI18nextMockOptions = {}
): Promise<Record<string, unknown>> {
    const actual = await vi.importActual<Record<string, unknown>>('react-i18next');
    return {
        ...actual,
        ...createReactI18nextMockModule(options),
    };
}
