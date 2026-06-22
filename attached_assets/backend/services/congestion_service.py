from ml.inference import predict_congestion


class CongestionService:
    def predict(self, event_data: dict) -> dict:
        return predict_congestion(event_data)

