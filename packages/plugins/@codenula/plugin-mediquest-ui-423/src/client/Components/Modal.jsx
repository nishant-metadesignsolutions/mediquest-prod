import closeButton from '../assets2/images/close.svg';
const Modal = ({ id, onClose, children, isOpen }) => {
  const closeModal = () => {
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}  id={id}>
      <div className="modal-bg modal-exit" onClick={closeModal}></div>
      <div className="modal-container">
        <button className="modal-close modal-exit" onClick={closeModal}>
          <img src={closeButton} alt="" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
