import { AxiosResponse } from "axios";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import pythonAxiosInstance from "@/src/lib/helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@/src/lib/utils/constants";


export const ping = async (destination: string, timeout: number, count: number, byte: number) => {
    const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.get(PYTHON_SERVER_PATHS.PING+`?destination=${destination}&timeout=${timeout}&count=${count}&byte=${byte}`)
    }) as AxiosResponse;
    return handleResponse(result);
}