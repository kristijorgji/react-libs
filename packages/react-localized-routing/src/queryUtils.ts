function addOrUpdateUrlQueryParameter(uri: string, key: string, value: string): string {
    const i = uri.indexOf('#');
    const hash = i === -1 ? '' : uri.substring(i);
    uri = i === -1 ? uri : uri.substring(0, i);
    const encodedValue = encodeURIComponent(value);

    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';

    if (!encodedValue) {
        uri = uri.replace(new RegExp('([?&]?)' + key + '=[^&]*', 'i'), '');
        if (uri.slice(-1) === '?') {
            uri = uri.slice(0, -1);
        }
        if (uri.indexOf('?') === -1) {
            uri = uri.replace(/&/, '?');
        }
    } else if (uri.match(re)) {
        uri = uri.replace(re, '$1' + key + '=' + encodedValue + '$2');
    } else {
        uri = `${uri}${separator}${key}=${encodedValue}`;
    }
    return uri + hash;
}

export function addOrUpdateUrlQueryParameters(uri: string, paramsMap: Record<string, string>): string {
    let newUri = uri;
    for (const key in paramsMap) {
        const value = paramsMap[key];
        if (value !== undefined) {
            newUri = addOrUpdateUrlQueryParameter(newUri, key, value);
        }
    }
    return newUri;
}

export function searchParamsToRecord(params: URLSearchParams): Record<string, string | number> {
    const result: Record<string, string | number> = {};
    params.forEach((value, key) => {
        const isNumeric = /^-?(0|[1-9]\d*)(\.\d+)?$/.test(value);
        result[key] = isNumeric ? Number(value) : value;
    });

    return result;
}
