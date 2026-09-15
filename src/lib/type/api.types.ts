export const http_methods = ["PUT", "POST", "GET", "DELETE"];
export type http_methods_type = (typeof http_methods)[number];


export const protocols = ["http", "https", "ftp", "telnet", "ssh"]
export type protocols_type = (typeof protocols)[number];

export type headers = { [key: string]: string };

export type httpbody = any;
