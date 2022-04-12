import { IncomingMessage } from 'http';
import { parse } from 'url';
import { ParsedRequest, Theme } from './types';

export function parseRequest(req: IncomingMessage) {
    console.log('HTTP ' + req.url);
    const { pathname, query } = parse(req.url || '/', true);
    const { description, readTime, images, widths, heights, theme, md } = (query || {});

    if (Array.isArray(theme)) {
        throw new Error('Expected a single theme');
    }

    const arr = (pathname || '/').slice(1).split('.');
    let extension = '';
    let title = '';

    if (arr.length === 0) {
        title = '';
    } else if (arr.length === 1) {
        title = arr[0];
    } else {
        extension = arr.pop() as string;
        title = arr.join('.');
    }

    const parsedRequest: ParsedRequest = {
        fileType: extension === 'jpeg' ? extension : 'png',
        title: decodeURIComponent(title),
        description: decodeURIComponent(<string>description),
        readTime: <string>readTime,
        theme: theme === 'dark' ? 'dark' : 'light',
        md: md === '1' || md === 'true',
        images: getArray(images),
        widths: getArray(widths),
        heights: getArray(heights),
    };
    parsedRequest.images = getDefaultImages(parsedRequest.images, parsedRequest.theme);
    return parsedRequest;
}

function getArray(stringOrArray: string[] | string | undefined): string[] {
    if (typeof stringOrArray === 'undefined') {
        return [];
    } else if (Array.isArray(stringOrArray)) {
        return stringOrArray;
    } else {
        return [stringOrArray];
    }
}

function getDefaultImages(images: string[], theme: Theme): string[] {
    const defaultImage = theme === 'light'
        ? 'https://uselinked.com/images/logo.png'
        : 'https://uselinked.com/images/logo.png';

    if (!images || !images[0]) {
        return [defaultImage];
    }
    if (!images[0].startsWith('https://assets.vercel.com/') && !images[0].startsWith('https://assets.zeit.co/')) {
        images[0] = defaultImage;
    }
    return images;
}
