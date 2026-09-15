'use client';
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { InputContainer, MiniHeader, OperateButton, PingCircularPie } from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { IConnectivityData, IPingInfo, IPingResult } from "@/src/lib/interfaces/networking/networking.interfaces";
import { Input_Container_Fields } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";
import { PING_PARAMETERS } from "@/src/lib/utils/ui/inputFields/InputField.constant";
import { ping } from "@requests/networking/ping.request";


const PAGE_SIZE = 10;
const PingResultTable = ({ data }: { data: IConnectivityData[] }) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const paginatedData = data.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handlePrev = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(p + 1, totalPages));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        Ping Results
      </h2>

       <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Seq</th>
              <th className="px-6 py-3 text-left">Source IP</th>
              <th className="px-6 py-3 text-left">TTL</th>
              <th className="px-6 py-3 text-left">RTT</th>
              <th className="px-6 py-3 text-left">Message</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((entry, index) => (
              <tr
                key={index}
                className="transition hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-700">
                  {entry.seq}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {entry.src}
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                    {entry.ttl}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {entry.rtt !== undefined ? (
                    <span
                      className={`font-medium ${
                        entry.rtt < 50
                          ? "text-green-600"
                          : entry.rtt < 100
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {entry.rtt} ms
                    </span>
                  ) : (
                    <span className="text-gray-400">*</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${
                        entry.message
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                  >
                    {entry.message || "Success"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 rounded-md border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const PingResultSummary = ({ info }: { info: IPingInfo }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Ping Summary
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <tbody>
              {[
                ["Min RTT (ms)", info.min],
                ["Max RTT (ms)", info.max],
                ["Average RTT (ms)", info.avg],
                ["Packets Sent", info.sent],
                ["Packets Received", info.received],
                ["Packets Lost", info.lost],
                ["Packet Loss (%)", `${info.percentage}%`],
              ].map(([label, value]) => (
                <tr key={label} className="border-b">
                  <td className="px-4 py-2 text-gray-600 font-medium">
                    {label}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-800">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <PingCircularPie
            received={info.received}
            lost={info.lost}
          />
        </div>
      </div>
    </div>
  );
};


const PingTest = () => {
    const pathname = usePathname();
    const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;
    const [loading, setLoading] = useState(false);
    const [inputState, setInputState] = useState<Record<string, Input_Container_Fields>>({
            destination: {...PING_PARAMETERS.destination},
            timeout: {...PING_PARAMETERS.timeout},
            count: {...PING_PARAMETERS.count},
            byte: {...PING_PARAMETERS.byte}

    });
    const [result, setResult] = useState<IPingResult | null>()

    const handlePing = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
         const destination = inputState.destination.value as string;
        const destination_regex = new RegExp(inputState.destination.regex as string);
        if(!destination || !destination_regex.test(destination)){
            return toast.error(`Invalid destination address (ip or domain)`)
        }
      
        setLoading(true);
        const data = await ping(destination, inputState.timeout.value as number, inputState.count.value as number, inputState.byte.value as number );
        setLoading(false);
        if(data.status){
            setResult({data: data.result, info: data.info})
            return toast.success(data.message);
        }
        return toast.error(data.error);
    }
    
    return<div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <MiniHeader name={service_Information.name} />
    
            <div className="mt-6 flex flex-wrap gap-6 justify-center items-center">
                {
                Object.keys(inputState).map((parameter, index) => {
                    const param_data = inputState[parameter];
    
                    return (
                    <div key={index} className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out w-full sm:w-1/2 lg:w-1/2 xl:w-1/3">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">
                        {parameter}
                        </h4>
    
                        <InputContainer
                        fields={param_data}
                        onChange={(value) => {
                            setInputState((prev) => ({
                            ...prev,
                            [parameter]: { ...param_data, value },
                            }));
                        }}
                        />
                    </div>
                    );
                })
                }
    
                <div className="mt-6 px-2 py-1 w-140">
                    <OperateButton
                    loading={loading}
                    name="Ping"
                    loadingName="...pinging"
                    handleClick={(event) => {handlePing(event)}}
                    />
                </div>
            </div>
            <div className="mt-6">
                {result?.data.length && <PingResultTable data={result.data}/>}
                {result?.info && <PingResultSummary info={result.info} />}
            </div>
            </div>

}

export default PingTest;