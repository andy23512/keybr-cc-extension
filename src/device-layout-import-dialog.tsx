import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";

interface DeviceLayoutImportDialogProps {
  open: boolean;
  initialName: string;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

const DeviceLayoutImportDialog = (props: DeviceLayoutImportDialogProps) => {
  const { open, initialName, onCancel, onSubmit } = props;
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    if (!name) {
      return;
    }
    onSubmit(name);
  }
  return (
    <Dialog
      onClose={onCancel}
      open={open}
      sx={{
        "& .MuiPaper-root": {
          width: "100%",
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle>Import Device Layout</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="import-layout-form">
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="name"
            label="Device Layout Name"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={initialName}
          ></TextField>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary">
          Cancel
        </Button>
        <Button type="submit" form="import-layout-form">
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceLayoutImportDialog;
