import { marked } from 'marked';
import { sanitizeHtml } from './sanitizer';
import { ParsedRequest } from './types';
const twemoji = require('twemoji');
const twOptions = { folder: 'svg', ext: '.svg' };
const emojify = (text: string) => twemoji.parse(text, twOptions);


export function getHtml(parsedReq: ParsedRequest) {
    const { title, description, theme, readTime, md, images, widths, heights } = parsedReq;
    return `<!DOCTYPE html>
<html class="${theme}">
    <meta charset="utf-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
      }
    </script>
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
      <body class="flex flex-col h-screen justify-between items-center mx-auto mx-32 dark:bg-black dark:text-white">
        <main class="w-full flex h-full space-x-20">
          <figure class="w-1/5 flex justify-center items-center">
            ${images.map((img, i) => getPlusSign(i) + getImage(img, widths[i], heights[i])).join('')}        
          </figure>
          <article class="w-4/5 space-y-6 p-12 h-full flex flex-col justify-center">
            <h1 class="text-7xl font-black">${emojify(md ? marked(title) : sanitizeHtml(title))}</h1>
            <h2 class="text-5xl leading-normal">${emojify(md ? marked(description) : sanitizeHtml(description))}</h2>
            <h3 class="text-4xl text-gray-400">${readTime + ' minute read'}</h3>
          </article>
        </main>
      </body>
</html>`;
}

function getImage(src: string, width ='auto', height = '225') {
    return `<img
        class="dark:drop-shadow-[0_30px_30px_rgba(255,255,255,0.1)]"
        alt="Generated Image"
        src="${sanitizeHtml(src)}"
        width="${sanitizeHtml(width)}"
        height="${sanitizeHtml(height)}"
    />`
}

function getPlusSign(i: number) {
    return i === 0 ? '' : '<div class="plus">+</div>';
}
