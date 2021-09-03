import axios from 'axios';
import fs from 'fs';
import path from 'path';

const FIGMA_API_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_API_URL = 'https://api.figma.com/v1';

const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
let PENDING_REQUESTS = 0;

const api = axios.create({});

api.interceptors.request.use(
    (config) =>
        new Promise((resolve) => {
            const interval = setInterval(() => {
                if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
                    PENDING_REQUESTS += 1;
                    clearInterval(interval);
                    resolve(config);
                }
            }, INTERVAL_MS);
        })
);

api.interceptors.response.use(
    (response) => {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.resolve(response);
    },
    (error) => {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.reject(error);
    }
);

export async function requestComponents(fileId: string) {
    const reqUrl = `${FIGMA_API_URL}/files/${fileId}/components`;

    const {
        data: {
            meta: { components },
        },
    } = await axios.get<FigmaComponentsResponse>(reqUrl, {
        headers: { 'X-FIGMA-TOKEN': FIGMA_API_TOKEN },
    });

    return components;
}

export async function requestStyles(fileId: string) {
    const reqUrl = `${FIGMA_API_URL}/files/${fileId}/styles`;

    const {
        data: {
            meta: { styles },
        },
    } = await axios.get<FigmaTextStylesResponse>(reqUrl, {
        headers: { 'X-FIGMA-TOKEN': FIGMA_API_TOKEN },
    });

    return styles;
}

export async function downloadImage(
    url: string,
    filename: string,
    destFolder: string
): Promise<boolean> {
    const destPath = path.resolve(destFolder, filename);

    if (fs.existsSync(destPath)) return Promise.resolve(false);

    const writer = fs.createWriteStream(destPath);

    const response = await api({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(true));
        writer.on('error', (err) => reject(err));
    });
}

export function nameAdapter(name: string) {
    if (name === 'IconElementView') {
        name = 'IconView';
    }

    if (name === 'ButtonView') {
        name = 'MainButton';
    }

    if (name === '🤟ButtonViewTemplate') {
        name = '🤟MainButtonTemplate';
    }

    return name.toLowerCase();
}

export function variantsAdapter(variantString: string) {
    if (!variantString) return '';

    const adaptVariant = ([key, value]) => {
        if (key === 'Ellipsize') {
            key = 'Truncation';

            if (value === 'Ellipsize') {
                value = 'Truncated';
            }
        }

        return [key, value];
    };

    const variantDict = variantString.split(', ').reduce((acc, variant) => {
        const [key, value] = adaptVariant(variant.split('=') as [string, string]);

        acc[key] = value;

        return acc;
    }, {});

    return JSON.stringify(variantDict).toLowerCase();
}
