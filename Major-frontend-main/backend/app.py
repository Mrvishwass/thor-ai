from flask import Flask, request, jsonify
from flask_cors import CORS
import onnxruntime as ort
import numpy as np
from PIL import Image
from torchvision import transforms

app = Flask(__name__)
CORS(app)  # Allow frontend to call backend

# Load ONNX model
session = ort.InferenceSession("chest_xray_model.onnx")

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

classes = ["Normal", "Pneumonia", "Covid", "Other"]

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    img = Image.open(file).convert("RGB")
    img_tensor = preprocess(img).unsqueeze(0).numpy()

    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: img_tensor})
    predicted_index = int(np.argmax(outputs[0], axis=1)[0])
    prediction = classes[predicted_index]

    highlights = []
    if prediction != "Normal":
        highlights = [
            {"x": 50, "y": 60, "width": 120, "height": 100},
            {"x": 180, "y": 140, "width": 80, "height": 60}
        ]

    return jsonify({"prediction": prediction, "highlights": highlights})

if __name__ == "__main__":
    app.run(debug=True)
