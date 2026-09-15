export interface IBannerSnap {
  filename?: string;
  destination?: string;
  url?: string;
  base64Image?: string;
}

export interface BannerImageUploadProps {
  value: string; // The active banner URL or base64 string
  imgObj: IBannerSnap;
  onChange: (url: string) => void;
  onDelete?: () => Promise<void> | void;
  label?: string;
  setImgObj:React.Dispatch<React.SetStateAction<IBannerSnap>>;
  disabled?: boolean;
}
