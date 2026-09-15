import { NextResponse } from "next/server";
import { IResponseObject } from "@/src/lib/interfaces/api.interfaces";
import logger from "@log/logger";
import { COLORS } from "@/src/lib/utils/constants";
import { StatusCodes } from "http-status-codes";
import axios, { AxiosError, AxiosResponse } from "axios";



const generateResponse = (
  status_code: number,
  success: boolean,
  message: string,
  result: object | null
): NextResponse => {
  return NextResponse.json(
    {
      success,
      message,
      result,
    },
    { status: status_code }
  );
};

export const generateResponseObject = (
  result: IResponseObject
): NextResponse => {
  if (result?.error) {
    return generateResponse(
      result.status_code as number,
      false,
      result.error,
      result?.data ? result.data : null
    );
  }
  return generateResponse(
    StatusCodes.OK,
    true,
    result?.message as string,
    result?.data ? result.data : null
  );
};

export const asyncRequestHandler = async <T>(
  fn: () => Promise<T>,
  errorMessage: string,
  status_code: number
): Promise<T | unknown> => {
  try {
    return await fn();
  } catch (error) {
    logger.error(`${COLORS.RED}${errorMessage}, ${error}${COLORS.RESET}`);
    return {
      error: errorMessage,
      status_code,
    };
  }
};

export const asyncFunctionHandler = async <T>(
  fn: () => Promise<T>,
  errorMessage: string,
): Promise<T | unknown> => {
  try {
    return await fn();
  } catch (error) {
    logger.error(`${COLORS.RED}${errorMessage} ${error}${COLORS.RESET}`);
  }
};

export const proxyResponse = (result: (AxiosResponse | Error) ) => {
  if(axios.isAxiosError(result) === false){
    const response = result as AxiosResponse;
    if(response?.data){
      return NextResponse.json(response.data, {status: response.status})
    }
  }
  
  const error = result as AxiosError;
  if(error.response) {
    return NextResponse.json(error.response.data ?? {error: 'Client error', status: false}, {status: error.response.status})
  }

  return NextResponse.json({error: "Upstream service unavailable", status: false}, {status: 500})
}