type Platform = 'IOS' | 'ANDROID';

type Pair = [string, string];

type FrameInfo = {
    nodeId: string;
    name: string;
    pageId: string;
    pageName: string;
    containingStateGroup?: {
        name: string
    }
};

type FigmaItem = {
    key: string;
    file_key: string;
    node_id: string;
    name: string;
    description: string;
    containing_frame: FrameInfo;
    thumbnail_url: string;
};

type ShortFigmaItem = {
    key: string;
    file_key: string;
    library_name: string;
    name: string;
    variant?: string;
    description: string;
    platform: string;
};

type FigmaComponentsResponse = {
    status: number;
    error: boolean;
    meta: {
        components: FigmaItem[];
    };
};

type FigmaTextStylesResponse = {
    status: number;
    error: boolean;
    meta: {
        styles: FigmaItem[];
    };
};
