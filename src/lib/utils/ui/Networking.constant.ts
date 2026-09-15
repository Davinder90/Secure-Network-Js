import { Content_Block } from "@/src/lib/type/ui/inputFields/inputcomponent.types"
import {DNSRecordCategory} from "@/src/lib/interfaces/networking/networking.interfaces"

// CONTENT BLOCKS
export const NETWORKING_CONTENT_BLOCK : Content_Block[] = [
  {
    name: "Domain & IP Lookup",
    description: "Find detailed IP information, DNS records, and ownership details for domains and IP addresses.",
    image_path: "/iplookup.png"
  },
  {
    name: "Connectivity Checks",
    description: "Check latency, packet loss, ping, and traceroute to ensure your hosts are reachable.",
    image_path: "/connectivity.png"
  },
  {
    name: "Ports & Services",
    description: "Scan open ports, detect running services, and explore standard protocols used by servers.",
    image_path: "/ports.png"
  },
  {
    name: "Web Analysis",
    description: "Inspect HTTP headers, check URL redirects, and monitor status codes for web resources.",
    image_path: "/webfiles.png"
  },
]


export const DNS_RECORD_CATEGORIES_INPUT = [
  "ALL",
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
]

export const WELL_KNOWN_PORTS = [21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 123, 137, 138, 139, 143, 161, 389, 443, 445, 500, 514, 1900, 2049, 3306, 3389, 5900, 8080]
export const WELL_KNOWN_PORTS_RECORD: Record<string, (string | number)> = {
    "ALL": "_",
    "FTP": 21,
    "SSH": 22,
    "Telnet": 23,
    "SMTP": 25,
    "DNS": 53,
    "DHCP-Server": 67,
    "DHCP-Client": 68,
    "TFTP": 69,
    "HTTP": 80,
    "POP3": 110,
    "NTP": 123,
    "NetBIOS": 137,
    "NetBIOS-Datagram": 138,
    "NetBIOS-Session": 139,
    "IMAP": 143,
    "SNMP": 161,
    "LDAP": 389,
    "HTTPS": 443,
    "SMB": 445,
    "ISAKMP": 500,
    "Syslog": 514,
    "SSDP": 1900,
    "NFS": 2049,
    "MySQL": 3306,
    "RDP": 3389,
    "VNC": 5900,
    "HTTP-ALT": 8080
}


export const DNS_RECORD_CATEGORIES: Record<
  | "AUTHORITATIVE_ZONE"
  | "DNSSEC"
  | "REVERSE_DNS"
  | "EMAIL"
  | "SERVICE_DISCOVERY"
  | "INFRASTRUCTURE"
  | "SECURITY"
  | "CERTIFICATES"
  | "MISC",
  DNSRecordCategory
> = {
    //=====================================================================
    // Common DNS Records (Most Frequently Used)
    // =====================================================================
    "AUTHORITATIVE_ZONE": {
        "static": {
            "A": "Maps a hostname to an IPv4 address.",
            "AAAA": "Maps a hostname to an IPv6 address.",
            // "NS": "Identifies the authoritative name servers for the domain.",
            "SOA": "Contains administrative information about the DNS zone including the primary nameserver and serial number.",
        },
        "dynamic": {
            "CNAME": {
                "description": "Creates an alias for another hostname.",
                "input_required": "subdomain",
                "examples": ["www", "api", "cdn", "mail", "ftp"],
            },
        },
    },

    // =====================================================================
    // DNSSEC Records
    // =====================================================================
    "DNSSEC": {
        "static": {
            "DS": "Links the parent zone to the child zone as part of the DNSSEC chain of trust.",
            "DNSKEY": "Contains the public keys used to validate DNSSEC signatures.",
            "RRSIG": "Contains digital signatures for DNS resource record sets.",
            "NSEC": "Provides authenticated proof that a DNS record does not exist.",
            "NSEC3": "Provides authenticated denial of existence using hashed record names.",
            "NSEC3PARAM": "Defines the parameters used to generate NSEC3 records.",
            "CDS": "Publishes child DS records for automated DNSSEC delegation.",
            "CDNSKEY": "Publishes child DNSKEY records for automated DNSSEC management.",
        },
        "dynamic": {},
    },

    // =====================================================================
    // Reverse DNS
    // =====================================================================
    "REVERSE_DNS": {
        "static": {},
        "dynamic": {
            "PTR": {
                "description": "Maps an IP address back to its corresponding hostname.",
                "input_required": "ip_address",
                "examples": ["192.168.1.1", "8.8.8.8", "2001:db8::1"],
            },
        },
    },

    // =====================================================================
    // Email Related Records
    // =====================================================================
    "EMAIL": {
        "static": {
            "MX": "Specifies the mail servers responsible for handling email.",
            "TXT": "Stores SPF, DKIM, DMARC, and other email authentication records for the base domain.",
        },
        "dynamic": {
            "TXT_DKIM": {
                "description": "DKIM selector record for email authentication.",
                "input_required": "subdomain_prefix",
                "examples": ["selector1._domainkey", "selector2._domainkey", "google._domainkey"],
            },
            "TXT_DMARC": {
                "description": "DMARC policy record for email authentication.",
                "input_required": "subdomain_prefix",
                "examples": ["_dmarc"],
            },
            "SPF": {
                "description": "Legacy Sender Policy Framework record (deprecated in favor of TXT records).",
                "input_required": "base_domain_or_subdomain",
                "examples": ["example.com", "mail.example.com"],
            },
        },
    },

    // =====================================================================
    // Service Discovery Records
    // =====================================================================
    "SERVICE_DISCOVERY": {
        "static": {},
        "dynamic": {
            "SRV": {
                "description": "Specifies the location of network services.",
                "input_required": "service_prefix",
                "examples": ["_sip._tcp", "_ldap._tcp", "_xmpp-server._tcp", "_http._tcp"],
            },
            "NAPTR": {
                "description": "Provides rewrite rules for dynamic service discovery such as SIP and ENUM.",
                "input_required": "service_prefix",
                "examples": ["_sip._tcp", "_h323._tcp"],
            },
            "TLSA": {
                "description": "Associates TLS certificates or public keys with a service using DANE.",
                "input_required": "port_protocol_prefix",
                "examples": ["_443._tcp", "_25._tcp", "_465._tcp"],
            },
            "SVCB": {
                "description": "Provides service binding information for modern applications.",
                "input_required": "service_prefix",
                "examples": ["_https", "_http"],
            },
            "HTTPS": {
                "description": "Provides HTTPS endpoint configuration and supports HTTP/3 and modern web protocols.",
                "input_required": "service_prefix",
                "examples": ["_https"],
            },
        },
    },

    // =====================================================================
    // Infrastructure & Legacy Records
    // =====================================================================
    "INFRASTRUCTURE": {
        "static": {
            "HINFO": "Describes the host's CPU architecture and operating system.",
            "LOC": "Stores the geographic location of a host.",
            "RP": "Specifies the responsible person for the domain.",
        },
        "dynamic": {
            "AFSDB": {
                "description": "Identifies AFS or DCE naming database servers.",
                "input_required": "subdomain",
                "examples": ["afs", "dce"],
            },
            "X25": {
                "description": "Maps a hostname to an X.25 network address.",
                "input_required": "subdomain",
                "examples": ["x25"],
            },
            "ISDN": {
                "description": "Stores an ISDN telephone number associated with the host.",
                "input_required": "subdomain",
                "examples": ["isdn"],
            },
            "RT": {
                "description": "Specifies an intermediate host for routing traffic.",
                "input_required": "subdomain",
                "examples": ["route"],
            },
            "KX": {
                "description": "Specifies a key management server for the domain.",
                "input_required": "subdomain",
                "examples": ["kx"],
            },
            "DNAME": {
                "description": "Redirects an entire subtree of the DNS namespace to another domain.",
                "input_required": "subdomain",
                "examples": ["old", "legacy"],
            },
        },
    },

    // =====================================================================
    // Security & Cryptography
    // =====================================================================
    "SECURITY": {
        "static": {
            "SSHFP": "Publishes SSH public key fingerprints.",
            "IPSECKEY": "Publishes public keys for IPsec.",
        },
        "dynamic": {
            "OPENPGPKEY": {
                "description": "Publishes OpenPGP public keys.",
                "input_required": "email_hash_prefix",
                "examples": ["abc123._openpgpkey"],
            },
            "SMIMEA": {
                "description": "Associates S/MIME certificates with email addresses.",
                "input_required": "email_hash_prefix",
                "examples": ["abc123._smimecert"],
            },
            "TLSA": {
                "description": "Associates TLS certificates with a service using DANE.",
                "input_required": "port_protocol_prefix",
                "examples": ["_443._tcp", "_25._tcp"],
            },
        },
    },

    // =====================================================================
    // Certification Authority & Validation
    // =====================================================================
    "CERTIFICATES": {
        "static": {
            "CAA": "Specifies which Certificate Authorities may issue certificates.",
            "CERT": "Stores digital certificates such as PKIX, SPKI, or PGP.",
        },
        "dynamic": {},
    },

    // =====================================================================
    // Experimental / Miscellaneous
    // =====================================================================
    "MISC": {
        "static": {
            "EUI48": "Stores an IEEE EUI-48 (MAC) address.",
            "EUI64": "Stores an IEEE EUI-64 address.",
            "APL": "Stores address prefix lists.",
            "CSYNC": "Synchronizes selected DNS records between child and parent zones.",
            "ZONEMD": "Provides a cryptographic digest to verify DNS zone integrity.",
        },
        "dynamic": {
            "URI": {
                "description": "Associates a Uniform Resource Identifier (URI) with a domain.",
                "input_required": "service_prefix",
                "examples": ["_http._tcp", "_ftp._tcp"],
            },
        },
    },
}
