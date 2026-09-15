import { IpLookupDataType } from "@/src/lib/type/ui/networking/networking.types"
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper"
import { AxiosResponse } from "axios"
import pythonAxiosInstance from "@helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@utils/constants";


export const handleDnsIpLookup = async (data: IpLookupDataType) => {
    const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.post(PYTHON_SERVER_PATHS.DNS_LOOKUP, data);
    }) as (AxiosResponse | Error);

    return handleResponse(result);
}