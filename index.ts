import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import libraries from './data/libraries.json';
import { requestComponents, requestStyles, downloadImage } from './utils';

const writeFile = promisify(fs.writeFile);

(async () => {
    const allComponents: ShortFigmaItem[] = [];

    for (let platform of Object.keys(libraries) as Platform[]) {
        for (let library of libraries[platform]) {
            const response =
                library.type === 'typography'
                    ? await requestStyles(library.file_key)
                    : await requestComponents(library.file_key);

            allComponents.push(
                ...response.map<ShortFigmaItem>((component) => {
                    const isVariant = !!component.containing_frame?.containingStateGroup;

                    const item: ShortFigmaItem = {
                        key: component.key,
                        file_key: component.file_key,
                        name: isVariant ? component.containing_frame.containingStateGroup.name : component.name,
                        description: component.description,
                        platform,
                    };

                    if (isVariant) {
                        item.variant = component.name;
                    }

                    return item;
                })
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
})();
