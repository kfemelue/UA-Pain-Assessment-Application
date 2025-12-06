from feat import Detector


class EmotionPredictor:
    def __init__(self, image_file_path, data_type):
        self.image = image_file_path
        self.data_type = data_type
        self.image_detector = Detector().detect(self.image, data_type=self.data_type)

    async def get_predictions_df(self):
        return self.image_detector

    async def get_emotions_dict(self):
        predictions = await self.get_predictions_df()
        emotions_dict = (predictions[["anger", "disgust", "fear", "happiness", "sadness", "surprise", "neutral"]]
                         .to_dict())
        return emotions_dict
