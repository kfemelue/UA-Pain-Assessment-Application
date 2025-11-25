from Schemas.emotion_detector import EmotionPredictor
import base64


async def get_predictions_from_image(img_path):
    prediction = EmotionPredictor(img_path, "image")
    return prediction


async def decode_image(encoded_image):
    if "base64," in encoded_image:
        encoded_image = encoded_image.split("base64,")[1]
    else:
        encoded_image = encoded_image

    image_data = base64.b64decode(encoded_image)
    with open("temp.jpeg", "wb") as image_file:
        image_file.write(image_data)
