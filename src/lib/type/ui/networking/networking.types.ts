import {DNS_RECORD_CATEGORIES} from "@/src/lib/utils/ui/Networking.constant"
// import {getDnsRecords} from "@helpers/UI/common.helper"


// DNS LOOKUP
export const IpLookResultParams = [
  "ROOT_SERVERS",    
  "TLD_NAMESERVERS",    
  "AUTHORITATIVE_NAMESERVERS",    
  "AUTHORITATIVE_ZONE",
  "DNSSEC",
  "REVERSE_DNS",
  "EMAIL",
  "SERVICE_DISCOVERY",
  "INFRASTRUCTURE",
  "SECURITY",
  "CERTIFICATES",
  "MISC"
] as const;
export type RecordType = keyof typeof DNS_RECORD_CATEGORIES | "all";
export type CategoryType = "static" | "dynamic" | "all";
export type IpLookResultParamsType = (typeof IpLookResultParams)[number];
export type IpLookupDataType = {
    domain: string,
    record_types: Record<string, string[] | boolean | string | number>,
    timeout: number,
    transport_protocol: string
} 
export type serversResultType = Record<string, IpLookResultParamsField[]>
export type IpLookupResultType = Record<IpLookResultParamsType, Record<string, serversResultType | IpLookResultParamsField[]>>
export type IpLookResultParamsField = {
    A? : string,
    AAAA?: string,
    class: string,
    data?: string,
    name: string,
    ttl?: number,
    type: string,
    rcode?: string
}

// WELL KNOWN PORTS 
export type WellKnownPortsResult = {port_name: string, port: number, status: string, protocol: string}
