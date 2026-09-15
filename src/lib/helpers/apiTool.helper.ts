import axios, { AxiosRequestConfig } from "axios";
import qs from "qs";
import FormData from "form-data";
import { IApi } from "@models/api.model";
import {
  METHODS_WITHOUT_BODY,
} from "@utils/ui/api/ApiTools.constants";
import { TBody } from "@type/ui/api/api.type";
import { IExecuteResponse } from "@interfaces/api-tool/apiTool.interface"
export class ApiExecutor {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  validateMethod(): boolean {
    return !!this.api.method;
  }

  validateUrl(): boolean {
    try {
      new URL(this.api.url);
      return true;
    } catch {
      return false;
    }
  }

  validateHeaders(): boolean {
    return (
      !this.api.headers || this.api.headers.every((h) => h.key && h.enabled)
    );
  }

  validateQueryParams(): boolean {
    return (
      !this.api.queryParams ||
      this.api.queryParams.every((q) => q.key && q.enabled)
    );
  }

  validateBody(): boolean {
    if (METHODS_WITHOUT_BODY.includes(this.api.method)) return true;
    if (!this.api.body) return true;
    if (this.api.body.type === "raw" && this.api.body.rawType === "JSON") {
      try {
        JSON.parse(this.api.body.content || "{}");
      } catch {
        return false;
      }
    }
    return true;
  }

  validateAuth(): boolean {
    const auth = this.api.auth;
    if (!auth || auth.type === "none") return true;
    if (auth.type === "basic") return !!auth.username && !!auth.password;
    if (auth.type === "bearer") return !!auth.token;
    if (auth.type === "apiKey") return !!auth.key && !!auth.value && !!auth.in;
    return true;
  }

  validateAll(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.validateMethod()) errors.push("Invalid HTTP method");
    if (!this.validateUrl()) errors.push("Invalid URL");
    if (!this.validateHeaders()) errors.push("Invalid headers");
    if (!this.validateQueryParams()) errors.push("Invalid query parameters");
    if (!this.validateBody()) errors.push("Invalid body");
    if (!this.validateAuth()) errors.push("Invalid authorization");
    return { valid: errors.length === 0, errors };
  }

  private buildRequest(): AxiosRequestConfig & {
    _reqHeaders?: Record<string, string>;
  } {
    let url = this.api.url;

    // Add query params
    const queryParams =
      this.api.queryParams?.filter((q) => q.enabled && q.key) || [];
    if (queryParams.length) {
      const queryString = qs.stringify(
        Object.fromEntries(queryParams.map((q) => [q.key, q.value])),
      );
      url += (url.includes("?") ? "&" : "?") + queryString;
    }

    // Headers
    const headers: Record<string, string> = {};
    this.api.headers?.forEach((h) => {
      if (h.enabled && h.key) headers[h.key] = h.value;
    });

    // Auth
    if (this.api.auth?.type === "basic") {
      headers["Authorization"] =
        "Basic " +
        Buffer.from(
          `${this.api.auth.username}:${this.api.auth.password}`,
        ).toString("base64");
    }
    if (this.api.auth?.type === "bearer") {
      headers["Authorization"] = `Bearer ${this.api.auth.token}`;
    }
    if (this.api.auth?.type === "apiKey") {
      if (this.api.auth.in === "header")
        headers[this.api.auth.key!] = this.api.auth.value!;
      else if (this.api.auth.in === "query")
        url +=
          (url.includes("?") ? "&" : "?") +
          `${this.api.auth.key}=${this.api.auth.value}`;
    }

    // Body
    let data = undefined;
    const body: TBody | undefined = this.api.body;
    if (body && !METHODS_WITHOUT_BODY.includes(this.api.method)) {
      switch (body.type) {
        case "raw":
          if (body.rawType === "JSON") {
            headers["Content-Type"] = "application/json";
            try {
              data = JSON.parse(body.content || "{}");
            } catch {
              data = body.content;
            }
          } else {
            data = body.content;
          }
          break;

        case "x-www-form-urlencoded":
          const formObj = Object.fromEntries(
            body.urlEncoded
              ?.filter((u) => u.enabled)
              .map((u) => [u.key, u.value]) || [],
          );
          data = qs.stringify(formObj);
          headers["Content-Type"] = "application/x-www-form-urlencoded";
          break;

        case "form-data":
          const form = new FormData();
          body.formData
            ?.filter((f) => f.enabled)
            .forEach((f) => {
              if (f.type === "file") {
                // NOTE: You must replace with actual file stream if you have file input
                form.append(f.key, f.value as string);
              } else {
                form.append(f.key, f.value);
              }
            });
          data = form;
          Object.assign(headers, form.getHeaders());
          break;

        default:
          data = body.content;
      }
    }

    return {
      method: this.api.method as string,
      url,
      headers,
      data,
      timeout: 30000,
      responseType: "arraybuffer",
      validateStatus: () => true,
      _reqHeaders: { ...headers },
    };
  }

  async send(): Promise<IExecuteResponse> {
    const validation = this.validateAll();
    if (!validation.valid) {
      return {
        success: false,
        status_code: 400,
        statusText: "Validation Error",
        time: 0,
        size: 0,
        reqheaders: {},
        resheaders: {},
        data: null,
        error: validation.errors.join(", "),
      };
    }

    const startTime = Date.now();
    try {
      const config = this.buildRequest();
      const response = await axios(config);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      const contentType = response.headers["content-type"] || "";
      let responseBody = response.data;

      if ((contentType as string[]).includes("application/json")) {
        try {
          responseBody = JSON.parse(response.data.toString("utf8"));
        } catch {
          responseBody = response.data.toString("utf8");
        }
      } else if (
        (contentType as string[]).includes("text") ||
        (contentType as string[]).includes("html")
      ) {
        responseBody = response.data.toString("utf8");
      } else {
        responseBody = response.data;
      }

      const responseSize = Buffer.byteLength(response.data);
      return {
        success: response.status >= 200 && response.status < 300,
        status_code: response.status,
        statusText: response.statusText,
        time: responseTime,
        size: responseSize,
        reqheaders:
          config._reqHeaders || (config?.headers as Record<string, string>),
        resheaders: response.headers,
        data: responseBody,
        error: response.status >= 400 ? responseBody : null,
      };
    } catch (error: unknown) {
      const endTime = Date.now();

      if (axios.isAxiosError(error)) {
        return {
          success: false,
          status_code: error.response?.status || 500,
          statusText: error.response?.statusText || "Internal Error",
          time: endTime - startTime,
          size: 0,
          reqheaders:
            (
              error.config as AxiosRequestConfig & {
                _reqHeaders?: Record<string, string>;
              }
            )?._reqHeaders || {},
          resheaders: error.response?.headers || {},
          data: null,
          error: error.message,
        };
      }

      return {
        success: false,
        status_code: 500,
        statusText: "Internal Error",
        time: endTime - startTime,
        size: 0,
        reqheaders: {},
        resheaders: {},
        data: null,
        error: "Unknown error occurred",
      };
    }
  }
}
