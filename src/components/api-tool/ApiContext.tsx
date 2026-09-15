"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Braces } from "lucide-react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { FaClone, FaDownload, FaEraser, FaSave, FaUndo } from "react-icons/fa";
import toast from "react-hot-toast";
import { AppDispatch, RootState } from "@/src/redux-store/store";
import { removeStateApi, removeStateApiById, updateCloneApiFields, updateShouldFetchApis, updateStateApi, updateStateApis } from "@/src/redux-store/apiTool.slice";



import { BodyContent, UrlEncodedTable } from "./BodyContent";
import { ResponsePanel } from "./ResponseBar";
import { HeadersContent } from "./HeaderContent";

import { IApi } from "@models/api.model";
import { NAVBAR_HEIGHT } from "@utils/ui/Navbar.constant";
import { AuthorizationType, HeaderType, HttpMethods, TabType, TBody} from "@type/ui/api/api.type";
import { IExecuteResponse, Row} from "@interfaces/api-tool/apiTool.interface"
import {  methodColors, TABS } from "@utils/ui/api/ApiTools.constants";
import { handleCreateApi, handleDeleteApi, handleGetApiById, handleSendApi, handleUpdateApi } from "@requests/api-tool/apiRequest";
import { ApiDocumentWithOptionalId } from "@/src/app/api-tools/page";



const ScriptsContent = ({ data }: { data: string }) => {
  return <div className="text-white">Scripts Content in Develpment Phase</div>;
};

const AuthorizationContent = ({ data }: { data: AuthorizationType }) => {
  return <div className="text-white">Authorization Content in Developement Phase</div>;
};

const TabContent = ({
  tab,
  data,
  updateApi,
}: {
  tab: TabType;
  data: ApiDocumentWithOptionalId;
  updateApi: (updates: Partial<ApiDocumentWithOptionalId>) => void;
}) => {
  switch (tab) {
    case "body":
      return <BodyContent data={data.apiData as IApi} updates={updateApi} />
    case "authorization":
      return <AuthorizationContent data={data?.apiData?.auth as AuthorizationType} />;
    case "headers":
      return <HeadersContent data={data?.apiData?.headers as HeaderType[]} onChange={(newData) =>
            updateApi({apiData: {...(data.apiData as IApi), headers: newData }})} />;
    case "queryParams":
      return <UrlEncodedTable data={data?.apiData?.queryParams as Row[]} 
          onChangeQuery={(newData) => updateApi({apiData: {...(data.apiData as IApi), queryParams: newData}})} url={data?.apiData?.url as string} onChangeUrl={(url) => {updateApi({apiData: {...(data.apiData as IApi),url}})}}/>;
    case "scripts":
      return <ScriptsContent data={data?.apiData?.testScript as string} />;
    default:
      return null;
  }
};

export const Context = ({
  activeApi,
  activeIndex,
}: {
  activeApi: ApiDocumentWithOptionalId;
  activeIndex: number;
}) => {
  if(!activeApi || !activeApi?.name) return null;
  // main api tool state 
  const dispatch = useDispatch<AppDispatch>();
  // new state 
  const [activeTab, setActiveTab] = useState<TabType>("queryParams");
  const [loading, setLoading] = useState(false);
  const [responseHeight, setResponseHeight] = useState(45);
  const [isDragging, setIsDragging] = useState(false);

// update stateapi for local state and db 
const onSave = async () => {
  const data = activeApi?._id
    ? await handleUpdateApi(activeApi)
    : await handleCreateApi(activeApi);

  if (!data.success) return toast.error(data.message);
  dispatch(updateStateApis({activeApiId: activeApi?._id as string, activeIndex, data: data.result}));
  dispatch(updateShouldFetchApis({value: true}));
  toast.success(data.message);
};

// delete from db and local state
const onDelete = async () => {
  if (!activeApi._id) return toast.error("Cannot delete unsaved API");
  const response = await handleDeleteApi(activeApi?._id);
  if (!response.success) return toast.error(response.message);
  dispatch(removeStateApiById({id: activeApi?._id }))
  dispatch(updateShouldFetchApis({value: true}));
  toast.success(response.message);
};


const onDownload= async () => {}
// clear api data
const onClear= async () => {
  dispatch(updateStateApi({activeIndex, updates: {
    ...activeApi, 
    collectionId: activeApi?.collectionId as string,
    apiData: {
      name: activeApi?.apiData?.name as string,
      method: activeApi?.apiData?.method as HttpMethods, 
      url: '', 
      headers: [], 
      queryParams: [], 
      body: {type: 'none', content: null}, 
      variables: [], 
      preRequestScript: '', 
      testScript: '', 
      auth: {type: 'none'},
      response: null
    }
  }}))
}

// create new api using this
const onClone = async () => {
  if(!activeApi._id) return toast.error('Cannot clone unsaved API')
  dispatch(updateCloneApiFields({status: true, id: activeApi._id as string}));
}

// reset the api data  
const onReset= async () => {
  if (!activeApi._id) return toast.error("Cannot reset unsaved API");
  const response = await handleGetApiById(activeApi._id);
  dispatch(updateStateApi({activeIndex, updates: response.result || {}}))
}

// update api 
const updateActiveApi = (updates: Partial<ApiDocumentWithOptionalId>) => { 
  dispatch(updateStateApi({activeIndex, updates}));
};

// send api request 
const handleSend = async () => {
    setLoading(true);
    const data = await handleSendApi(activeApi);
    setLoading(false);
    updateActiveApi({apiData: {...(activeApi.apiData as IApi), response: data.result}})
};

   useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 45 && newHeight < window.innerHeight - 200) {
        setResponseHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const extractQueryParams = (url: string): Row[] => {
    try {
      const parsedUrl = new URL(url);
      const params = new URLSearchParams(parsedUrl.search);

      const rows: Row[] = [];

      params.forEach((value, key) => {
        rows.push({ key, value, description: '', enabled: true });
      });

      return rows;
    } catch {
      return [];
    }
  };

  return (
    <motion.div
      className="fixed flex flex-col bg-neutral-900 text-white overflow-hidden"
        style={{
          top: NAVBAR_HEIGHT + 52,
          left: "calc(19.5rem + 0.75rem)",
          right: 5,
          bottom: 5,
          height: `calc(100vh - ${NAVBAR_HEIGHT + 65}px)`

        }}
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
    <div
      className="flex flex-col p-3 overflow-hidden"
        style={{
          height: `calc(100% - ${responseHeight}px)`,
        }}
      >
      <div className="flex items-center pb-2 bg-neutral-900 rounded-lg w-full">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-400">
            API Name:
          </label>

          <input
            type="text"
            className="w-80 h-8 border border-neutral-600 rounded-lg px-3 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={activeApi?.name as string || ""}
            onChange={(e) => updateActiveApi({ name: e.target.value })}
            placeholder="Enter API name"
          />
        </div>

        <div className="flex items-center gap-7 ml-auto p-2 border border-neutral-600 rounded-md bg-neutral-800">
          <button
            onClick={onSave}
            title="Save"
            className="py-1 px-2 text-blue-500 hover:text-blue-600 cursor-pointer"
          >
            <FaSave size={16} />
          </button>

         <button
            onClick={onDelete}
            title="Delete"
            disabled={!activeApi._id}
            className={`
              py-1 px-2 cursor-pointer
              ${activeApi._id 
                ? "text-gray-300 hover:text-red-700 cursor-pointer"
                : "text-gray-500 bg-gray-700 cursor-not-allowed"} 
              rounded
              transition
            `}
          >
            <RiDeleteBin2Fill size={16} />
          </button>
          
          <button
            onClick={onDownload}
            title="Download Response"
            disabled={!activeApi.apiData?.response} 
            className={`
              py-1 px-2 rounded transition
              ${activeApi.apiData?.response 
                ? "text-green-500 hover:text-green-600 cursor-pointer" 
                : "text-gray-500 bg-gray-700 cursor-not-allowed"} 
            `}
          >
            <FaDownload size={16} />
          </button>
          <button
            onClick={onReset}
            title="Reset"
            className={`
              py-1 px-2 rounded transition
              ${activeApi._id
                ? "text-yellow-400 hover:text-yellow-500 cursor-pointer" 
                : "text-gray-500 bg-gray-700 cursor-not-allowed"} 
            `} >
            <FaUndo size={16} />
          </button>

          <button
            onClick={onClone}
            title="Clone API"
            className="py-1 px-2 text-purple-500 hover:text-purple-600 cursor-pointer"
          >
            <FaClone size={16} />
          </button>

          <button
            onClick={onClear}
            title="Clear"
            className="py-1 px-2 text-red-500 hover:text-red-600 cursor-pointer"
          >
            <FaEraser size={16} />
          </button>
        </div>
      </div>


      <div className="flex gap-3 items-center mb-2">
          <select
            value={activeApi?.apiData?.method}
            onChange={(e) =>
              updateActiveApi({apiData: {...(activeApi.apiData as IApi),method: e.target.value as IApi["method"],}})
            }
            className={`bg-neutral-800 border border-neutral-700 rounded px-4 py-1.5 ${methodColors[activeApi?.apiData?.method as HttpMethods]}`}
          >
            {Object.keys(methodColors).map((method) => (
              <option className={methodColors[method]} key={method}>
                {method}
              </option>
            ))}
          </select>

         <input
            type="text"
            className="flex-1 border border-neutral-600 rounded-lg p-1.5 bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={activeApi.apiData?.url}
            onChange={(e) => {
              const url = e.target.value;
              if (!url.includes("?")) {
                updateActiveApi({apiData: {...(activeApi.apiData as IApi), url, queryParams: [] }});
                return;
              }
              const queryParams = extractQueryParams(url);

              updateActiveApi({apiData: {...(activeApi.apiData as IApi), url, queryParams}});
            }}
            placeholder="https://api.example.com/v1/resource"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`bg-orange-500 text-white px-5 py-1.5 rounded-lg font-semibold shadow-md transition cursor-pointer
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-orange-600"}
            `}
            onClick={handleSend}
            disabled={loading}               >
            {loading ? "Sending..." : "Send"}  
          </motion.button>
        </div>

      <div className="flex flex-col flex-1 min-h-0">
          <div className="flex gap-4 border-b border-neutral-700 mb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1.5 font-medium transition-all ${
                  activeTab === tab
                    ? "text-orange-500 border-b-3 border-orange-500 font-bold lowercase first-letter:uppercase "
                    : "text-neutral-400 hover:text-orange-400 lowercase first-letter:uppercase"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <TabContent tab={activeTab} data={activeApi} updateApi={updateActiveApi} />
        </div>
      </div>
      <div
        className="h-1 bg-neutral-700 cursor-row-resize hover:bg-orange-500 transition"
        onMouseDown={() => setIsDragging(true)}
      />
      <div
        style={{ height: responseHeight }}
        className="bg-neutral-800 border-t border-neutral-700 flex flex-col overflow-hidden"
      >
        <ResponsePanel data={activeApi.apiData?.response} buttonDropDown={(height: number) => {setResponseHeight(height)}}/>
      </div>
    </motion.div>
  );
};

const SingleApiContext= ({activeIndex, activeApi, setActiveIndex}: {activeIndex: number, activeApi: ApiDocumentWithOptionalId, setActiveIndex:React.Dispatch<React.SetStateAction<number>>}) => {
  const {stateApis} = useSelector((state: RootState) => state.apitool);
  const dispatch = useDispatch<AppDispatch>();

  // close button for api pannel
  const closeTab = (index: number) => {
    dispatch(removeStateApi({index}))
    setActiveIndex((prevActive) => {
        if (prevActive > index) return prevActive - 1;
        if (prevActive === index) return Math.max(0, prevActive - 1);
        return prevActive;
      });
  };
  return (
    <div>
      <div
        className="fixed z-50 bg-neutral-900"
        style={{
          top: NAVBAR_HEIGHT,
          left: "calc(19.5rem + 0.75rem)",
          right: 5,
        }}
      >
        <div className="flex items-end px-2 py-2 gap-2 overflow-x-auto border border-b-white">
          <AnimatePresence initial={false}>
            {stateApis.map((api, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={index}
                  layout
                  onClick={() => setActiveIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-t-md cursor-pointer whitespace-nowrap transition
                    ${isActive
                      ? "bg-neutral-600 text-white"
                      : "bg-neutral-900 text-white hover:bg-neutral-700"
                    }`}
                >
                  <Braces size={15} className="text-orange-400" />
                  <span className={`text-xs font-semibold ${methodColors[api?.apiData?.method as HttpMethods]}`}>
                    {api?.apiData?.method}
                  </span>
                  <span className="text-sm truncate max-w-[140px]">{api.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(index);
                    }}
                    className="text-neutral-300 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <Context activeApi={activeApi} activeIndex={activeIndex} />
    </div>
  );
}

// api context 
export const ApiContext = () => {
  // main api tool state 
  const {stateApis} = useSelector((state: RootState) => state.apitool);
  // new state 
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeApi = stateApis[activeIndex] as ApiDocumentWithOptionalId;

  useEffect(() => {
    if (stateApis.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex > stateApis.length - 1) {
      setActiveIndex(stateApis.length - 1);
    }
  }, [stateApis.length, activeIndex]);



  if (stateApis.length === 0) {
    return (
      <div className="fixed top-0 left-81 w-[calc(100%-18rem)] h-full bg-neutral-900 flex flex-col items-center justify-center text-white">
        <Braces size={60} className="text-orange-500 mb-4" />
        <p className="text-m">
          No APIs available. Add a new API from the sidebar or select from collection.
        </p>
      </div>
    );
  }

  if(activeApi?.reqType === 'single' && activeApi.name) return <SingleApiContext activeApi={activeApi} activeIndex={activeIndex} setActiveIndex={setActiveIndex}/>
};

