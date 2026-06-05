import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: 'auth',
    initialState: { 
        user: null, 
        token: null,
        refreshToken: null,
     },
    reducers: {
        setCredentials: (state, action) => {
            localStorage.setItem('user', JSON.stringify(action.payload.user))
            localStorage.setItem('token', action.payload.accessToken)
            localStorage.setItem('refreshToken', action.payload.refreshToken)
            state.user = action.payload.user
            state.token = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
        },
        setToken: (state, action) => {
            localStorage.setItem('token', action.payload.accessToken)
            state.token = action.payload.accessToken
        },
        logOut: (state, action) => {
            state.user = null
            state.token = null
            state.refreshToken = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
        },
       
    },
})

export const { setCredentials, logOut,setToken } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
