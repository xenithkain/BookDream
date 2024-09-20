import { useModal } from "../components/ScanModalContext";

function BookAdditionsModal({ isOpen, setIsOpen, position, onClose }) {
  const { openModal, setIsBulk } = useModal();

  const ScanBookClick = () => {
    setIsOpen(false);
    setIsBulk(false);
    openModal();
  };

  const BulkScanBookClick = () => {
    setIsOpen(false);
    setIsBulk(true);
    openModal();
  };

  if (!isOpen) return;

  return (
    <>
      <div
        className="BookAdditionsModalContainer"
        style={{ top: position.y, left: position.x }}
      >
        <div className="BookOptions">
          <button className="BookOptionsButton" onClick={ScanBookClick}>
            <p>Scan Book</p>
          </button>
          <button className="BookOptionsButton" onClick={BulkScanBookClick}>
            <p>Bulk Scan</p>
          </button>
          <button className="BookOptionsButton">
            <p>Search Book</p>
          </button>
          <button className="BookOptionsButton">
            <p>Manually Input Book</p>
          </button>
        </div>

        <button className="ModalClose" onClick={onClose}>
          X
        </button>
      </div>
    </>
  );
}
export default BookAdditionsModal;
