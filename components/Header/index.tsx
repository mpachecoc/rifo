import React, { useCallback } from 'react'
import { useRouter } from 'next/router'
import { FiPower, FiArrowLeft } from 'react-icons/fi'
import { FaHandPaper } from 'react-icons/fa'

import { useAuth } from '../../hooks/auth'
import styles from './Header.module.css'
import RifoLogo from '../../assets/logo-rifo.svg'

interface HeaderProps {
  extended?: boolean
}

const Header: React.FC<HeaderProps> = ({ extended = false }: HeaderProps) => {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleLogout = useCallback(() => {
    signOut()
    router.push('/')
  }, [])

  return (
    <div className={!extended ? styles.container : styles.containerExtended}>
      <header>
        <RifoLogo />

        <div className={styles.backButton}>
          <a onClick={() => router.back()}>
            <FiArrowLeft size={25} color="FFFFFF" />
            Atras
          </a>
        </div>

        {user && (
          <div className={styles.username}>
            <FaHandPaper size={16} color="ffd666" />
            <p>{user.name}</p>
            <button type="button" onClick={handleLogout}>
              <FiPower size={23} color="FFFFFF" />
            </button>
          </div>
        )}
      </header>
    </div>
  )
}

export default Header
