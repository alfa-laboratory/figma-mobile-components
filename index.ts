import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import libraries from './data/libraries.json';
import { requestComponents, parseComponents } from './utils';

const writeFile = promisify(fs.writeFile);

(async () => {
  let allComponents = {};

  for (let platform of Object.keys(libraries) as PLATFORM[]) {
    const responses = await Promise.all<FigmaComponent[]>(
      libraries[platform].map((library) => requestComponents(library.file_key))
    );

    responses.forEach((response) => {
      allComponents = { ...allComponents, ...parseComponents(response, platform) };
    });
  }

  const jsonFileName = path.resolve(__dirname, './data/components.json');

  await writeFile(jsonFileName, JSON.stringify(allComponents, null, 4), 'UTF-8');
})();
