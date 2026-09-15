import {
  GlobeAltIcon,
  CpuChipIcon,
  IdentificationIcon,
  ArrowPathIcon,
  WifiIcon,
  MapIcon,
  KeyIcon,
  ListBulletIcon,
  CalculatorIcon,
  Square3Stack3DIcon,
  ServerStackIcon,
} from "@heroicons/react/24/solid";
import { PATHS } from "./Paths.constant";
import { SideBar_Item } from "@/src/lib/type/ui/sidebar/sidebar.types";

export const SIDEBAR_FOR_NAVLINKS = [PATHS.NETWORKING_PATH, PATHS.SECURITY_PATH];

// SIDEBAR CONTENT
export const SIDEBAR: Record<string, SideBar_Item[]> = {
  'security-testing': [],
  'networking': [
    {
      name: "Lookup & Information",
      fields: [
        {
          name: "DNS Lookup",
          path: "/networking/dns-lookup",
          description: "Query DNS records for a domain (A, AAAA, MX, NS).",
          logo: GlobeAltIcon,
        },
        {
          name: "IP Information",
          path: "/networking/ip-information",
          description: "Get detailed information about an IP address, including location and ISP.",
          logo: CpuChipIcon,
        },
        {
          name: "Whois Lookup",
          path: "/networking/whois-lookup",
          description: "Retrieve domain registration details and ownership information.",
          logo: IdentificationIcon,
        },
        {
          name: "Reverse DNS",
          path: "/networking/reverse-dns",
          description: "Find the domain name associated with a given IP address.",
          logo: ArrowPathIcon,
        },
      ],
    },

    {
      name: "Connectivity & Reachability",
      fields: [
        {
          name: "Ping Test",
          path: "/networking/ping-test",
          description: "Check if a host is reachable and measure latency.",
          logo: WifiIcon,
        },
        {
          name: "Traceroute",
          path: "/networking/traceroute",
          description: "Trace the route packets take to reach a destination host.",
          logo: MapIcon,
        },
      ],
    },

    {
      name: "Ports & Services",
      fields: [
        {
          name: "Open Port Check",
          path: "/networking/open-port-check",
          description: "Check which ports are open on a server.",
          logo: KeyIcon,
        },
        {
          name: "Well-Known Ports",
          path: "/networking/well-known-ports",
          description: "Lookup information about standard ports and protocols.",
          logo: ListBulletIcon,
        },
      ],
    },

    {
      name: "IP & Subnetting",
      fields: [
        {
          name: "IPv4 Subnet Calculator",
          path: "/networking/ipv4-subnet-calculator",
          description: "Calculate CIDR, network ID, broadcast IP, usable host range, and wildcard masks.",
          logo: CalculatorIcon,
        },
        {
          name: "IPv6 Subnet Calculator",
          path: "/networking/ipv6-subnet-calculator",
          description: "Calculate IPv6 prefix lengths, subnets, expansion/compression, and address ranges.",
          logo: ServerStackIcon,
        },
        {
          name: "Classful & IP Classifier",
          path: "/networking/ip-class-calculator",
          description: "Identify Class A-E ranges, public vs. private RFC 1918 blocks, and special scopes.",
          logo: Square3Stack3DIcon,
        },
      ],
    },
  ],
};
