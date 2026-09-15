'use client';

import { useState } from 'react';
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { NAVBAR_HEIGHT } from '@/src/lib/utils/ui/Navbar.constant';
import { ICollection } from '@/src/models/collection.model';
import { handleCreateCollection } from '@/src/requests/api-tool/collection';
import { IApi, IApiDocument } from '@/src/models/api.model';
import toast from 'react-hot-toast';
import { ApiContext } from '@/src/components/api-tool/ApiContext';
import Sidebar from '@/src/components/api-tool/ApiToolSideBar';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/redux-store/store';
import { updateCloneApiFields, updateCollections, updateShouldFetchApis } from '@/src/redux-store/apiTool.slice';
import { handleCloneApi } from '@/src/requests/api-tool/apiRequest';


export type ApiWithOptionalId = (IApi & { _id?: string });
export type ApiDocumentWithOptionalId = (IApiDocument & { _id?: string})
export type CollectionWithId = (ICollection & { _id?: string });


type CreateCollectionProps = {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CreateCollection = ({ showModal, setShowModal }: CreateCollectionProps) => {
  // main api tool state 
  const apiToolState = useSelector((state: RootState) => state.apitool);
  const dispatch = useDispatch<AppDispatch>();
  // new states 
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  const handleCreate = async () => {
    if (!newCollection.name) return toast.error("Enter the name of collection");

    const resp = await handleCreateCollection(newCollection);
    if(resp.success){
      dispatch(updateCollections({collections: [...apiToolState.collections, resp.result]}))
      setShowModal(false);
      setNewCollection({ name: '', description: '' });
      return toast.success(resp.message);
    }
    return toast.error(resp.error);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#1a1a1a] rounded-lg p-5 w-80 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>

            <h2 className="text-white font-semibold text-lg mb-4">New Collection</h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Collection Name"
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
              <textarea
                placeholder="Description"
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleCreate}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-medium transition"
            >
              Create
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export const CloneApiModal = () => {
  const apiToolState = useSelector((state: RootState) => state.apitool);
  const dispatch = useDispatch<AppDispatch>();

  const [cloneData, setCloneData] = useState({
    name: "",
    collectionId: ""
  });

  const handleClone = async () => {
   if (!apiToolState.cloneApiId) {
      return toast.error("Select a source API to clone");
    }

    if (!cloneData.name || cloneData.name.trim() === "") {
      return toast.error("Enter API name");
    }

    if (!cloneData.collectionId) {
      return toast.error("Select a target collection");
    }
    const result = await handleCloneApi({apiId: apiToolState.cloneApiId, collectionId: cloneData.collectionId, name: cloneData.name});
    if (result.success){
      dispatch(updateShouldFetchApis({value: true}));
      dispatch(updateCloneApiFields({status: false, id: ''}));
      return toast.success(result.message);
    }
    return toast.error(result.message);
  };

return (
  <AnimatePresence>
      {apiToolState.cloneApiShowModel && (
      <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <motion.div
      className="bg-[#1a1a1a] rounded-lg p-5 w-80 relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      >
      <button
      onClick={() => {dispatch(updateCloneApiFields({status: false, id: ''}))}}
      className="absolute top-2 right-2 text-gray-400 hover:text-white"
      > <FiX size={18} /> </button>
              <h2 className="text-white font-semibold text-lg mb-4">Clone API</h2>

        <div className="flex flex-col gap-3">

          {/* API Name */}
          <input
            type="text"
            placeholder="API Name"
            value={cloneData.name}
            onChange={(e) =>
              setCloneData({ ...cloneData, name: e.target.value })
            }
            className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />

          {/* Collection Select */}
          <select
            value={cloneData.collectionId}
            onChange={(e) =>
              setCloneData({ ...cloneData, collectionId: e.target.value })
            }
            className="bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          >
            <option value="">Select Collection</option>
            {apiToolState.collections.map((collection) => (
              <option key={collection._id} value={collection._id}>
                {collection.name}
              </option>
            ))}
          </select>

        </div>

        <button
          onClick={handleClone}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm font-medium transition"
        >
          Clone API
        </button>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
)};



// api tool main
export default function ApiTools() {
  const [createCollectionShowModal, setCreateCollectionShowModal] = useState(false);

  return (
    <div className="flex" style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
      <Sidebar setShowModal={setCreateCollectionShowModal}/>
      <ApiContext/>
      <CreateCollection
        showModal={createCollectionShowModal}
        setShowModal={setCreateCollectionShowModal}
      />
      <CloneApiModal/>
    </div>
  );
}