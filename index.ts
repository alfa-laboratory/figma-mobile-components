import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import libraries from './data/libraries.json';
import { requestComponents, requestStyles, downloadImage } from './utils';
import axios from 'axios';

const writeFile = promisify(fs.writeFile);

const buildItem = (component: FigmaItem, libraryName: string, platform: Platform) => {
    const isVariant = !!component.containing_frame?.containingStateGroup;

    const item: ShortFigmaItem = {
        key: component.key,
        file_key: component.file_key,
        library_name: libraryName,
        name: isVariant ? component.containing_frame.containingStateGroup.name : component.name,
        description: component.description,
        platform,
    };

    if (isVariant) {
        item.variant = component.name;
    }

    return item;
};

const filterItems = (component: ShortFigmaItem) => {
    const name = component.name.toLocaleLowerCase().trim();

    return name.startsWith('.') === false && name.includes('deprecated') === false;
};

const findPairs = async (components: ShortFigmaItem[]) => {
    const r = await axios.get('https://digital.alfabank.ru/figma-pairs/pairs');
    const keys = r.data.toString();

    const byPlatform = {
        IOS: components.filter((c) => c.platform === 'IOS'),
        ANDROID: components.filter((c) => c.platform === 'ANDROID'),
    };

    const match = (c1: ShortFigmaItem, c2: ShortFigmaItem) => {
        if (c1.variant && c2.variant) {
            const variant1 = JSON.stringify(c1.variant.split(', ').sort());
            const variant2 = JSON.stringify(c2.variant.split(', ').sort());
            return c1.name === c2.name && variant1 === variant2;
        }

        if (!c1.variant && !c2.variant) {
            return c1.name === c2.name;
        }
    };

    const newPairs: Array<[ShortFigmaItem, ShortFigmaItem]> = [];

    for (const ios of byPlatform.IOS) {
        let matched = false;

        for (const android of byPlatform.ANDROID) {
            matched = match(ios, android);
            if (matched && !keys.includes(ios.key) && !keys.includes(android.key)) {
                newPairs.push([ios, android]);
                break;
            }
        }

        if (matched) continue;
    }

    for await (const [c1, c2] of newPairs) {
        await axios.post('https://digital.alfabank.ru/figma-pairs/link', { key1: c1.key, key2: c2.key });
        console.log(`[+] autolink: ${c1.name}:${c1.key} <-> ${c2.name}:${c2.key}`);
    }
};

(async () => {
    const allComponents: ShortFigmaItem[] = [];

    for (let platform of Object.keys(libraries) as Platform[]) {
        for (let library of libraries[platform]) {
            const response =
                library.type === 'typography'
                    ? await requestStyles(library.file_key)
                    : await requestComponents(library.file_key);

            allComponents.push(
                ...response
                    .map<ShortFigmaItem>((component) => buildItem(component, library.name, platform))
                    .filter(filterItems)
            );

            console.log(`[+]${library.file_key} saved`);

            response.forEach((style) => {
                const dest = path.resolve(__dirname, 'data/images');

                downloadImage(style.thumbnail_url, `${style.key}.png`, dest)
                    .then((saved: boolean) => {
                        if (saved) {
                            console.log(`[+]${style.name}:${style.key} saved`);
                        }
                    })
                    .catch((err) => {
                        console.error(`[-]${style.name}:${style.key}: ${err.message}`);
                    });
            });
        }
    }

    allComponents.sort((a, b) => `${a.name}: ${a.description}`.localeCompare(`${b.name}: ${b.description}`));

    const componentsFileName = path.resolve(__dirname, './data/components.json');
    await writeFile(componentsFileName, JSON.stringify(allComponents, null, 4), 'UTF-8');

    await findPairs(allComponents);
})();
