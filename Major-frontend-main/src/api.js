import axios from "axios";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(
    "http://127.0.0.1:5000/predict",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};
