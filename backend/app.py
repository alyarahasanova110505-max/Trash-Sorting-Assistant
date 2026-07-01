import os
import json
import numpy as np
import tensorflow as tf

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image


app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnetb0 trash dataset 3 finetuned model.keras")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "models", "class_names.json")

IMG_SIZE = (224, 224)

model = None
class_names = None


BIN_ADVICE = {
    "cardboard": {
        "bin": "Paper / cardboard bin",
        "advice": "Throw this item in the paper or cardboard recycling bin if it is clean and dry."
    },
    "paper": {
        "bin": "Paper bin",
        "advice": "Throw this item in the paper recycling bin if it is clean and not greasy."
    },
    "plastic": {
        "bin": "Plastic / PMD bin",
        "advice": "Throw this item in the plastic or PMD bin if your local recycling rules allow it."
    },
    "glass": {
        "bin": "Glass bin",
        "advice": "Throw this item in the glass recycling bin. Remove caps or lids if needed."
    },
    "metal": {
        "bin": "Metal / PMD bin",
        "advice": "Throw this item in the metal or PMD recycling bin if your local rules allow it."
    }
}


def load_model_and_classes():
    global model, class_names

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

    if not os.path.exists(CLASS_NAMES_PATH):
        raise FileNotFoundError(f"Class names file not found: {CLASS_NAMES_PATH}")

    model = tf.keras.models.load_model(MODEL_PATH, compile=False)

    with open(CLASS_NAMES_PATH, "r") as f:
        class_names = json.load(f)

    print("Model loaded successfully.")
    print("Classes:", class_names)


def prepare_image(image_file):
    """
    This preprocessing must match your notebook:
    - RGB image
    - resize with padding
    - 224x224
    - float32
    - pixel values stay between 0 and 255
    """

    image = Image.open(image_file).convert("RGB")
    image_array = np.array(image)

    image_tensor = tf.convert_to_tensor(image_array)
    image_tensor = tf.image.resize_with_pad(
        image_tensor,
        IMG_SIZE[0],
        IMG_SIZE[1]
    )

    image_tensor = tf.cast(image_tensor, tf.float32)
    image_batch = tf.expand_dims(image_tensor, axis=0)

    return image_batch


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Trash Sorting Assistant backend is running."
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None or class_names is None:
        return jsonify({
            "error": "Model is not loaded."
        }), 500

    if "image" not in request.files:
        return jsonify({
            "error": "No image was uploaded. Please send an image file with the key 'image'."
        }), 400

    image_file = request.files["image"]

    try:
        image_batch = prepare_image(image_file)

        predictions = model.predict(image_batch)
        probabilities = predictions[0]

        predicted_index = int(np.argmax(probabilities))
        predicted_class = class_names[predicted_index]
        confidence = float(probabilities[predicted_index] * 100)

        sorted_probabilities = sorted(probabilities, reverse=True)

        highest_confidence = float(sorted_probabilities[0] * 100)
        second_highest_confidence = float(sorted_probabilities[1] * 100)

        confidence_difference = highest_confidence - second_highest_confidence

        is_uncertain = confidence < 70 or confidence_difference < 15

        if confidence < 50:
            warning_message = (
                "The model is very unsure about this prediction. "
                "Please do not rely only on this result and double-check the correct bin."
            )
        elif is_uncertain:
            warning_message = (
                "The model is not fully sure about this prediction. "
                "Please double-check the item before throwing it away."
            )
        else:
            warning_message = ""


        all_predictions = []

        for index, class_name in enumerate(class_names):
            all_predictions.append({
                "className": class_name,
                "confidence": round(float(probabilities[index] * 100), 2)
            })

        bin_info = BIN_ADVICE.get(predicted_class, {
            "bin": "Unknown bin",
            "advice": "No bin advice available for this category."
        })

        return jsonify({
            "predictedClass": predicted_class,
            "confidence": round(confidence, 2),
            "recommendedBin": bin_info["bin"],
            "advice": bin_info["advice"],
            "allPredictions": all_predictions,
            "isUncertain": is_uncertain,
            "warningMessage": warning_message,
            "confidenceDifference": round(confidence_difference, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    load_model_and_classes()
    app.run(debug=True, host="127.0.0.1", port=5000)