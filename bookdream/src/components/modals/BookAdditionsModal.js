import { useScanBookModal } from "../../contexts/ScanModalContext";

function BookAdditionsModal({ isOpen, setIsOpen, position, onClose }) {
  const { openScanBookModal, setIsBulk } = useScanBookModal();

  const ScanBookClick = () => {
    setIsOpen(false);
    setIsBulk(false);
    openScanBookModal();
  };

  const BulkScanBookClick = () => {
    setIsOpen(false);
    setIsBulk(true);
    openScanBookModal();
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
