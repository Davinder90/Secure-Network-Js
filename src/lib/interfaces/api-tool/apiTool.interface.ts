export interface FormDataRow {
  key: string;
  value: string;
  description?: string;
  type: "text" | "file";
  enabled: boolean;
}
export interface Row {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

export interface IExecuteResponse {
  success: boolean;
  status_code: number;
  statusText: string;
  time: number;
  size: number;
  reqheaders: Record<string, any>;
  resheaders: Record<string, any>;
  data: any;
  error: any;
}