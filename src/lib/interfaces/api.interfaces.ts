export interface IResponseObject {
  message?: string;
  error?: string;
  data?: object | null;
  status_code?: number;
}
