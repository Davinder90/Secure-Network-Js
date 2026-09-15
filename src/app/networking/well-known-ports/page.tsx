'use client';
import { Doughnut } from "react-chartjs-2";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { CheckboxContainer, InputContainer, MiniHeader, OperateButton, SelectContainer } from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { CHECKBOX_CONTAINER_CONTENT, INPUT_CONTAINER_CONTENT, SELECT_CONTAINER_CONTENT } from "@utils/ui/inputFields/InputField.constant";
import { WELL_KNOWN_PORTS, WELL_KNOWN_PORTS_RECORD } from "@utils/ui/Networking.constant";
import { wellKnownPorts } from "@requests/networking/wellKnownPorts";
import { SideBar_Item_Field } from "@type/ui/sidebar/sidebar.types";
import { WellKnownPortsResult } from "@type/ui/networking/networking.types";
import { Checkbox_Container_Record_Categories, Input_Container_Fields, Select_Container_Fields } from "@type/ui/inputFields/inputcomponent.types";

const PAGE_SIZE = 15;
const statusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-green-100 text-green-700";
    case "filtered":
      return "bg-red-100 text-red-700";
    case "open|filtered":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};


export const WellKnonwPortsResult = ({data}: {data: WellKnownPortsResult[]}) => {
  const statusCounts = data.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
  );

  const [page, setPage] = useState(1);
  
    const totalPages = Math.ceil(data.length / PAGE_SIZE);
    const paginatedData = data.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

const pieData = {
  labels: Object.keys(statusCounts),
  datasets: [
    {
      data: Object.values(statusCounts),
      backgroundColor: [
        "#ef4444", //red
        "#facc15", // yellow
        "#22c55e", // green
      ],
      borderWidth: 0,
    },
  ],
};

return (
    <div className="p-6 bg-white rounded-xl shadow-md space-y-6 mt-7">
      <h2 className="text-2xl font-semibold text-gray-800">
        Well-Known Ports Scan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="flex justify-between items-center p-4 rounded-lg border hover:shadow-sm transition"
            >
              <span className="capitalize text-gray-700">{status}</span>
              <span className="font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>

        <div className="col-span-2 flex justify-center">
          <div className="w-64 h-64">
            <Doughnut
              data={pieData}
              options={{
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Port</th>
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Protocol</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((entry, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium">{entry.port}</td>
                <td className="px-6 py-4">{entry.port_name}</td>
                <td className="px-6 py-4 uppercase">{entry.protocol}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                      entry.status
                    )}`}
                  >
                    {entry.status}
                  </span>
                </td>
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
}

const WellKnownPorts = () => {
    const pathname = usePathname();
    const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;
    const [loading, setLoading] = useState(false);
    const [inputState, setInputState] = useState<{
        domain: Input_Container_Fields;
        ports: Checkbox_Container_Record_Categories;
        protocol: Select_Container_Fields;
        timeout: Input_Container_Fields
      }>(() => ({
        domain: { ...INPUT_CONTAINER_CONTENT.domain_ip },
        ports: { ...CHECKBOX_CONTAINER_CONTENT.well_known_ports_type, selectedItems: ['ALL']},
        protocol: {...SELECT_CONTAINER_CONTENT.well_known_ports_protocol_type},
        timeout: {...INPUT_CONTAINER_CONTENT.timeout}
}));
    const [result, setResult] = useState< WellKnownPortsResult[] | null>(null)

    const checkBox = (selected: string[]) => {
        setInputState((prev) => ({ ...prev, ports: {...prev.ports, selectedItems: selected}}))
      }

    const handleCheckPorts = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const domain = inputState.domain.value as string;
        const domain_regex = new RegExp(inputState.domain.regex as string);
        const timeout_regex = new RegExp(inputState.timeout.regex as string);
        if(!domain || !domain_regex.test(domain)) return toast.error("Invalid domain")
        if(!inputState.timeout.value || !timeout_regex.test(inputState.timeout.value as string)) return toast.error('Timeout value (>= 0.5 seconds)');
          setLoading(true)

        let ports: number[] = [];
        if(inputState.ports.selectedItems.includes('ALL')){
          ports = WELL_KNOWN_PORTS
        }else {
          for(const port of inputState.ports.selectedItems){
            ports.push(WELL_KNOWN_PORTS_RECORD[port.split(' ')[0]] as number)
          }
        }
        const data = await wellKnownPorts({domain, ports, protocol: inputState.protocol.defaultValue as string, timeout: inputState.timeout.value as number})
        setLoading(false);
        if(data.status == true){
          setResult(data.result)
          return toast.success(data.message)
        }
        setResult(null);
        return toast.error(data.error)
    }
      
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 ">
        <MiniHeader name={service_Information.name} />
        <div className="mt-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="p-6 space-y-8">
        
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-5 md:gap-10">
                        <InputContainer
                          fields={inputState.domain}
                          onChange={(value) =>
                            setInputState((prev) => ({
                              ...prev,
                              domain: { ...prev.domain, value },
                            }))
                          }
                        />

                        <SelectContainer
                          fields={inputState.protocol}
                          onChange={(value) =>
                            setInputState((prev) => ({
                              ...prev,
                              protocol: {
                                ...prev.protocol,
                                defaultValue: value,
                              },
                            }))
                          }
                        />

                        <InputContainer fields={inputState.timeout} onChange={(value) =>
                            setInputState((prev) => ({
                              ...prev,
                              timeout: { ...prev.timeout, value },
                            }))
                          }
/>
                      </div>
                    <CheckboxContainer
                      fields={inputState.ports}
                      onChange={checkBox}
                    />
                  </div>
            </div>
                <OperateButton name="Check Ports" loading={loading} loadingName="...Checking" handleClick={(event) => {handleCheckPorts(event)}}/>
        </div>
        {result && <WellKnonwPortsResult data={result} />}
    </div>
}


export default WellKnownPorts;