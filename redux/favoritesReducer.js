import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    pets: [],
}

export const favoriteSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addToFavs: (state, action) => {
            state.pets.push(action.payload);
        },
        removeFromFavs: (state, action) => {
            state.pets = state.pets.filter(item => item.id !== action.payload);
        }
    },
})

export const { addToFavs, removeFromFavs } = favoriteSlice.actions

export default favoriteSlice.reducer