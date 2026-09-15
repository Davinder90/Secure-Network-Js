// IP INFORMATION 
export interface IpGeoLocation {
  city: string;
  country: string;
  country_code: string;
  isp: string;
  latitude: number | null;
  longitude: number | null;
  postal_code: string;
  region: string;
  timezone: string;
}

export interface IpNetworkInfo {
  asn: string;
  asn_country_code: string;
  asn_description: string;
  asn_registry: string;
  cidr: string;
  handle: string;
  name: string;
  organization: string;
}

export interface IpAsnResultProps {
  anycast_provider: string | null;
  ip_version: "IPv4" | "IPv6" | string;
  is_anycast: boolean;
  location: IpGeoLocation;
  network: IpNetworkInfo;
  query: string;
  resolved_ip: string;
}


// DOMAIN INFORMATION
export interface DomainUser {
  email: string;
  state?: string;
  country?: string;
  city?: string;
  address?: string;
}

export interface DomainRegistrar {
  name: string;
  url: string[];
  whois_server: string;
}

export interface DomainMetadata {
  name: string;
  created: string;
  updated: string;
  expires: string;
  status: string | string[];
  name_servers: string[];
  dnssec: string;
  id: string;
}

export interface IDomainInformation {
  user: DomainUser;
  registrar: DomainRegistrar;
  domain_metadata: DomainMetadata;
}


// PING, TRACEROUTE 
export interface IConnectivityData {
  bytes?: number,
  rtt?: number,
  seq?: 1,
  src?: string,
  host?: string,
  message?: string,
  ttl?: string,
}

export interface IPingInfo {
  min: number,
  max: number,
  sent: number,
  lost: number,
  received: number,
  avg: number,
  percentage: number
}

export interface IPingResult {
  data: IConnectivityData[],
  info: IPingInfo
} 

export interface ITracerouteSummary {
  min: number;                  
  max: number;                  
  avg: number;                  
  hopCount: number;             
  respondedHopCount: number;    
}

// DNS LOOKUP
export interface DNSRecordCategory {
  static: Record<string, string>; 
  dynamic: Record<
    string,
    {
      description: string;
      input_required: string;
      examples: string[];
    }
  >;
}
