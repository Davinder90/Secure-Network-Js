import { AxiosResponse } from "axios";
import { asyncResponseHandler, handleResponse } from "@/src/lib/helpers/ui/common.helper";
import pythonAxiosInstance from "@/src/lib/helpers/axios.helpers/python.axios.helpers";
import { PYTHON_SERVER_PATHS } from "@/src/lib/utils/constants";

export const reverseDns = async (ip: string) => {
    const result = await asyncResponseHandler(async () => {
        return await pythonAxiosInstance.get(PYTHON_SERVER_PATHS.REVERSE_DNS+`?ip=${ip}`)
    }) as AxiosResponse;
    return handleResponse(result);
}