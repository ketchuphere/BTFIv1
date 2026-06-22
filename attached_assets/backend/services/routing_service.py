from ml.inference import generate_diversion


class RoutingService:
    def generate(self, event_data: dict) -> dict:
        return generate_diversion(event_data)

