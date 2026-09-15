import {
  Checkbox_Container_Record_Categories,
  Input_Container_Fields,
  Select_Container_Fields,
} from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import {
  DNS_RECORD_CATEGORIES_INPUT,
  WELL_KNOWN_PORTS_RECORD,
} from "@utils/ui/Networking.constant";

/* -------------------------------------------------------------------------- */
/*                               COMMON REGEX                                 */
/* -------------------------------------------------------------------------- */
const REGEX_PATTERNS = {
  DOMAIN: "^(?!://)([a-zA-Z0-9-_]+\\.)+[a-zA-Z]{2,}$",
  IPV4: "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
  DOMAIN_OR_IP: "^((?!://)([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}|((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)|([a-fA-F0-9:]+:+)+[a-fA-F0-9]+)$",
  POSITIVE_INT: "^\\d+$",
  PORT_RANGE: "^([1-9][0-9]{0,4})$",
  PORT_LIST: "^([1-9][0-9]{0,4})(,([1-9][0-9]{0,4}))*$",
  HOST_SUBDOMAIN: "^([a-zA-Z0-9-_]+(\\.[a-zA-Z0-9-_]+)*|[a-zA-Z0-9-_]+)$",
  MAX_HOPS: "^([1-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$",
};

/* -------------------------------------------------------------------------- */
/*                         SHARED PARAMETER DEFINITIONS                       */
/* -------------------------------------------------------------------------- */
const DESTINATION_FIELD: Input_Container_Fields = {
  name: "destination",
  value: "",
  placeholder: "Enter destination IP or domain (e.g., 8.8.8.8 or www.google.com)",
  type: "text",
  caption: "The destination to ping (IP or domain)",
  regex: REGEX_PATTERNS.DOMAIN_OR_IP,
};

const TIMEOUT_MS_FIELD: Input_Container_Fields = {
  name: "timeout",
  value: "",
  placeholder: "Enter timeout value (in milliseconds, e.g., 1000)",
  type: "number",
  caption: "Timeout for the ping request in milliseconds",
  regex: REGEX_PATTERNS.POSITIVE_INT,
};

/* -------------------------------------------------------------------------- */
/*                           INPUT CONTAINER CONTENT                          */
/* -------------------------------------------------------------------------- */
export const INPUT_CONTAINER_CONTENT: Record<string, Input_Container_Fields> = {
  domain: {
    name: "Domain",
    type: "text",
    placeholder: "Enter the domain name",
    value: "",
    caption: "Example: example.com",
    regex: REGEX_PATTERNS.DOMAIN,
  },
  email: {
    name: "Email",
    type: "email",
    placeholder: "Enter your email",
    value: "",
    caption: "We’ll never share your email",
  },
  ipAddress: {
    name: "IP Address",
    type: "text",
    placeholder: "Enter your IP address",
    value: "",
    caption: "Example: 8.8.8.8",
    regex: REGEX_PATTERNS.IPV4,
  },
  domain_ip: {
    name: "Domain or IP",
    type: "text",
    placeholder: "Enter domain or IP address",
    value: "",
    caption: "Example: example.com, 8.8.8.8",
    regex: REGEX_PATTERNS.DOMAIN_OR_IP,
  },
  timeout: {
    name: "Timeout",
    type: "number",
    placeholder: "Enter timeout in seconds",
    value: 1,
    caption: "Example: 2.5 (seconds)",
    regex: "^(0\\.[4-9]|[1-9]\\d*(\\.\\d+)?)$",
  },
  portstart: {
    name: "Port Start Range",
    value: 1,
    placeholder: "Enter starting port (e.g., 80)",
    type: "number",
    caption: "Starting port number (min: 1, max: 65535)",
    regex: REGEX_PATTERNS.PORT_RANGE,
  },
  portend: {
    name: "Port End Range",
    value: 65535,
    placeholder: "Enter ending port (e.g., 443)",
    type: "number",
    caption: "Ending port number (min: 1, max: 65535)",
    regex: REGEX_PATTERNS.PORT_RANGE,
  },
  portlist: {
    name: "Port List",
    value: "",
    placeholder: "Enter ports (e.g., 22,80,443)",
    type: "text",
    caption: "Comma-separated list of ports (each between 1 and 65535)",
    regex: REGEX_PATTERNS.PORT_LIST,
  },
};

/* -------------------------------------------------------------------------- */
/*                          SELECT CONTAINER CONTENT                          */
/* -------------------------------------------------------------------------- */
export const SELECT_CONTAINER_CONTENT: Record<string, Select_Container_Fields> = {
  role: {
    name: "Role",
    items: ["Admin", "Editor", "Viewer"],
    defaultValue: "Viewer",
  },
  status: {
    name: "Status",
    items: ["Active", "Inactive", "Pending"],
    defaultValue: "Active",
  },
  record_type: {
    name: "Record Categories",
    items: DNS_RECORD_CATEGORIES_INPUT,
    defaultValue: "ALL",
  },
  well_known_ports_protocol_type: {
    name: "TRANSPORT PROTOCOL",
    items: ["TCP", "UDP", "DEFAULT"],
    defaultValue: "DEFAULT",
  },
  transport_protocol: {
    name: "TRANSPORT PROTOCOL",
    items: ["TCP", "UDP"],
    defaultValue: "UDP",
  },
  open_port_check_input: {
    name: "INPUT TYPE",
    items: ["RANGE", "LIST"],
    defaultValue: "RANGE",
  },
};

/* -------------------------------------------------------------------------- */
/*                         CHECKBOX CONTAINER CONTENT                         */
/* -------------------------------------------------------------------------- */
export const CHECKBOX_CONTAINER_CONTENT: Record<string, Checkbox_Container_Record_Categories> = {
  record_categories: {
    name: "Record Categories",
    items: DNS_RECORD_CATEGORIES_INPUT,
    selectedItems: ["ALL"],
    caption: "Select one or more DNS categories",
  },
  well_known_ports_type: {
    name: "Well known Ports",
    items: Object.keys(WELL_KNOWN_PORTS_RECORD).map((port) =>
      port === "ALL" ? port : `${port} (${WELL_KNOWN_PORTS_RECORD[port]})`
    ),
    selectedItems: ["ALL"],
    caption: "Select one or more ports",
  },
};

/* -------------------------------------------------------------------------- */
/*                                   RECORDS                                  */
/* -------------------------------------------------------------------------- */
const createRecordCategory = (name: string, items: string[] = []): Checkbox_Container_Record_Categories => {
  const fullItems = items.length > 0 ? ["ALL", ...items] : [];
  return {
    name,
    items: fullItems,
    selectedItems: [...fullItems],
  };
};

export const RECORDS: Record<string, Checkbox_Container_Record_Categories> = {
  authoritative_zone: createRecordCategory("Authoritative Zone Records", ["A", "AAAA", "SOA"]),
  dnssec: createRecordCategory("DNSSEC Records", ["DS", "DNSKEY", "RRSIG", "NSEC", "NSEC3", "NSEC3PARAM", "CDS", "CDNSKEY"]),
  reverse_dns: createRecordCategory("Reverse DNS Records"),
  email: createRecordCategory("Email Records"),
  service_discovery: createRecordCategory("Service Discovery Records"),
  infrastructure: createRecordCategory("Infrastructure Records", ["HINFO", "LOC", "RP"]),
  security: createRecordCategory("Security Records", ["SSHFP", "IPSECKEY"]),
  certificates: createRecordCategory("Certificates Records", ["CAA", "CERT"]),
  misc: createRecordCategory("Misc Records", ["EUI48", "EUI64", "APL", "CSYNC", "ZONEMD"]),
};

/* -------------------------------------------------------------------------- */
/*                         CUSTOM DNS RECORD CONTENT                          */
/* -------------------------------------------------------------------------- */
const createCustomRecord = (
  name: string,
  placeholder: string,
  caption: string,
  regex?: string
): Input_Container_Fields[] => [
  {
    name,
    value: "",
    placeholder,
    type: "text",
    caption,
    ...(regex ? { regex } : {}),
  },
];

export const CUSTOM_DNS_RECORD_CONTENT: Record<string, Record<string, Input_Container_Fields[]>> = {
  authoritative_zone: {
    CNAME: createCustomRecord("CNAME", "Enter CNAME target (e.g., www.example.com)", "Canonical name for a subdomain", REGEX_PATTERNS.HOST_SUBDOMAIN),
  },
  email: {
    TXT: createCustomRecord("TXT", "Enter TXT value (SPF, DKIM, or verification code)", "Text record for SPF, DKIM, or domain verification"),
    MX: createCustomRecord("MX", "Enter MX server (e.g., mail.example.com)", "Mail server for the domain", REGEX_PATTERNS.HOST_SUBDOMAIN),
    TXT_DKIM: createCustomRecord("TXT_DKIM", "Enter DKIM selector record (e.g., selector1._domainkey)", "DKIM record for email authentication"),
  },
  reverse_dns: {
    PTR: createCustomRecord("PTR", "Enter PTR record (e.g., maps an IP address to hostname)", "Maps an IP address to its corresponding hostname"),
  },
  service_discovery: {
    SRV: createCustomRecord("SRV", "Enter SRV (service_prefix)", "Specifies the location of network services."),
    NAPTR: createCustomRecord("NAPTR", "Enter NAPTR (service_prefix)", "Provides rewrite rules for dynamic service discovery such as SIP and ENUM."),
    TLSA: createCustomRecord("TLSA", "Enter TLSA (port_protocol_prefix)", "Associates TLS certificates or public keys with a service using DANE."),
    SVCB: createCustomRecord("SVCB", "Enter SVCB (service_prefix)", "Provides service binding information for modern applications."),
    HTTPS: createCustomRecord("HTTPS", "Enter HTTPS (service_prefix)", "Provides HTTPS endpoint configuration and supports HTTP/3 and modern web protocols."),
  },
  infrastructure: {
    AFSDB: createCustomRecord("AFSDB", "Enter AFSDB (subdomain)", "Identifies AFS or DCE naming database servers."),
    X25: createCustomRecord("X25", "Enter X25 (subdomain)", "Maps a hostname to an X.25 network address."),
    ISDN: createCustomRecord("ISDN", "Enter ISDN (subdomain)", "Stores an ISDN telephone number associated with the host."),
    RT: createCustomRecord("RT", "Enter RT (subdomain)", "Specifies an intermediate host for routing traffic."),
    KX: createCustomRecord("KX", "Enter KX (subdomain)", "Specifies a key management server for the domain."),
  },
  security: {
    OPENPGPKEY: createCustomRecord("OPENPGPKEY", "Enter OPENPGPKEY (email_hash_prefix)", "Publishes OpenPGP public keys."),
    SMIMEA: createCustomRecord("SMIMEA", "Enter SMIMEA (email_hash_prefix)", "Associates S/MIME certificates with email addresses."),
    TLSA: createCustomRecord("TLSA", "Enter TLSA (port_protocol_prefix)", "Associates TLS certificates with a service using DANE."),
  },
  certificates: {
    CAA: createCustomRecord("CAA", "Enter CAA value (e.g., letsencrypt.org)", "Certificate Authority Authorization record"),
  },
};

/* -------------------------------------------------------------------------- */
/*                       NETWORK UTILITY PARAMETERS                           */
/* -------------------------------------------------------------------------- */
export const TRACEROUTE_PARAMETERS: Record<string, Input_Container_Fields> = {
  destination: DESTINATION_FIELD,
  timeout: TIMEOUT_MS_FIELD,
  maxHops: {
    name: "maxHops",
    value: "30",
    placeholder: "Enter max hops (1 - 255, default: 30)",
    type: "number",
    caption: "Maximum number of hops (TTL) to probe, between 1 and 255",
    regex: REGEX_PATTERNS.MAX_HOPS,
  },
};

export const PING_PARAMETERS: Record<string, Input_Container_Fields> = {
  destination: DESTINATION_FIELD,
  timeout: TIMEOUT_MS_FIELD,
  count: {
    name: "count",
    value: 4,
    placeholder: "Enter the number of ping requests (e.g., 4)",
    type: "number",
    caption: "Number of ping requests to send",
    regex: REGEX_PATTERNS.POSITIVE_INT,
  },
  byte: {
    name: "byte",
    value: 32,
    placeholder: "Enter byte size for ping (e.g., 32)",
    type: "number",
    caption: "The size of the ping packet in bytes",
    regex: REGEX_PATTERNS.POSITIVE_INT,
  },
};
