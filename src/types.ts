export interface CropArea {
  id: string;
  name: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | 'free';
  customAspectRatio?: string; // カスタムアスペクト比 (例: "3:2", "5:4")
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface ImageData {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
}