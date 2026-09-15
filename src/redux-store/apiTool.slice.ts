import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiDocumentWithOptionalId, ApiWithOptionalId, CollectionWithId } from "../app/api-tools/page";

interface ApiToolState {
  stateApis: ApiDocumentWithOptionalId[];
  collections: CollectionWithId[];
  shouldFetchApis: boolean,
  cloneApiShowModel: boolean,
  cloneApiId: string
}

const initialState: ApiToolState = {
  stateApis: [],
  collections: [],
  shouldFetchApis: false,
  cloneApiShowModel: false,
  cloneApiId: ''
};

const apiToolSlice = createSlice({
  name: "apitool",
  initialState,
  reducers: {
    updateCollections: (state, action: PayloadAction<{ collections: CollectionWithId[] }>) => {
      state.collections = action.payload.collections;
    },
    renameCollection: (state, action: PayloadAction<{ id: string; newName: string }>) => {
      const { id, newName } = action.payload;
      const collection = state.collections.find(c => c._id === id);
      if (collection) {
        collection.name = newName;
      }
    },
    deleteCollection: (state, action: PayloadAction<{ id: string }>) => {
      state.collections = state.collections.filter(c => c._id !== action.payload.id);
    },
    // apis 
    removeStateApi: (state, action: PayloadAction<{index: number}>) => {
      state.stateApis = state.stateApis.filter((_, i) => i !== action.payload.index);
    },
    removeStateApiById: (state, action: PayloadAction<{id: string}>) => {
      state.stateApis = state.stateApis.filter((api) => api._id !== action.payload.id);
    },
    updateStateApis: (
      state,
      action: PayloadAction<{
        activeIndex: number;
        activeApiId: string;
        data: ApiDocumentWithOptionalId;}>
      ) => {
        if (action.payload.activeApiId) {
          state.stateApis = state.stateApis.map((api) =>
            api._id === action.payload.activeApiId ? action.payload.data : api
          );
        } 
        else if(action.payload.activeIndex >= 0) {
          const updated = [...state.stateApis];
          updated[action.payload.activeIndex] = action.payload.data;
          state.stateApis = updated;
        }
        else{
          state.stateApis = [...state.stateApis, action.payload.data]
        }
    },
    updateStateApi: (
      state,
      action: PayloadAction<{
        activeIndex: number;
        updates: Partial<ApiDocumentWithOptionalId>;
      }>
    ) => {
      const { activeIndex, updates } = action.payload;

      const current = state.stateApis[activeIndex];

      state.stateApis[activeIndex] = {
        ...current,
        ...updates,

        apiData: updates.apiData
          ? {
              ...current.apiData,
              ...updates.apiData,
            }
          : current.apiData,

        apisData: updates.apisData ?? current.apisData,
      };
    },
  updateShouldFetchApis: (state, action: PayloadAction<{value: boolean}>) => { 
    state.shouldFetchApis = action.payload.value
  },
  updateCloneApiFields: (state, action: PayloadAction<{status: boolean, id: string}>) => {
    state.cloneApiId = action.payload.id;
    state.cloneApiShowModel = action.payload.status
  }
}
});

export const { updateCollections, renameCollection, deleteCollection, removeStateApi, updateStateApis, updateStateApi, removeStateApiById, updateShouldFetchApis, updateCloneApiFields } = apiToolSlice.actions;
export default apiToolSlice.reducer;