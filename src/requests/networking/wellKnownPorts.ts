import { AxiosResponse } from "axios";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import pythonAxiosInstance from "@helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@utils/constants";

export const wellKnownPorts = async (data: {domain: string, ports: (string | number)[], protocol: string, timeout: number}) => {
    const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.post(PYTHON_SERVER_PATHS.SCAN_WELL_KNONW_PORTS, data);
    }) as (AxiosResponse | Error);
    return handleResponse(result);
}