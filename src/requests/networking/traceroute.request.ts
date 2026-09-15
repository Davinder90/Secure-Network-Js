import { AxiosResponse } from "axios";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import pythonAxiosInstance from "@/src/lib/helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@/src/lib/utils/constants";

export const traceroute = async (destination: string, timeout: number, max_hops: number ) => {
    const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.get(PYTHON_SERVER_PATHS.TRACEROUTE+`?destination=${destination}&timeout=${timeout}&maxhops=${max_hops}`)
    }) as AxiosResponse;
    return handleResponse(result);
}