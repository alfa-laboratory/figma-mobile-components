import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import libraries from './data/libraries.json';
import { requestComponents, requestStyles, buildJSONMeta } from './utils';

const writeFile = promisify(fs.writeFile);

(async () => {
  let allComponents = {};
  let allTextStyles = {};

  for (let platform of Object.keys(libraries) as PLATFORM[]) {
    const componentsResponses = await Promise.all<FigmaItem[]>(
      libraries[platform]
        .filter((library) => library.type !== 'typography')
        .map((library) => requestComponents(library.file_key))
    );

    const textStylesResponses = await Promise.all<FigmaItem[]>(
      libraries[platform]
        .filter((library) => library.type === 'typography')
        .map((library) => requestStyles(library.file_key))
    );

    componentsResponses.forEach((response) => {
      allComponents = { ...allComponents, ...buildJSONMeta(response, platform) };
    });

    textStylesResponses.forEach((response) => {
      allTextStyles = { ...allTextStyles, ...buildJSONMeta(response, platform) };
    });
  }

  const componentsFileName = path.resolve(__dirname, './data/components.json');
  await writeFile(componentsFileName, JSON.stringify(allComponents, null, 4), 'UTF-8');

  const textStylesFileName = path.resolve(__dirname, './data/text-styles.json');
  await writeFile(textStylesFileName, JSON.stringify(allComponents, null, 4), 'UTF-8');
})();
