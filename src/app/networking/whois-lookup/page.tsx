'use client';
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { InputContainer, MiniHeader, OperateButton } from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { IDomainInformation } from "@interfaces/networking/networking.interfaces";
import { SideBar_Item_Field } from "@type/ui/sidebar/sidebar.types";
import { Input_Container_Fields } from "@type/ui/inputFields/inputcomponent.types";
import { INPUT_CONTAINER_CONTENT } from "@utils/ui/inputFields/InputField.constant";
import { getDomainInformation } from "@requests/networking/domainInformation.request";

const ResultDomainInformation = ({ domainInfo }: { domainInfo: IDomainInformation }) => {
const registrarUrls = Array.isArray(domainInfo.registrar.url)
  ? domainInfo.registrar.url
  : domainInfo.registrar.url
    ? [domainInfo.registrar.url]  
    : [];                         

  const [showRegistrant, setShowRegistrant] = useState(true);
  const [showRegistrar, setShowRegistrar] = useState(true);

  const statusArray = Array.isArray(domainInfo.domain_metadata.status)
    ? domainInfo.domain_metadata.status
    : [domainInfo.domain_metadata.status];

  const country = Array.isArray(domainInfo.user.country)
    ? domainInfo.user.country.join(", ")
    : domainInfo.user.country;

  const state = Array.isArray(domainInfo.user.state)
    ? domainInfo.user.state.join(", ")
    : domainInfo.user.state;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Domain Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-gray-700"><strong>Domain Name:</strong> {domainInfo.domain_metadata.name.toLowerCase()}</p>
          <p className="text-gray-700"><strong>Created:</strong> {domainInfo.domain_metadata.created}</p>
          <p className="text-gray-700"><strong>Updated:</strong> {domainInfo.domain_metadata.updated}</p>
          <p className="text-gray-700"><strong>Expires:</strong> {domainInfo.domain_metadata.expires}</p>
          <p className="text-gray-700"><strong>DNSSEC:</strong> {domainInfo.domain_metadata.dnssec}</p>
          <p className="text-gray-700"><strong>Domain ID:</strong> {domainInfo.domain_metadata.id || 'NA'}</p>
        </div>

        <div className="mt-4">
          <strong>Status:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusArray.map((stat, idx) => {
              const parts = stat.split(" ");
              return (
                <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  {parts[0]}
                  {parts[1] && (
                    <a
                      href={parts[1]}
                      className="ml-1 underline hover:text-red-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      [link]
                    </a>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registrant Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowRegistrant(!showRegistrant)}
        >
          <h3 className="text-xl font-semibold text-gray-900">Registrant Information</h3>
          <span className="text-gray-500">{showRegistrant ? "−" : "+"}</span>
        </div>
        {showRegistrant && (
          <div className="mt-4 space-y-2 text-gray-700">
            <p><strong>Email:</strong> {domainInfo.user.email || "N/A"}</p>
            <p><strong>Address:</strong> {domainInfo.user.address || "N/A"}</p>
            <p><strong>State:</strong> {state || "N/A"}</p>
            <p><strong>Country:</strong> {country || "N/A"}</p>
          </div>
        )}
      </div>

      {/* Registrar Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setShowRegistrar(!showRegistrar)}
        >
          <h3 className="text-xl font-semibold text-gray-900">Registrar Details</h3>
          <span className="text-gray-500">{showRegistrar ? "−" : "+"}</span>
        </div>
        {showRegistrar && (
          <div className="mt-4 space-y-2 text-gray-700">
            <p><strong>Name:</strong> {domainInfo.registrar.name || "N/A"}</p>
            <p><strong>Whois Server:</strong> {domainInfo.registrar.whois_server || "N/A"}</p>
            <p>
                <strong>URL:</strong>{" "}
                {registrarUrls.length > 0 ? (
                    <a
                    href={registrarUrls[0]}
                    className="text-red-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    {registrarUrls[0]}
                    </a>
                ) : (
                    "N/A"
                )}
                </p>
          </div>
        )}
      </div>
    </div>
  );
};

const DomainInformation = () => {
    const pathname = usePathname();
    const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;
    const [inputState, setInputState] = useState<Input_Container_Fields>({...INPUT_CONTAINER_CONTENT.domain});
    const [information, setInformation] = useState<IDomainInformation | null>(null);
    const [loading, setLoading] = useState(false);

    const handleDomainInformation = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const domain = inputState.value;
        const domain_regex = new RegExp(inputState.regex as string);
        if(!domain || !domain_regex.test(domain as string)){
            return toast.error('Enter the valid domain')
        }
        setLoading(true);
        const data = await getDomainInformation(domain as string);
        setLoading(false);
        if(data.status == true){
            setInformation(data.result)
            return toast.success(data.message)
        }
        setInformation(null);
        return toast.error(data.error);
    }

    return <div>
        <MiniHeader name={service_Information.name}  />
        <div className="mt-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <InputContainer
                            fields={inputState}
                            onChange={(value) =>
                                setInputState((prev) => ({
                                ...prev, value
                                }))
                            }
                            />
                        </div>
                    <OperateButton loading={loading} name='Whosis LookUp' loadingName="...LookingUp" handleClick={(event) => {handleDomainInformation(event)}}/> 
                    </div>
                </div>
                { information && <ResultDomainInformation domainInfo={information}/>}
    </div>
    
}


export default DomainInformation;