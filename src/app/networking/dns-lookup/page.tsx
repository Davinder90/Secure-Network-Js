'use client';

import toast from "react-hot-toast";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  MinusCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

import {
  CHECKBOX_CONTAINER_CONTENT,
  CUSTOM_DNS_RECORD_CONTENT,
  INPUT_CONTAINER_CONTENT,
  RECORDS,
  SELECT_CONTAINER_CONTENT
} from "@/src/lib/utils/ui/inputFields/InputField.constant";

import {
  CheckboxContainer,
  InputContainer,
  MiniHeader,
  OperateButton,
  SelectContainer,
} from "@components/mini/MiniComponents";
import { serviceInformation } from "@/src/lib/helpers/ui/operations.helpers";
import {
  IpLookResultParamsField,
  IpLookResultParamsType,
  IpLookupDataType,
  IpLookupResultType,
} from "@/src/lib/type/ui/networking/networking.types";

import { handleDnsIpLookup } from "@requests/networking/iplookup.request";
import {
  Checkbox_Container_Record_Categories,
  Input_Container_Fields,
  Select_Container_Fields
} from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";

const renderValue = (val?: string | string[]) =>
    Array.isArray(val) ? val.join(", ") : val || "-";
// --- Result Subcomponents ---
const DnsLookupServersResult = ({
  servers,
}: {
  servers?: IpLookResultParamsField[];
}) => {
  // Ensure servers is actually an Array before calling .map()
  if (!Array.isArray(servers) || servers.length === 0) return null;

  return (
    <>
      {servers.map((server, idx) => (
        <tr
          key={idx}
          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100 transition-colors"}
        >
          <td className="border border-gray-300 px-4 py-2 font-mono text-sm font-medium text-gray-800">
            {server.type}
          </td>
          <td className="border border-gray-300 px-4 py-2 font-mono text-sm text-gray-700 break-all">
            {renderValue(server.data)}
          </td>
          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
            {server.ttl ?? "-"}
          </td>
          <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
            {server.class}
          </td>
        </tr>
      ))}
    </>
  );
};

export const DnsLookupResult = ({ data }: { data: IpLookupResultType }) => {
  const serversTypes: IpLookResultParamsType[] = [
    'ROOT_SERVERS',
    'TLD_NAMESERVERS',
    'AUTHORITATIVE_NAMESERVERS',
  ];

  const standardRecordCategories: string[] = [
    'AUTHORITATIVE_ZONE',
    'DNSSEC',
    'EMAIL',
    'SECURITY',
    'INFRASTRUCTURE',
    'SERVICE_DISCOVERY',
    'CERTIFICATES',
    'MISC',
    'REVERSE_DNS',
  ];

  const categoryHeadings: Record<string, string> = {
    ROOT_SERVERS: 'Root Servers',
    TLD_NAMESERVERS: 'TLD Nameservers',
    AUTHORITATIVE_NAMESERVERS: 'Authoritative Nameservers',
    AUTHORITATIVE_ZONE: 'Authoritative Zone Records',
    DNSSEC: 'DNSSEC Records',
    EMAIL: 'Email & SPF / TXT Records',
    SECURITY: 'Security Records',
    INFRASTRUCTURE: 'Infrastructure Records',
    SERVICE_DISCOVERY: 'Service Discovery Records',
    CERTIFICATES: 'Certificate Records',
    MISC: 'Miscellaneous Records',
    REVERSE_DNS: 'Reverse DNS Records',
  };

  return (
    <div className="bg-white text-black p-6 font-sans space-y-10 mt-10 rounded-xl shadow-lg border border-gray-200">
      
      {/* 1. Server Hierarchies (Root, TLD, Auth Nameservers) */}
      {serversTypes.map((servers_type) => {
        const typeData = data[servers_type];
        if (!typeData || typeof typeData !== 'object' || Object.keys(typeData).length === 0) return null;

        return (
          <div key={servers_type} className="border-b border-gray-200 pb-8 last:border-b-0">
            <h2 className="text-lg font-bold text-red-700 tracking-wide uppercase mb-4 border-l-4 border-red-700 pl-3">
              {categoryHeadings[servers_type] || servers_type.split('_').join(' ')}
            </h2>

            <div className="space-y-6">
              {Object.keys(typeData).map((serverHost, index) => {
                const serverGroup = typeData[serverHost] as Record<string, IpLookResultParamsField[]>;
                const aRecords = Array.isArray(serverGroup?.['A']) ? serverGroup['A'] : [];
                const aaaaRecords = Array.isArray(serverGroup?.['AAAA']) ? serverGroup['AAAA'] : [];

                if (aRecords.length === 0 && aaaaRecords.length === 0) return null;

                return (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-700 rounded uppercase">
                        Nameserver
                      </span>
                      <h3 className="text-xs font-semibold text-emerald-700 font-mono">
                        {serverHost}
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TYPE</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">VALUE</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TTL</th>
                            <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">CLASS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <DnsLookupServersResult servers={aRecords} />
                          <DnsLookupServersResult servers={aaaaRecords} />
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 2. Categorized DNS Records (Supports both Flat arrays & Dynamic Subdomain objects) */}
      {standardRecordCategories.map((category) => {
        const categoryData = data[category as keyof IpLookupResultType] as Record<string, any> | undefined;
        if (!categoryData || typeof categoryData !== 'object' || Object.keys(categoryData).length === 0) return null;

        const recordTypes = Object.keys(categoryData);

        return (
          <div key={category} className="border-b border-gray-200 pb-8 last:border-b-0">
            <h2 className="text-lg font-bold text-red-700 tracking-wide uppercase mb-4 border-l-4 border-red-700 pl-3">
              {categoryHeadings[category] || category.split('_').join(' ')}
            </h2>

            <div className="space-y-6">
              {recordTypes.map((recType, index) => {
                const recordContent = categoryData[recType];
                if (!recordContent) return null;

                // Case A: Flat list of records -> { "A": [{...}, {...}] }
                if (Array.isArray(recordContent) && recordContent.length > 0) {
                  return (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          {recType}
                        </span>
                        <h3 className="text-xs font-semibold text-gray-700">
                          {recType} Records ({recordContent.length})
                        </h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">NAME</th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TYPE</th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">DATA / VALUE</th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TTL</th>
                              <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">CLASS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recordContent.map((record: IpLookResultParamsField, rIdx: number) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-4 py-2 font-mono text-xs text-gray-800">{record.name}</td>
                                <td className="border border-gray-300 px-4 py-2 font-mono text-xs font-medium text-gray-800">{record.type}</td>
                                <td className="border border-gray-300 px-4 py-2 font-mono text-xs text-gray-700 break-all">{renderValue(record.data)}</td>
                                <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">{record.ttl ?? '-'}</td>
                                <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">{record.class}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }

                // Case B: Nested Subdomain dictionary -> { "CNAME": { "www.hcltech.com": [{...}], "ndesfarm3.hcltech.com": [{...}] } }
                if (typeof recordContent === 'object' && Object.keys(recordContent).length > 0) {
                  return (
                    <div key={index} className="space-y-4">
                      {Object.keys(recordContent).map((subdomainKey, subIdx) => {
                        const subRecords = recordContent[subdomainKey];
                        if (!Array.isArray(subRecords) || subRecords.length === 0) return null;

                        return (
                          <div key={subIdx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                                {recType}
                              </span>
                              <span className="text-xs font-mono font-semibold text-gray-800">
                                {subdomainKey}
                              </span>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">NAME</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TYPE</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">DATA / VALUE</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">TTL</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">CLASS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {subRecords.map((record: IpLookResultParamsField, rIdx: number) => (
                                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="border border-gray-300 px-4 py-2 font-mono text-xs text-gray-800">{record.name}</td>
                                      <td className="border border-gray-300 px-4 py-2 font-mono text-xs font-medium text-gray-800">{record.type}</td>
                                      <td className="border border-gray-300 px-4 py-2 font-mono text-xs text-gray-700 break-all">{renderValue(record.data)}</td>
                                      <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">{record.ttl ?? '-'}</td>
                                      <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">{record.class}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Form Component ---
const DnsLookup = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const [inputState, setInputState] = useState<{
    domain: Input_Container_Fields;
    transport_protocol: Select_Container_Fields;
    timeout: Input_Container_Fields;
    record_category: Checkbox_Container_Record_Categories;
    records: Record<string, Checkbox_Container_Record_Categories>;
    custom_records: Record<string, Record<string, Input_Container_Fields[]>>;
  }>(() => ({
    domain: { ...INPUT_CONTAINER_CONTENT.domain },
    transport_protocol: { ...SELECT_CONTAINER_CONTENT.transport_protocol },
    timeout: { ...INPUT_CONTAINER_CONTENT.timeout },
    record_category: {
      ...CHECKBOX_CONTAINER_CONTENT.record_categories,
      selectedItems: CHECKBOX_CONTAINER_CONTENT.record_categories.items,
    },
    records: { ...RECORDS },
    custom_records: { ...CUSTOM_DNS_RECORD_CONTENT },
  }));

  const [lookupResult, setLookupResult] = useState<IpLookupResultType | null>(null);
  const service_Information = serviceInformation(pathname, pathname.split('/')[1]) as SideBar_Item_Field;

  const toggleSection = (category: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const updateSelectedCategory = (selectedItems: string[]) => {
    setInputState((prevState) => ({
      ...prevState,
      record_category: {
        ...prevState.record_category,
        selectedItems,
      },
    }));
  };

  const updateStaticFieldCheckbox = (category: string, selectedItems: string[]) => {
    setInputState((prevState) => {
      const recordCategory = prevState.records[category];
      return {
        ...prevState,
        records: {
          ...prevState.records,
          [category]: {
            ...recordCategory,
            selectedItems,
          },
        },
      };
    });
  };

  const changeInput = (
    newValue: string,
    category: string,
    recordType: string,
    idx: number
  ) => {
    setInputState((prevState) => {
      const updatedRecords = [...(prevState.custom_records[category]?.[recordType] || [])];
      updatedRecords[idx].value = newValue;

      return {
        ...prevState,
        custom_records: {
          ...prevState.custom_records,
          [category]: {
            ...prevState.custom_records[category],
            [recordType]: updatedRecords,
          },
        },
      };
    });
  };

  const addNewItem = (category: string, recordType: string) => {
    setInputState((prev) => {
      const currentRecords = [...(prev.custom_records[category]?.[recordType] || [])];
      const newItem = {
        name: recordType,
        value: [],
        placeholder: `Enter ${recordType} value`,
        type: "text",
        caption: `${recordType} record input`,
        regex: "",
      };
      currentRecords.push(newItem);

      return {
        ...prev,
        custom_records: {
          ...prev.custom_records,
          [category]: {
            ...prev.custom_records[category],
            [recordType]: currentRecords,
          },
        },
      };
    });
  };

  const removeItem = (category: string, recordType: string, idx: number) => {
    setInputState((prev) => {
      const currentRecords = [...(prev.custom_records[category]?.[recordType] || [])];
      if (currentRecords.length > 1) {
        currentRecords.splice(idx, 1);
      }

      return {
        ...prev,
        custom_records: {
          ...prev.custom_records,
          [category]: {
            ...prev.custom_records[category],
            [recordType]: currentRecords,
          },
        },
      };
    });
  };

  const handleLookUp = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const domain = inputState.domain.value;
    const domain_regex = new RegExp(inputState.domain.regex as string);
    if (!domain || !domain_regex.test(domain as string)) {
      return toast.error('Enter a valid domain');
    }
    setLoading(true);

    type CategoryRecords = Record<string, boolean | Record<string, boolean | string[]>>;
    const category_records: CategoryRecords = {};

    // Step 1: Initialize category records
    for (const category of inputState.record_category.items) {
      if (["ALL", "ROOT_SERVERS", "TLD_NAMESERVERS", "AUTHORITATIVE_NAMESERVERS"].includes(category)) {
        category_records[category] = inputState.record_category.selectedItems.includes(category);
      } else if (inputState.record_category.selectedItems.includes(category)) {
        category_records[category] = {};
      }
    }

    // Step 2: Process standard records
    for (const category of Object.keys(inputState.records || {})) {
      const categoryCheck = inputState.record_category.selectedItems.includes(category.toUpperCase());
      if (!categoryCheck) continue;

      const recordCategory = inputState.records[category];
      for (const record of recordCategory.items) {
        const hasCategorySelected = recordCategory.selectedItems.includes("ALL") || recordCategory.selectedItems.includes(record);
        if (!hasCategorySelected) continue;
        (category_records[category.toUpperCase()] as Record<string, boolean>)[record] =
          recordCategory.selectedItems.includes(record);
      }
    }

    // Step 3: Process dynamic records
    for (const category of Object.keys(inputState.custom_records)) {
      if (
        !inputState.record_category.selectedItems.includes("ALL") &&
        !inputState.record_category.selectedItems.includes(category.toUpperCase())
      ) {
        continue;
      }
      const categoryData = category_records[category.toUpperCase()] as Record<
        string,
        boolean | string[]
      >;

      for (const record of Object.keys(inputState.custom_records[category])) {
        categoryData[record] = [];
        for (const data of inputState.custom_records[category][record]) {
          (categoryData[record] as string[]).push(data.value as string);
        }
      }
    }

    const query_data = {
      domain,
      record_types: category_records,
      transport_protocol: inputState.transport_protocol.defaultValue,
      timeout: parseInt(inputState.timeout.value as string)
    } as IpLookupDataType;

    const data = await handleDnsIpLookup(query_data);
    setLoading(false);
    if (data.status === true) {
      setLookupResult(data.result);
      return toast.success(data.message);
    }
    setLookupResult(null);
    return toast.error(data.error);
  };

  const getReadableCategoryName = (cat: string) => {
    return cat
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <MiniHeader name={service_Information.name} />

      <div className="mt-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">

          {/* Primary Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4 border-b border-gray-200">
            <InputContainer
              fields={inputState.domain}
              onChange={(value) =>
                setInputState((prev) => ({
                  ...prev,
                  domain: { ...prev.domain, value },
                }))
              }
            />

            <SelectContainer
              fields={inputState.transport_protocol}
              onChange={(value) => {
                setInputState((prev) => ({
                  ...prev,
                  transport_protocol: { ...prev.transport_protocol, defaultValue: value }
                }));
              }}
            />

            <InputContainer
              fields={inputState.timeout}
              onChange={(value) =>
                setInputState((prev) => ({
                  ...prev,
                  timeout: { ...prev.timeout, value },
                }))
              }
            />

            <CheckboxContainer
              fields={inputState.record_category}
              onChange={(selectedItems) => updateSelectedCategory(selectedItems)}
            />
          </div>

          {/* Collapsible Record Configurations */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800 tracking-wide uppercase">
                Active Record Configuration Categories
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                Click any section below to expand or collapse
              </span>
            </div>

            <div className="space-y-3">
              {inputState.record_category.items.map((category, index) => {
                if (
                  ["ALL", "ROOT_SERVERS", "TLD_NAMESERVERS", "AUTHORITATIVE_NAMESERVERS"].includes(category) ||
                  !inputState.record_category.selectedItems.includes(category)
                ) {
                  return null;
                }

                const catKey = category.toLowerCase();
                const isOpen = openSections[category] ?? false;
                const activeCheckboxes = inputState.records[catKey]?.selectedItems?.length || 0;
                const customRecordCount = Object.values(inputState.custom_records[catKey] || {}).reduce(
                  (acc, curr) => acc + curr.length,
                  0
                );

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200"
                  >
                    {/* Collapsible Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleSection(category)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                          {getReadableCategoryName(category)}
                        </h4>
                        <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                          {activeCheckboxes} flags &middot; {customRecordCount} inputs
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-500">
                        <span className="text-xs">{isOpen ? "Hide" : "Configure"}</span>
                        {isOpen ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-700" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-700" />
                        )}
                      </div>
                    </button>

                    {/* Collapsible Body Content */}
                    {isOpen && (
                      <div className="p-5 border-t border-gray-200 bg-white space-y-6 max-h-[480px] overflow-y-auto">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <CheckboxContainer
                            fields={inputState.records[catKey]}
                            onChange={(selectedItems) => updateStaticFieldCheckbox(catKey, selectedItems)}
                          />
                        </div>

                        {category !== "DNSSEC" && inputState.custom_records[catKey] && (
                          <div className="space-y-6 pt-2">
                            {Object.keys(inputState.custom_records[catKey]).map((recordType, recordIdx) => (
                              <div key={recordIdx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                    {recordType}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => addNewItem(catKey, recordType)}
                                    className="flex items-center space-x-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                    <span>Add {recordType} field</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {inputState.custom_records[catKey][recordType]?.map((field, idx) => (
                                    <div
                                      key={`${recordType}-${idx}`}
                                      className="relative p-3 bg-white border border-gray-300 rounded-md shadow-sm"
                                    >
                                      <InputContainer
                                        fields={field}
                                        onChange={(newValue) => changeInput(newValue, catKey, recordType, idx)}
                                      />

                                      <button
                                        type="button"
                                        aria-label="Remove item"
                                        className={`absolute top-3 right-3 p-1 rounded-full ${
                                          inputState.custom_records[catKey][recordType].length > 1
                                            ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                                            : "text-gray-300 cursor-not-allowed"
                                        }`}
                                        onClick={() =>
                                          inputState.custom_records[catKey][recordType].length > 1 &&
                                          removeItem(catKey, recordType, idx)
                                        }
                                        disabled={inputState.custom_records[catKey][recordType].length <= 1}
                                      >
                                        <MinusCircleIcon className="h-5 w-5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <OperateButton
              loading={loading}
              name="Lookup DNS"
              loadingName="...Looking Up"
              handleClick={(event) => handleLookUp(event)}
            />
          </div>

        </div>
      </div>

      {lookupResult && <DnsLookupResult data={lookupResult} />}
    </div>
  );
};

export default DnsLookup;
