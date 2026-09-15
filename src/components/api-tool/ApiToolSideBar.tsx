'use Client';

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronRight, FiMoreVertical, FiPlus, FiSearch, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/redux-store/store";
import { deleteCollection, renameCollection, updateCollections, updateShouldFetchApis, updateStateApis } from "@/src/redux-store/apiTool.slice";


import { IApi, IApiDocument } from "@/src/models/api.model";
import { NAVBAR_HEIGHT } from "@utils/ui/Navbar.constant";
import { ApiDocumentWithOptionalId, ApiWithOptionalId } from "@/src/app/api-tools/page";
import { handleGetApis } from "@requests/api-tool/apiRequest";
import { handleDeleteCollection, handleGetCollections, handleUpdateCollection } from "@requests/api-tool/collection";

type CollectionItemProps = {
  collection: { _id?: string; name: string; description?: string; favorite?: boolean };
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onRun: (id: string) => void;
};

// sidebar collections 
export const SideBarCollectionItem = ({
  collection,
  onDelete,
  onRename,
  onRun,
}: CollectionItemProps) => {
  // main api tool state 
  const apiToolState = useSelector((state: RootState) => state.apitool);
  const dispatch = useDispatch<AppDispatch>();
  // new state 
  const [open, setOpen] = useState(false);
  const [favorite, setFavorite] = useState(collection.favorite || false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(collection.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const [apis, setApis] = useState<ApiDocumentWithOptionalId[]>([]);

  const fetchapis = useCallback(async () => {
    const { result } = await handleGetApis(collection._id);
    setApis(result || []);
    dispatch(updateShouldFetchApis({value: false}));
  }, []);

  useEffect(() => {
    if(apiToolState.shouldFetchApis){
     fetchapis();
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [apiToolState.shouldFetchApis]);

//   toggle fav
  const toggleFavorite = async () => {
    const resp = await handleUpdateCollection({...collection, favorite: !favorite})
    if(resp.success){
      setFavorite(!favorite);
      return toast.success(resp.message);
    }
    return toast.error(resp.error);
  };

//   rename collection
  const handleRename = () => {
    if (newName.trim() !== collection.name && newName.trim()) {
      onRename(collection._id as string, newName);
      setRenaming(false);
    }
  };

//   unique name for new api
const generateApiDefaultName = async () => { 
  const baseName = `${collection.name} new api`; 
  const existing = apiToolState.stateApis.filter(api => api.name && api.name.startsWith(baseName));
  if (existing.length === 0) return baseName; 
  let maxNumber = 0; 
  existing.forEach(api => { 
    const match = api.name.match(/\((\d+)\)$/);
    if (match) { 
      const number = parseInt(match[1], 10); if (number > maxNumber) maxNumber = number; 
    } 
  })
  return `${baseName} (${maxNumber + 1})`;
};

// adding new api to local state 
const handleAddNewApiToContext = async () => {
  
  const new_api_context: IApiDocument = {
    name: await generateApiDefaultName() as string, 
    reqType: 'single',
    collectionId: collection._id as string, 
    apiData: {
      name: await generateApiDefaultName() as string,
      method: 'GET', url: '', 
      headers: [], 
      queryParams: [], 
      body: {type: 'none', content: null}, 
      variables: [], 
      preRequestScript: '', 
      testScript: '', 
      auth: {type: 'none'},
      response: null
    }
  };

  dispatch(updateStateApis({activeApiId: '', activeIndex: -1, data: new_api_context}))
}

// adding api to local state
const handleAddApiToContext = (api: ApiDocumentWithOptionalId) => {
   
    const exists = apiToolState.stateApis.some(item => item._id === api._id);
    if (!exists) {
      dispatch(updateStateApis({activeApiId: '', activeIndex: -1, data: api}))
    }
  };

//  collection opener
const handleOpener = async () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      const { result } = await handleGetApis(collection._id);
      setApis(result || []);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded mb-2">
      <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpener}
            className="text-gray-400 hover:text-white transition w-4 flex justify-center"
          >
            {open ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          </button>
          {renaming ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="bg-[#121212] text-white text-sm px-1 py-0.5 rounded focus:outline-none"
              autoFocus
            />
          ) : (
            <span className={`text-sm ${favorite ? "text-yellow-400" : "text-gray-200"}`}>
              {collection.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 relative">
          <button onClick={handleAddNewApiToContext} className="p-1.5 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition" > <FiPlus size={16} /> </button>
          <button onClick={toggleFavorite} className={`transition ${favorite ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}>
            <FiStar />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-white transition">
            <FiMoreVertical />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={menuRef} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-0 top-full mt-1 bg-[#121212] border border-gray-700 rounded shadow-lg text-sm w-32 z-10 overflow-hidden"
              >
                <button onClick={() => { setRenaming(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">
                  Rename
                </button>
                <button onClick={() => { onRun(collection._id as string); setMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800">
                  Run
                </button>
                <button onClick={() => { onDelete(collection._id as string); setMenuOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-800 text-red-400">
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {open && (
        <>
          {apis.length > 0 && (
            <div className="border-t border-gray-800">
              {apis.map((api) => {
                const isMulti = api.reqType === "multi";
                return (
                  <div
                    key={api._id}
                    onClick={() => handleAddApiToContext(api)}
                    className={`flex items-center gap-2 px-6 py-1.5 text-sm cursor-pointer
                      ${isMulti
                        ? "border border-blue-400 bg-blue-900/20 rounded hover:bg-blue-900/40"
                        : "hover:bg-gray-800"
                      }
                    `}
                  >
                    {isMulti ? (
                      <div>
                        {/* Automation block */}
                        <span className="text-xs font-semibold text-blue-400">
                          FLOW
                        </span>

                        <span className="text-gray-300 truncate max-w-[140px]">
                          {api.name}
                        </span>

                        <span className="text-[10px] text-blue-300 ml-auto">
                          {api.apisData?.length || 0} steps
                        </span>
                      </div>
                    ) : (
                      <div>
                        {/* Single API */}
                        <span
                          className={`text-xs font-semibold mr-2 ${
                            api.apiData?.method === "GET"
                              ? "text-green-400"
                              : api.apiData?.method === "POST"
                              ? "text-blue-400"
                              : api.apiData?.method === "PUT"
                              ? "text-yellow-400"
                              : api.apiData?.method === "DELETE"
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                        >
                          {api.apiData?.method}
                        </span>

                        <span className="text-gray-300 truncate max-w-[140px]">
                          {api.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {collection.description && (
            <div className="px-6 py-2 text-gray-400 text-xs border-t border-gray-700 italic">
              {collection.description}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// sidebar main
const Sidebar = ({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  // main api tool state 
  const apiToolState = useSelector((state: RootState) => state.apitool);
  const dispatch = useDispatch<AppDispatch>();
  // new state 
  const [searchTerm, setSearchTerm] = useState('');
  
  // delete collection
  const handleDelete = async (id: string) => { 
    const resp = await handleDeleteCollection(id);
    if(resp.success){
      dispatch(deleteCollection({id}))
      return toast.success(resp.message);
    }
    return toast.error(resp.error);
  };

  // rename collection
  const handleRename = async (id: string, newName: string) => {
    const collection = apiToolState.collections.find(c => c._id === id);
    const resp = await handleUpdateCollection({...collection, name: newName});
    if(resp.success){
      dispatch(renameCollection({id, newName}))
      return toast.success(resp.message);
    }
    return toast.error(resp.error);
  };

  const handleRun = (id: string) => alert(`Run collection ${id}`);

  // get collections
  const getCollections = useCallback(async () => {
    const {result} = await handleGetCollections();
    dispatch(updateCollections({collections: result}))
  }, []);

  useEffect(() => { getCollections(); }, []);

  return (
    <div className="w-80 bg-[#121212] text-gray-200 border border-gray-800 flex flex-col"
      style={{ position: 'fixed', top: NAVBAR_HEIGHT, left: 0, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
      <div className="flex-shrink-0 px-4 py-3 h-[95px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-gray-300">Collections</span>
          <button onClick={() => setShowModal(true)} className="p-1.5 rounded hover:bg-gray-800 text-gray-300 hover:text-white transition">
            <FiPlus size={16} />
          </button>
        </div>
        <div className="mt-2">
          <motion.div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded px-2 py-1.5 transition">
            <FiSearch size={14} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 placeholder-gray-400 text-gray-200"
            />
          </motion.div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 sidebar-scrollbar">
        <AnimatePresence>
          {apiToolState.collections
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(c => (
              <SideBarCollectionItem
                key={c._id}
                collection={c}
                onDelete={handleDelete}
                onRename={handleRename}
                onRun={handleRun}
              />
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Sidebar;