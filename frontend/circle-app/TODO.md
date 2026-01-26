# TODO: Fix User Data Persistence and Thread Display Issues

## Step 1: Fix localStorage Key Inconsistency

- [x] Update AuthProvider.tsx to use "currentUser" instead of "user" for localStorage key to match userSlice.ts

## Step 2: Sync AuthContext and Redux on Login

- [x] Update Login.tsx to dispatch setUser action to Redux store after successful login

## Step 3: Ensure Threads Include User Data

- [x] Modify fetchThreads in Home.tsx to map currentUser data to threads if user data is missing from API response

## Step 4: Handle User Data Persistence

- [x] Ensure user data is available immediately after login in both AuthContext and Redux without relying on API fetch in App.tsx
