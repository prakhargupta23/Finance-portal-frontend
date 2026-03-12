import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { IconButton } from "@mui/material";
import axios from "axios";

export default function WhatsAppButton() {
  const sendWhatsApp = async () => {
    await axios.post("/api/whatsapp/send", {
      phone: "917800752003", // individual user
      message: "Hi 👋"
    });
  };

  return (
    <IconButton onClick={sendWhatsApp} color="success">
      <WhatsAppIcon fontSize="large" />
    </IconButton>
  );
}
