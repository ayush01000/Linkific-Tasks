import { useEffect } from "react";

export default function Modal({
  open,
  title,
  onClose,
  children,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function closeWithEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      closeWithEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        closeWithEscape,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id="modal-title">{title}</h2>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}