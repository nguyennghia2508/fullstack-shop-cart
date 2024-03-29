import { createSlice } from '@reduxjs/toolkit'

const initialState =  { value: {
    "infoProduct":[],
    "totalPrice":0,
    "totalNumber":0
  } 
}

export const useCartSlice = createSlice({
  name: 'userCart',
  initialState,
  reducers: {
    setUserCart: (state, action) => {
      state.value = action.payload
    },
    resetUserCart: (state) => {
      state.value = initialState.value;
    },
  }
})

export const { setUserCart,resetUserCart } = useCartSlice.actions

export default useCartSlice.reducer