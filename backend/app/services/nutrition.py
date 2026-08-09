import json

import httpx

from app.config import settings

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

_RESPONSE_SCHEMA = {
    "type": "ARRAY",
    "items": {
        "type": "OBJECT",
        "properties": {
            "calories": {"type": "NUMBER"},
            "protein_g": {"type": "NUMBER"},
            "carbs_g": {"type": "NUMBER"},
            "fats_g": {"type": "NUMBER"},
        },
        "required": ["calories", "protein_g", "carbs_g", "fats_g"],
    },
}


class NutritionEstimationError(Exception):
    pass


def _build_prompt(items: list[tuple[str, float, str | None]]) -> str:
    lines = [
        "You are a nutrition estimation assistant. For each food item below, estimate "
        "its total calories (kcal), protein (g), carbs (g), and fat (g) for the FULL "
        "quantity given, not per single unit. Respond with realistic best-effort "
        "estimates even if the food is ambiguous. Return the results as a JSON array "
        "in the exact same order as the items below, with one object per item.",
        "",
    ]
    for i, (food_name, quantity, unit) in enumerate(items, start=1):
        unit_part = f" {unit}" if unit else ""
        lines.append(f"{i}. {food_name} | {quantity}{unit_part}")
    return "\n".join(lines)


async def estimate_nutrition(
    items: list[tuple[str, float, str | None]]
) -> list[dict[str, float]]:
    if not items:
        return []

    payload = {
        "contents": [{"parts": [{"text": _build_prompt(items)}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": _RESPONSE_SCHEMA,
        },
    }

    url = GEMINI_URL.format(model=settings.gemini_model)
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url, params={"key": settings.gemini_api_key}, json=payload
            )
    except httpx.HTTPError as exc:
        raise NutritionEstimationError(f"Failed to reach Gemini API: {exc}") from exc

    if response.status_code != 200:
        raise NutritionEstimationError(
            f"Gemini API returned {response.status_code}: {response.text}"
        )

    try:
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        results = json.loads(text)
    except (KeyError, IndexError, ValueError) as exc:
        raise NutritionEstimationError(f"Unexpected Gemini response shape: {exc}") from exc

    if not isinstance(results, list) or len(results) != len(items):
        raise NutritionEstimationError(
            f"Expected {len(items)} nutrition estimates, got {len(results) if isinstance(results, list) else 'non-list'}"
        )

    estimates: list[dict[str, float]] = []
    for result in results:
        try:
            estimates.append(
                {
                    "calories": max(0.0, float(result["calories"])),
                    "protein_g": max(0.0, float(result["protein_g"])),
                    "carbs_g": max(0.0, float(result["carbs_g"])),
                    "fats_g": max(0.0, float(result["fats_g"])),
                }
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise NutritionEstimationError(f"Malformed nutrition estimate: {result}") from exc

    return estimates
