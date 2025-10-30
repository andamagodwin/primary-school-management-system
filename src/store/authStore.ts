import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite'
import { ID, Query } from 'appwrite'
import type { Models } from 'appwrite'

export interface User {
  $id: string
  userId: string
  email: string
  fullName: string
  userType: 'admin' | 'teacher' | 'staff' | 'parent'
  phoneNumber?: string
  status: 'active' | 'inactive' | 'suspended'
  avatar?: string
  employeeId?: string
  dateJoined: string
  lastLogin?: string
}

interface AuthState {
  user: User | null
  session: Models.Session | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, userType: 'admin' | 'teacher' | 'staff' | 'parent') => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          
          // Check for existing session and delete it first
          try {
            await account.deleteSession('current')
          } catch {
            // No existing session, continue
          }
          
          // Create session
          const session = await account.createEmailPasswordSession(email, password)
          
          // Get account details
          const accountDetails = await account.get()
          
          // Get user from database using proper Query syntax
          const userDoc = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('userId', accountDetails.$id)]
          )

          if (userDoc.documents.length === 0) {
            throw new Error('User profile not found')
          }

          const user = userDoc.documents[0] as unknown as User

          // Update last login
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            { lastLogin: new Date().toISOString() }
          )

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, name: string, userType: 'admin' | 'teacher' | 'staff' | 'parent') => {
        try {
          set({ isLoading: true })

          // Check for existing session and delete it first
          try {
            await account.deleteSession('current')
          } catch {
            // No existing session, continue
          }

          // Create account
          const accountData = await account.create(
            ID.unique(),
            email,
            password,
            name
          )

          // Create session automatically after registration
          await account.createEmailPasswordSession(email, password)

          // Create user profile in database
          const userProfile = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            ID.unique(),
            {
              userId: accountData.$id,
              email: accountData.email,
              fullName: name,
              userType,
              status: 'active',
              dateJoined: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            }
          )

          const session = await account.getSession('current')

          set({
            user: userProfile as unknown as User,
            session,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await account.deleteSession('current')
          set({
            user: null,
            session: null,
            isAuthenticated: false
          })
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            user: null,
            session: null,
            isAuthenticated: false
          })
          throw error
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true })
          
          // Check if session exists
          const session = await account.getSession('current')
          const accountDetails = await account.get()

          // Get user from database using proper Query syntax
          const userDoc = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal('userId', accountDetails.$id)]
          )

          if (userDoc.documents.length > 0) {
            const user = userDoc.documents[0] as unknown as User
            set({
              user,
              session,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            // Session exists but no user profile
            await account.deleteSession('current')
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch {
          // No valid session
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      updateUserProfile: async (userId: string, data: Partial<User>) => {
        const updatedUser = await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          data
        )

        set({ user: updatedUser as unknown as User })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
