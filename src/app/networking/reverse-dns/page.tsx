'use client';
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { InputContainer, MiniHeader, OperateButton } from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import { Input_Container_Fields } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";
import { INPUT_CONTAINER_CONTENT } from "@/src/lib/utils/ui/inputFields/InputField.constant";
import { reverseDns } from "@requests/networking/reverseDns.request";


const ReverseDns = () => {
    const pathname = usePathname();
    const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;
    const [inputState, setInputState] = useState<Input_Container_Fields>({...INPUT_CONTAINER_CONTENT.ipAddress});
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleReverseDns = async (event:  React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const ip = inputState.value;
        const ip_regex = new RegExp(inputState.regex as string)
        if(!ip || !(ip_regex.test(ip as string))){
            return toast.error('Invalid ip address')
        }
        setLoading(true);
        const data = await reverseDns(ip as string);
        setLoading(false);
        if(data.status == true){
            console.log(data.result)
            setResult(data.result.domain)
            return toast.success(data.message)
        }
        setResult(data.error);
        return toast.error(data.error);
    }
    
    return <div className="py-8">
  <MiniHeader name={service_Information.name} />

  <div className="mt-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
    <div className="p-6 space-y-8">

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

        {result && (
          <div className="bg-gray-100 p-4 rounded-lg shadow-md flex items-center justify-center">
            <p className="text-lg font-semibold text-gray-800">Domain: <span className="text-blue-600">{result}</span></p>
          </div>
        )}
      </div>
      <OperateButton
        loading={loading}
        name="Lookup Information"
        loadingName="...LookingUp"
        handleClick={(event) => {
          handleReverseDns(event);
        }}
      />
    </div>
  </div>
</div>

}

export default ReverseDns;