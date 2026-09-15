import axios, { AxiosError, AxiosResponse } from "axios";
import {
  RecordType, CategoryType
} from "@/src/lib/type/ui/networking/networking.types"

import {DNS_RECORD_CATEGORIES} from "@/src/lib/utils/ui/Networking.constant"

export const asyncResponseHandler = async <T>(
  fn: () => Promise<T>
): Promise<T | unknown> => {
  try {
    return await fn();
  } catch (error) {
    return error as Error;
  }
};


export const handleResponse = (result: (AxiosResponse | Error) ) => {
  if(axios.isAxiosError(result) === false){
    const response = result as AxiosResponse;
    if(response?.data){
      return response.data
    }
  }
  const error = result as AxiosError;
  if(error.response) {
    return error.response.data ?? {error: 'Client error', status: false}
  }
  return{error: "Upstream service unavailable", status: false}
}


export const getDnsRecords = (
  recordType: RecordType,
  category: CategoryType
): string[] => {
  const records: string[] = [];

  // Get the target categories
  const selectedCategories =
    recordType === "all" ? (Object.keys(DNS_RECORD_CATEGORIES) as Array<keyof typeof DNS_RECORD_CATEGORIES>) : [recordType];

  // Iterate over the selected categories
  selectedCategories.forEach((type) => {
    const categoryData = DNS_RECORD_CATEGORIES[type as keyof typeof DNS_RECORD_CATEGORIES];

    if (!categoryData) {
      throw new Error(`Invalid recordType "${recordType}" provided.`);
    }

    // Fetch static, dynamic, or all records based on the category argument
    if (category === "all") {
      records.push(...Object.keys(categoryData.static), ...Object.keys(categoryData.dynamic));
    } else if (category === "static") {
      records.push(...Object.keys(categoryData.static));
    } else if (category === "dynamic") {
      records.push(...Object.keys(categoryData.dynamic));
    }
  });

  return records;
};