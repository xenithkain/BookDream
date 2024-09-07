function BookOptionsModal ({ isOpen, position, onClose, isbn }) {
  if (!isOpen) return

  return (
    <>
      <div
        className='BookOptionsModalContainer'
        style={{ top: position.y, left: position.x }}
      >
        <div className='BookOptions'>
          <button className='BookOptionsButton'>
            <p>Delete Book</p>
          </button>
          <button className='BookOptionsButton'>
            <p>Edit Tags</p>
          </button>
        </div>

        <button className='ModalClose' onClick={onClose}>
          X
        </button>
      </div>
    </>
  )
}
export default BookOptionsModal
