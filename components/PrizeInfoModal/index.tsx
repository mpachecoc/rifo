import React from 'react'

import styles from './PrizeInfoModal.module.css'
import CloseIcon from '../../assets/icons/close.svg'

interface PrizeModalProps {
  name: string
  description?: string
  imageUrl?: string
  displayModal: (value: boolean) => void
}

const PrizeInfoModal: React.FC<PrizeModalProps> = ({
  imageUrl,
  name,
  description,
  displayModal
}: PrizeModalProps) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <header>{imageUrl && <img src={imageUrl} alt={name} />}</header>

        <strong>{name}</strong>
        <p>{description}</p>

        <button
          type="button"
          className={styles.closeModalButton}
          onClick={() => displayModal(false)}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}

export default PrizeInfoModal
