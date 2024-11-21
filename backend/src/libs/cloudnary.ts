import { v2 as cloudnary } from "cloudinary";
import valide from "../utils/valide";

cloudnary.config({
  cloud_name: valide.CLOUDARY_CLOUD_NAME,
  api_key: valide.CLOUDARY_API_KEY,
  api_secret: valide.CLOUDARY_API_SECRET,
});

export default cloudnary;
