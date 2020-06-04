type FrameInfo = {
  nodeId: string;
  name: string;
  pageId: string;
  pageName: string;
};

type FigmaComponent = {
  key: string;
  file_key: string;
  node_id: string;
  thumbnail_url: string;
  name: string;
  description: string;
  updated_at: string;
  created_at: string;
  containing_frame: FrameInfo;
};

type FigmaResponse = {
  status: number;
  error: boolean;
  meta: {
    components: FigmaComponent[];
  };
};

type PLATFORM = 'IOS' | 'ANDROID';

type MessageType = 'CLONE' | 'PARSE';
