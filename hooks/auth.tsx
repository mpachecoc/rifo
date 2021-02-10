import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect
} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { useRouter } from 'next/router'
import { decode } from 'jsonwebtoken'

interface User {
  id: number
  name: string
  email: string
  phone: number
}

interface AuthState {
  token: string
  user: User
}

interface SignInCredentials {
  email: string
  password: string
}

interface TokenPayload {
  exp: number
}

interface AuthContextData {
  user: User
  signIn(credentials: SignInCredentials): Promise<void>
  signOut(): void
  setVerifyToken(verifyToken: boolean): void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState)
  const [verifyToken, setVerifyToken] = useState(false)

  const router = useRouter()

  // Check Session
  useEffect(() => {
    if (verifyToken) {
      const token = localStorage.getItem('@Rifo:token')
      const user = localStorage.getItem('@Rifo:user')

      if (!token || !user) {
        router.push('/')
        return
      }

      const { exp } = decode(token) as TokenPayload

      if (exp < Date.now() / 1000) {
        router.push('/')
        return
      }

      setData({ token, user: JSON.parse(user) })
    }
  }, [verifyToken])

  // SignIn
  const signIn = useCallback(async ({ email, password }) => {
    const response = await axios.post('/api/sessions', {
      email,
      password
    })

    const { token, user } = response.data

    localStorage.setItem('@Rifo:token', token)
    localStorage.setItem('@Rifo:user', JSON.stringify(user))

    // api.defaults.headers.authorization = `Bearer ${token}`

    setData({ token, user })
  }, [])

  // SignOut
  const signOut = useCallback(() => {
    localStorage.removeItem('@Rifo:token')
    localStorage.removeItem('@Rifo:user')

    setData({} as AuthState)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        signIn,
        signOut,
        setVerifyToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export function useAuth(): AuthContextData {
  return useContext(AuthContext)
}
