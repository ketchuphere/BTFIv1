from ml.inference import predict_impact


class ImpactService:
    def predict(self, event_data: dict) -> dict:
        return predict_impact(event_data)

