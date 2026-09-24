import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
  email: string | null;
  isAllowed: boolean;
  role: "user" | "administrator" | null,
  productAccess: Record<string, boolean>

}

const initialState: UserState = {
  name: null,
  email: null,
  isAllowed: false,
  role: "user",
  productAccess: {}
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ name: string; email: string; isAllowed: boolean, role: "user" | "administrator" | null, productAccess: Record<string, boolean>}>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isAllowed = action.payload.isAllowed;
      state.role = action.payload.role;
      state.productAccess = action.payload.productAccess
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.isAllowed = false;
      state.role = null
      state.productAccess = {}
    },
    setAllowance: (state, action: PayloadAction<{ isAllowed: boolean }>) => {
      state.isAllowed = action.payload.isAllowed;
    },
  },
});

export const { login, logout, setAllowance } = userSlice.actions;
export default userSlice.reducer;
