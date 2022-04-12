import { ParsedRequest, Theme, FileType } from '../api/_lib/types';
const { H, R, copee } = (window as any);
let timeout = -1;

interface ImagePreviewProps {
    src: string;
    onclick: () => void;
    onload: () => void;
    onerror: () => void;
    loading: boolean;
}

const ImagePreview = ({ src, onclick, onload, onerror, loading }: ImagePreviewProps) => {
    const style = {
        filter: loading ? 'blur(5px)' : '',
        opacity: loading ? 0.1 : 1,
    };
    const title = 'Click to copy image URL to clipboard';
    return H('a',
        { className: 'image-wrapper', href: src, onclick },
        H('img',
            { src, onload, onerror, style, title }
        )
    );
}

interface DropdownOption {
    text: string;
    value: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onchange: (val: string) => void;
    small: boolean;
}

const Dropdown = ({ options, value, onchange, small }: DropdownProps) => {
    const wrapper = small ? 'select-wrapper small' : 'select-wrapper';
    const arrow = small ? 'select-arrow small' : 'select-arrow';
    return H('div',
        { className: wrapper },
        H('select',
            { onchange: (e: any) => onchange(e.target.value) },
            options.map(o =>
                H('option',
                    { value: o.value, selected: value === o.value },
                    o.text
                )
            )
        ),
        H('div',
            { className: arrow },
            '▼'
        )
    );
}

interface TextInputProps {
    value: string;
    oninput: (val: string) => void;
    small: boolean;
    placeholder?: string;
    type?: string
}

const TextInput = ({ value, oninput, small, type = 'text', placeholder = '' }: TextInputProps) => {
    return H('div',
        { className: 'input-outer-wrapper' + (small ? ' small' : '') },
        H('div',
            { className: 'input-inner-wrapper' },
            H('input',
                { type, value, placeholder, oninput: (e: any) => oninput(e.target.value) }
            )
        )
    );
}

interface FieldProps {
    label: string;
    input: any;
}

const Field = ({ label, input }: FieldProps) => {
    return H('div',
        { className: 'field' },
        H('label',
            H('div', {className: 'field-label'}, label),
            H('div', { className: 'field-value' }, input),
        ),
    );
}

interface ToastProps {
    show: boolean;
    message: string;
}

const Toast = ({ show, message }: ToastProps) => {
    const style = { transform:  show ? 'translate3d(0,-0px,-0px) scale(1)' : '' };
    return H('div',
        { className: 'toast-area' },
        H('div',
            { className: 'toast-outer', style },
            H('div',
                { className: 'toast-inner' },
                H('div',
                    { className: 'toast-message'},
                    message
                )
            )
        ),
    );
}

const themeOptions: DropdownOption[] = [
    { text: 'Light', value: 'light' },
    { text: 'Dark', value: 'dark' },
];

const fileTypeOptions: DropdownOption[] = [
    { text: 'PNG', value: 'png' },
    { text: 'JPEG', value: 'jpeg' },
];

const markdownOptions: DropdownOption[] = [
    { text: 'Plain Text', value: '0' },
    { text: 'Markdown', value: '1' },
];

const imageLightOptions: DropdownOption[] = [
    { text: 'uselinked', value: 'https://uselinked.com/images/logo.png' },
];

const imageDarkOptions: DropdownOption[] = [
    { text: 'uselinked', value: 'https://uselinked.com/images/logo.png' },
];


interface AppState extends ParsedRequest {
    loading: boolean;
    showToast: boolean;
    messageToast: string;
    selectedImageIndex: number;
    widths: string[];
    heights: string[];
    overrideUrl: URL | null;
}

type SetState = (state: Partial<AppState>) => void;

const App = (_: any, state: AppState, setState: SetState) => {
    const setLoadingState = (newState: Partial<AppState>) => {
        window.clearTimeout(timeout);
        if (state.overrideUrl && state.overrideUrl !== newState.overrideUrl) {
            newState.overrideUrl = state.overrideUrl;
        }
        if (newState.overrideUrl) {
            timeout = window.setTimeout(() => setState({ overrideUrl: null }), 200);
        }

        setState({ ...newState, loading: true });
    };
    const {
        fileType = 'png',
        theme = 'light',
        md = true,
        title = '**uselinked**',
        description = 'Daily journaling, **without distraction**. An easy, distraction-free way to record your thoughts, declutter your mind and keep the things you want to remember.',
        readTime = '5',
        images=[imageLightOptions[0].value],
        widths=[],
        heights=[],
        showToast = false,
        messageToast = '',
        loading = true,
        selectedImageIndex = 0,
        overrideUrl = null,
    } = state;

    const mdValue = md ? '1' : '0';
    const imageOptions = theme === 'light' ? imageLightOptions : imageDarkOptions;
    const url = new URL(window.location.origin);
    url.pathname = `${encodeURIComponent(title)}.${fileType}`;
    url.searchParams.append('description', description);
    url.searchParams.append('readTime', readTime);
    url.searchParams.append('theme', theme);
    url.searchParams.append('md', mdValue);
    for (let image of images) {
        url.searchParams.append('images', image);
    }
    for (let width of widths) {
        url.searchParams.append('widths', width);
    }
    for (let height of heights) {
        url.searchParams.append('heights', height);
    }

    return H('div',
        { className: 'split' },
        H('div',
            { className: 'pull-left' },
            H('div',
                H(Field, {
                    label: 'Theme',
                    input: H(Dropdown, {
                        options: themeOptions,
                        value: theme,
                        onchange: (val: Theme) => {
                            const options = val === 'light' ? imageLightOptions : imageDarkOptions
                            let clone = [...images];
                            clone[0] = options[selectedImageIndex].value;
                            setLoadingState({ theme: val, images: clone });
                        }
                    })
                }),
                H(Field, {
                    label: 'File Type',
                    input: H(Dropdown, {
                        options: fileTypeOptions,
                        value: fileType,
                        onchange: (val: FileType) => setLoadingState({ fileType: val })
                    })
                }),
                H(Field, {
                    label: 'Text Type',
                    input: H(Dropdown, {
                        options: markdownOptions,
                        value: mdValue,
                        onchange: (val: string) => setLoadingState({ md: val === '1' })
                    })
                }),
                H(Field, {
                    label: 'Title',
                    input: H(TextInput, {
                        value: title,
                        oninput: (val: string) => {
                            console.log('oninput ' + val);
                            setLoadingState({ title: val, overrideUrl: url });
                        }
                    })
                }),
              H(Field, {
                  label: 'Description',
                  input: H(TextInput, {
                      value: description,
                      oninput: (val: string) => {
                          console.log('oninput ' + val);
                          setLoadingState({description: val, overrideUrl: url});
                      }
                  })
              }),
              H(Field, {
                  label: 'Read Time',
                  input: H(TextInput, {
                      value: readTime,
                      oninput: (val: string) => {
                          console.log('oninput ' + val);
                          setLoadingState({ readTime: val, overrideUrl: url });
                      }
                  })
              }),
                H(Field, {
                    label: 'Image',
                    input: H('div',
                        H(Dropdown, {
                            options: imageOptions,
                            value: imageOptions[selectedImageIndex].value,
                            onchange: (val: string) =>  {
                                let clone = [...images];
                                clone[0] = val;
                                const selected = imageOptions.map(o => o.value).indexOf(val);
                                setLoadingState({ images: clone, selectedImageIndex: selected });
                            }
                        }),
                        H('div',
                            { className: 'field-flex' },
                            H(TextInput, {
                                value: widths[0],
                                type: 'number',
                                placeholder: 'width',
                                small: true,
                                oninput: (val: string) =>  {
                                    let clone = [...widths];
                                    clone[0] = val;
                                    setLoadingState({ widths: clone });
                                }
                            }),
                            H(TextInput, {
                                value: heights[0],
                                type: 'number',
                                placeholder: 'height',
                                small: true,
                                oninput: (val: string) =>  {
                                    let clone = [...heights];
                                    clone[0] = val;
                                    setLoadingState({ heights: clone });
                                }
                            })
                        )
                    ),
                })
            )
        ),
        H('div',
            { className: 'pull-right' },
            H(ImagePreview, {
                src: overrideUrl ? overrideUrl.href : url.href,
                loading: loading,
                onload: () => setState({ loading: false }),
                onerror: () => {
                    setState({ showToast: true, messageToast: 'Oops, an error occurred' });
                    setTimeout(() => setState({ showToast: false }), 2000);
                },
                onclick: (e: Event) => {
                    e.preventDefault();
                    const success = copee.toClipboard(url.href);
                    if (success) {
                        setState({ showToast: true, messageToast: 'Copied image URL to clipboard' });
                        setTimeout(() => setState({ showToast: false }), 3000);
                    } else {
                        window.open(url.href, '_blank');
                    }
                    return false;
                }
            })
        ),
        H(Toast, {
            message: messageToast,
            show: showToast,
        })
    );
};

R(H(App), document.getElementById('app'));
