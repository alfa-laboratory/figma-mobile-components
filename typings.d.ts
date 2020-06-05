type FrameInfo = {
  nodeId: string;
  name: string;
  pageId: string;
  pageName: string;
};

type FigmaItem = {
  key: string;
  file_key: string;
  node_id: string;
  name: string;
  description: string;
  containing_frame: FrameInfo;
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

type PLATFORM = 'IOS' | 'ANDROID';

type MessageType = 'CLONE' | 'PARSE';
