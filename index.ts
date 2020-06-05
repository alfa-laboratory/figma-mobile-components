import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import libraries from './data/libraries.json';
import { requestComponents, requestStyles, buildJSONMeta } from './utils';

const writeFile = promisify(fs.writeFile);

(async () => {
  let allComponents = {};

  for (let platform of Object.keys(libraries) as PLATFORM[]) {
    for (let library of libraries[platform]) {
      const response =
        library.type === 'typography'
          ? await requestStyles(library.file_key)
          : await requestComponents(library.file_key);

      allComponents = { ...allComponents, ...buildJSONMeta(response, platform) };
    }
  }

  const componentsFileName = path.resolve(__dirname, './data/components.json');
  await writeFile(componentsFileName, JSON.stringify(allComponents, null, 4), 'UTF-8');
})();
