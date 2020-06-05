import axios from 'axios';

const FIGMA_API_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_API_URL = 'https://api.figma.com/v1';

export async function requestComponents(file_id) {
  const reqUrl = `${FIGMA_API_URL}/files/${file_id}/components`;

  const {
    data: {
      meta: { components },
    },
  } = await axios.get<FigmaComponentsResponse>(reqUrl, {
    headers: { 'X-FIGMA-TOKEN': FIGMA_API_TOKEN },
  });

  return components;
}

export async function requestStyles(file_id) {
  const reqUrl = `${FIGMA_API_URL}/files/${file_id}/styles`;

  const {
    data: {
      meta: { styles },
    },
  } = await axios.get<FigmaTextStylesResponse>(reqUrl, {
    headers: { 'X-FIGMA-TOKEN': FIGMA_API_TOKEN },
  });

  return styles;
}

export function buildJSONMeta(items: FigmaItem[], platform: PLATFORM) {
  return items.reduce((acc, item) => {
    acc[`${platform}|${item.name}`] = {
      key: item.key,
      file_key: item.file_key,
      description: item.description,
    };

    return acc;
  }, {});
}
