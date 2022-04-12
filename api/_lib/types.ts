export type FileType = 'png' | 'jpeg';
export type Theme = 'light' | 'dark';

export interface ParsedRequest {
    fileType: FileType;
    title: string;
    description: string;
    readTime: string;
    theme: Theme;
    md: boolean;
    images: string[];
    widths: string[];
    heights: string[];
}
