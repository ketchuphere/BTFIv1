from ml.inference import optimize_resources


class OptimizationService:
    def optimize(self, event_data: dict) -> dict:
        return optimize_resources(event_data)

