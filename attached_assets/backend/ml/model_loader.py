from functools import lru_cache
from importlib import util
from pathlib import Path
from types import ModuleType


PIPELINE_PATH = Path(__file__).resolve().parents[2] / "ml_pipeline" / "event_impact_pipeline.py"


@lru_cache(maxsize=1)
def load_pipeline_module() -> ModuleType:
    spec = util.spec_from_file_location("btfi_event_impact_pipeline", PIPELINE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load pipeline module from {PIPELINE_PATH}")
    module = util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

