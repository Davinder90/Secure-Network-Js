import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper"
import { AxiosResponse } from "axios"
import pythonAxiosInstance from "@helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@utils/constants";

export const openPortCheck = async (data: {query: string, ports: {range: { start: number, end: number}, specific: number[]}, protocol: string, timeout: number, port_input_type: string}) => {
    const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.post(PYTHON_SERVER_PATHS.OPEN_PORT_CHECK, data);
    }) as (AxiosResponse | Error);
    return handleResponse(result);
}