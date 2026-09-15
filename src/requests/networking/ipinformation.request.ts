import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper"
import pythonAxiosInstance from "@/src/lib/helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@/src/lib/utils/constants";
import { AxiosResponse } from "axios";


export const getIpInformation = async (query: string) => {
     const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.get(PYTHON_SERVER_PATHS.IP_INFORMATION+`?query=${query}`);
    }) as AxiosResponse;
    return handleResponse(result);   
}

