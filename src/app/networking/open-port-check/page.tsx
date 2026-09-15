'use client';
import toast from "react-hot-toast";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { WellKnownPortsResult } from "@/src/lib/type/ui/networking/networking.types";
import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";
import { Input_Container_Fields, Select_Container_Fields } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { INPUT_CONTAINER_CONTENT, SELECT_CONTAINER_CONTENT } from "@/src/lib/utils/ui/inputFields/InputField.constant";
import { openPortCheck } from "@requests/networking/openPortCheck.request";
import { InputContainer, MiniHeader, OperateButton, SelectContainer } from "@components/mini/MiniComponents";
import { WellKnonwPortsResult } from "@/src/app/networking/well-known-ports/page";

const OpenPortCheck = () => {
    const pathname = usePathname();
    const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;
    const [inputState, setInputState] = useState<{
        domain: Input_Container_Fields,
        protocol: Select_Container_Fields,
        timeout: Input_Container_Fields,
        input_type: Select_Container_Fields
        range: {
            start: Input_Container_Fields,
            end:Input_Container_Fields
        },
        portlist: Input_Container_Fields
    }>({
        domain: {...INPUT_CONTAINER_CONTENT.domain_ip},
        protocol: {...SELECT_CONTAINER_CONTENT.transport_protocol},
        timeout: {...INPUT_CONTAINER_CONTENT.timeout},
        input_type: {...SELECT_CONTAINER_CONTENT.open_port_check_input},
        range: {
            start: {...INPUT_CONTAINER_CONTENT.portstart},
            end: {...INPUT_CONTAINER_CONTENT.portend}
        },
        portlist: {...INPUT_CONTAINER_CONTENT.portlist}
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState< WellKnownPortsResult[] | null>(null)
    

    const handleOpenPortCheck = async (event: React.MouseEvent<Element, MouseEvent>) => {
        event.preventDefault();
        const query = inputState.domain.value as string;
        const port_start_range = inputState.range.start.value;
        const port_end_range = inputState.range.end.value;
        let portlist = inputState.portlist.value as (string | number[]);
        const portlist_regex = new RegExp(inputState.portlist.regex as string);
        const query_regex = new RegExp(inputState.domain.regex as string);
        if(!query || !query_regex.test(query)){
            return toast.error('Invalid domain or ip')
        }
        if(inputState.input_type.defaultValue == 'RANGE' && !port_start_range &&  Number(port_start_range) < 1 && Number(port_start_range) > 65535){
            return toast.error('Invalid Port start range min: 1, max: 65535')
        }
        if(inputState.input_type.defaultValue == 'RANGE' && !port_end_range &&  Number(port_end_range) < 1 && Number(port_end_range) > 65535){
            return toast.error('Invalid Port end range min: 1, max: 65535')
        }
        if(inputState.input_type.defaultValue == 'LIST' && (!portlist || !portlist_regex.test(portlist as string))){
            return toast.error('Invalid Port list')
        }
        portlist = (portlist as string)
                    .split(',')
                    .map(p => Number(p.trim()))
                    .filter(p => !Number.isNaN(p));
        setLoading(true);
        const data = await openPortCheck({
            query,
            ports: {
                range: {start: Number(port_start_range), end: Number(port_end_range)},
                specific: portlist
            },
            port_input_type: inputState.input_type.defaultValue as string,
            timeout: inputState.timeout.value as number,
            protocol: inputState.protocol.defaultValue as string
        });
        setLoading(false);
        if(data.status){
            setResult(data.result);
            return toast.success(data.message)
        }
        setResult(null);
        return toast.error(data.error)
    }
    return <div>
        <MiniHeader name={service_Information.name} />
        <div className="mt-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="p-6 space-y-8">
                
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <SelectContainer
                                  fields={inputState.input_type}
                                  onChange={(value) =>
                                    setInputState((prev) => ({
                                      ...prev,
                                      input_type: {
                                        ...prev.input_type,
                                        defaultValue: value,
                                      },
                                    }))
                                  }
                                />

                            {
                                inputState.input_type.defaultValue == 'RANGE' ?
                                <> 
                                    <InputContainer fields={inputState.range.start} onChange={(value) =>
                                    setInputState((prev) => ({
                                      ...prev,
                                      range: { ...prev.range, start: {...prev.range.start, value}},
                                    }))
                                  }
                                />
                                <InputContainer fields={inputState.range.end} onChange={(value) =>
                                    setInputState((prev) => ({
                                      ...prev,
                                      range: { ...prev.range, end: {...prev.range.end, value} },
                                    }))
                                  }
                                />
                                </>                                
                                : 
                                <InputContainer fields={inputState.portlist} onChange={(value) =>
                                    setInputState((prev) => ({
                                      ...prev,
                                      portlist: { ...prev.portlist, value },
                                    }))
                                  }
                                />
                            }
                    </div>
                        <OperateButton name="Check Ports" loading={loading} loadingName="...Checking" handleClick={(event) => {handleOpenPortCheck(event)}}/>
                </div>
        </div>
        {result && <WellKnonwPortsResult data={result} />}
    </div>
}


export default OpenPortCheck;