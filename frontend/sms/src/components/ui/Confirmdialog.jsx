import ConfirmDialog from "../components/ui/ConfirmDialog";

const [confirmOpen, setConfirmOpen] = useState(false);

<ConfirmDialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={() => handleDelete(selectedId)}
  title="Delete Student?"
  message="This will permanently remove the student record."
  confirmText="Delete"
  severity="error"
/>