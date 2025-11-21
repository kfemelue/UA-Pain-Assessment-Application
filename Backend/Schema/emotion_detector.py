from feat import Detector
from feat.utils.io import read_feat


class EmotionPredictor:
    def __init__(self, video_file_path, data_type, frame_rate, face_detection_threshold):
        self.video = video_file_path
        self.data_type = data_type
        self.frame_rate = frame_rate
        self.face_detection_threshold = face_detection_threshold
        self.video_detector = Detector().detect(self.video, data_type=self.data_type, skip_frames=self.frame_rate,
                                                face_detection_threshold=self.face_detection_threshold)

    def get_predictions_df(self):
        return self.video_detector

    def get_emotions_json(self):
        predictions = self.get_predictions_df()
        emotions_json = (predictions[["anger", "disgust", "fear", "happiness", "sadness", "surprise", "neutral"]]
                         .to_json())
        return emotions_json

    def get_emotions_by_frame(self, frame):
        predictions = self.get_predictions_df()
        for_frame = (predictions.iloc[[frame-1]][["anger", "disgust", "fear", "happiness", "sadness", "surprise",
                                                  "neutral"]]
                     .to_json())
        return for_frame

    def get_top_emotions_avg(self):
        predictions = self.get_predictions_df()
        emotions = predictions[["anger", "disgust", "fear", "happiness", "sadness", "surprise", "neutral"]]
        avg_emotions = emotions.mean()
        return avg_emotions

    def get_top_three_emotions_avg(self):
        avg_emotions = self.get_top_emotions_avg()
        top_three_emotions = avg_emotions.nlargest(3)
        return top_three_emotions
