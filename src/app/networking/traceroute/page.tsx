'use client';
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { InputContainer, MiniHeader, OperateButton } from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { IConnectivityData, ITracerouteSummary } from "@/src/lib/interfaces/networking/networking.interfaces";
import { Input_Container_Fields } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";
import { TRACEROUTE_PARAMETERS } from "@/src/lib/utils/ui/inputFields/InputField.constant";
import { traceroute } from "@requests/networking/traceroute.request";


const PAGE_SIZE = 10;

const TracerouteResult = ({
  data,
}: {
  data: IConnectivityData[];
}) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = data.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-4 mt-10">
      <h2 className="text-2xl font-semibold text-gray-800">
        Traceroute Results
      </h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Hop</th>
              <th className="px-6 py-3 text-left">Host</th>
              <th className="px-6 py-3 text-left">IP</th>
              <th className="px-6 py-3 text-left">RTT</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((entry, index) => (
              <tr
                key={index}
                className="transition hover:bg-gray-50"
              >
                {
                  !entry.ttl ? 
                <td className="px-6 py-4 font-medium text-gray-700">
                  {entry as string}
                  </td> :
                <>
                <td className="px-6 py-4 font-medium text-gray-700">
                  {entry.ttl || ((index + 1 == data.length) ? (entry as string) : (index + 1))}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {entry.host || "*"}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {entry.src || "*"}
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
                </>
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-md border text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-gray-100"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-md border text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-gray-100"
        >
          Next →
        </button>
      </div>
    </div>
  );
};


const HopBarGraph = ({ hops }: { hops: IConnectivityData[] }) => {
  const maxRtt = Math.max(...hops.map(h => h.rtt as number), 1);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-700">
        Hop Latency Graph
      </h3>

      <div className="space-y-1">
        {hops.map(hop => (
          <div key={hop.ttl} className="flex items-center gap-2">
            <span className="w-8 text-xs text-gray-500">
              {hop.ttl}
            </span>

            <div className="flex-1 bg-gray-100 rounded h-5 relative">
              <div
                className="bg-blue-500 h-5 rounded"
                style={{
                  width: `${(hop.rtt as number / maxRtt) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TracerouteSummary = ({
  info,
  hopsRaw
}: {
  info: ITracerouteSummary;
  hopsRaw: IConnectivityData[];
}) => {
  const hops = hopsRaw.filter(
    (h) => typeof h === 'object' && h !== null && 'ttl' in h && 'rtt' in h
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-800">
        Traceroute Summary
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <table className="min-w-full border border-gray-200 text-sm">
          <tbody>
            {[
              ['Min RTT (ms)', `${info.min} ms`],
              ['Max RTT (ms)', `${info.max} ms`],
              ['Average RTT (ms)', `${info.avg} ms`],
              ['Total Hops', info.hopCount],
              ['Responded Hops', info.respondedHopCount],
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

        <HopBarGraph hops={hops} />
      </div>
    </div>
  );
};

const TraceRoute = () => {
    const pathname = usePathname();
    const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;
    const [loading, setLoading] = useState(false);
    const [inputState, setInputState] = useState<Record<string, Input_Container_Fields>>({
        destination: {...TRACEROUTE_PARAMETERS.destination},
        timeout: {...TRACEROUTE_PARAMETERS.timeout},
        maxhops: {...TRACEROUTE_PARAMETERS.maxhops}
    });
    const [result, setResult] = useState<{data : IConnectivityData[], info: ITracerouteSummary} | null>(null);

    const handleTraceroute = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const destination = inputState.destination.value as string;
        const destination_regex = new RegExp(inputState.destination.regex as string);
        const maxhops = inputState.maxhops.value as number;
        if(!destination || !destination_regex.test(destination)){
            return toast.error(`Invalid destination address (ip or domain)`)
        }
        if(maxhops < 1 || maxhops > 255){
            return toast.error(`Invalid maximum hops (min: 1, max: 255)`)
        }
        setLoading(true);
        const data = await traceroute(destination, inputState.timeout.value as number, maxhops);
        setLoading(false);
        if(data.status){
            setResult({data: data.result, info: data.info});
            return toast.success(data.message);
        }
        setResult(null);
        return toast.error(data.error);
    }
        
    return <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
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
                name="Trace"
                loadingName="...tracing"
                handleClick={(event) => {handleTraceroute(event)}}
                />
            </div>
        </div>
        {result && <TracerouteResult data={result.data}/>}
        {result && <TracerouteSummary hopsRaw={result.data} info={result.info}/>}
        </div>
}


export default TraceRoute;