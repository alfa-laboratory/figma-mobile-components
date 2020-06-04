import axios from 'axios';

const FIGMA_API_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_API_URL = 'https://api.figma.com/v1';

export async function requestComponents(file_id) {
  const reqUrl = `${FIGMA_API_URL}/files/${file_id}/components`;

  const {
    data: {
      meta: { components },
    },
  } = await axios.get<FigmaResponse>(reqUrl, {
    headers: { 'X-FIGMA-TOKEN': FIGMA_API_TOKEN },
  });

  return components;
}

export function parseComponents(components: FigmaComponent[], platform: PLATFORM) {
  return components.reduce((acc, component) => {
    const key = [platform, component.containing_frame.name, component.name].filter((item) => item).join('|');
    acc[key] = {
      key: component.key,
      file_key: component.file_key,
    };

    return acc;
  }, {});
}
