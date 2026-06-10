import React from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  open?: boolean
}

function Modal({ title, onClose, children, open = true }: ModalProps) {
  if (!open) return null
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}

export { Modal }
export default Modal