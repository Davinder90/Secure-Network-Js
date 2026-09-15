'use client';

import dynamic from "next/dynamic";
import { useState } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  ServerIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";

import { InputContainer, MiniHeader, OperateButton } from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { IpAsnResultProps } from "@/src/lib/interfaces/networking/networking.interfaces";
import { Input_Container_Fields } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";
import { INPUT_CONTAINER_CONTENT } from "@/src/lib/utils/ui/inputFields/InputField.constant";
import { getIpInformation } from "@requests/networking/ipinformation.request";

// Dynamically import map component for SSR compatibility
const LeafletMap = dynamic(() => import("@components/leaflet/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
      <span className="text-sm font-medium text-gray-500 animate-pulse">Loading geolocation map...</span>
    </div>
  ),
});

const ResultIpInformation = ({ data }: { data: IpAsnResultProps }) => {
  // Safe extraction for coordinates and Anycast indicators
  const latitude = (data as any).latitude ?? (data as any).location?.latitude;
  const longitude = (data as any).longitude ?? (data as any).location?.longitude;
  const isAnycast = (data as any).is_anycast ?? false;
  const anycastProvider = (data as any).anycast_provider ?? null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 mt-8">
      {/* Anycast Alert Notification */}
      {isAnycast && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              Anycast Network Identified {anycastProvider && `(${anycastProvider})`}
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              This IP address routes to distributed edge nodes across multiple global regions. The coordinates below represent the central organization registration point.
            </p>
          </div>
        </div>
      )}

      {/* KPI Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">IP Address</span>
          <p className="text-base font-bold font-mono text-gray-800 mt-0.5 break-all">{data.resolved_ip}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">ASN Number</span>
          <p className="text-base font-bold font-mono text-gray-800 mt-0.5">{data?.network.asn || "-"}</p>
          <span className="text-[10px] text-gray-500 truncate block">{data?.network.asn_description}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Country / Registry</span>
          <p className="text-base font-bold text-gray-800 mt-0.5">
            {data.network.asn_country_code || "-"} ({data.network.asn_registry || "-"})
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Routing Architecture</span>
          <div className="mt-1">
            {isAnycast ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                Anycast Edge
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                Unicast Static
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Split Cards: Details Table & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Network & Organization Details */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <ServerIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-bold text-gray-800">Network & Organization Details</h2>
          </div>

          <table className="min-w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2.5 font-semibold text-gray-500 w-1/3">Organization</td>
                <td className="py-2.5 font-medium text-gray-900">{data.network.organization || "-"}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-gray-500">Network Name</td>
                <td className="py-2.5 font-mono text-gray-800">{data.network.name || "-"}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-gray-500">CIDR Range</td>
                <td className="py-2.5 font-mono text-gray-800">{data.network.cidr || "-"}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-gray-500">Network Handle</td>
                <td className="py-2.5 font-mono text-gray-800">{data.network.handle || "-"}</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-gray-500">ASN Description</td>
                <td className="py-2.5 text-gray-800">{data.network.asn_description || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Geographic Map Visualization */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-red-600" />
              <h2 className="text-base font-bold text-gray-800">Geographic Location</h2>
            </div>
            {latitude && longitude && (
              <span className="text-xs font-mono text-gray-500">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            )}
          </div>

          {latitude && longitude ? (
            <LeafletMap
              latitude={latitude}
              longitude={longitude}
              label={`${data.resolved_ip} (${data.network.organization || 'Registry'})`}
              isAnycast={isAnycast}
            />
          ) : (
            <div className="w-full h-80 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <GlobeAmericasIcon className="h-8 w-8 mb-1 text-gray-400" />
              <span className="text-xs">No latitude/longitude coordinates returned for this IP.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const IpInformation = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [inputState, setInputState] = useState<Input_Container_Fields>({
    ...INPUT_CONTAINER_CONTENT.domain_ip,
  });
  const [information, setInformation] = useState<IpAsnResultProps | null>(null);
  const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;

  const handleIpInformation = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const domain_ip = inputState.value;
    const domain_ip_regex = new RegExp(inputState.regex as string);

    if (!domain_ip || (inputState.regex && !domain_ip_regex.test(domain_ip as string))) {
      return toast.error("Enter a valid IP address or domain name");
    }

    setLoading(true);
    const data = await getIpInformation(domain_ip as string);
    setLoading(false);

    if (data.status === true) {
      setInformation(data.result);
      return toast.success(data.message || "Lookup successful");
    }

    setInformation(null);
    return toast.error(data.error || "Lookup failed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      <MiniHeader name={service_Information?.name || "IP Intelligence"} />
      
      <div className="mt-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputContainer
              fields={inputState}
              onChange={(value) =>
                setInputState((prev) => ({
                  ...prev,
                  value,
                }))
              }
            />
          </div>

          <div className="pt-2">
            <OperateButton
              loading={loading}
              name="Lookup IP Details"
              loadingName="...Looking Up"
              handleClick={(event) => handleIpInformation(event)}
            />
          </div>
        </div>
      </div>

      {information && <ResultIpInformation data={information} />}
    </div>
  );
};

export default IpInformation;
