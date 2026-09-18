"""
SaveSmart Gemini Explanation Service.
Connects verified deterministic engine results to the Google Gemini API.
Protected by the Hallucination Firewall and automated Fallback Explainer.
"""
import json
import logging
from typing import Any, Dict, Optional, Tuple

from app.core.config import settings
from app.schemas.explanation import AIExplanationStructured
from app.services.fallback_explainer import FallbackExplainer
from app.services.hallucination_firewall import HallucinationFirewall

logger = logging.getLogger("savesmart.gemini")

SYSTEM_INSTRUCTION = """You are the SaveSmart Financial Resilience Explanation Engine.
Your ONLY role is to explain verified financial simulation results in clear, accessible natural language.

STRICT ARCHITECTURAL RULES:
1. DO NOT calculate, modify, or invent ANY financial numbers, dates, months, percentages, or resilience scores.
2. Use ONLY the numbers and facts provided in the supplied verified financial context.
3. If a requested detail or fact is not present in the data, state that it is unavailable.
4. DO NOT provide investment advice, asset recommendations (e.g. stocks, mutual funds, crypto, bonds), or loan solicitations.
5. Explain the mathematical cause-and-effect relationships: how income disruptions or expense shocks deplete emergency buffers, force monthly contribution cuts, and cause deadline slippages.
6. Provide output strictly matching the requested JSON schema.
"""


class GeminiExplainerService:
    """
    Dedicated explanation service connecting verified simulation outputs to Gemini.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key if api_key is not None else settings.GEMINI_API_KEY
        self.model = model if model is not None else settings.GEMINI_MODEL

    def is_configured(self) -> bool:
        """Returns True if a Gemini API key is configured."""
        return bool(self.api_key and self.api_key.strip())

    async def explain_scenario(
        self,
        explanation_type: str,
        verified_context: Dict[str, Any],
        custom_question: Optional[str] = None,
    ) -> Tuple[AIExplanationStructured, bool, str]:
        """
        Explains a verified financial scenario.
        Returns: (explanation: AIExplanationStructured, is_fallback: bool, model_used: str)
        """
        # If API key is not configured, safely return deterministic fallback explanation
        if not self.is_configured():
            logger.info("Gemini API key not configured. Using deterministic fallback explanation engine.")
            fallback = FallbackExplainer.generate_explanation(
                explanation_type, verified_context, custom_question
            )
            return fallback, True, "deterministic_fallback"

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)

            # Build prompt with verified context
            prompt_data = {
                "explanation_type": explanation_type,
                "verified_financial_context": verified_context,
            }
            if custom_question:
                prompt_data["user_question"] = custom_question

            prompt_str = (
                f"Explain the following verified financial simulation results.\n"
                f"Strictly adhere to the provided numbers. Do not alter any figures.\n\n"
                f"{json.dumps(prompt_data, indent=2, default=str)}"
            )

            # Call Gemini via official Google GenAI SDK with structured output schema
            response = client.models.generate_content(
                model=self.model,
                contents=prompt_str,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=AIExplanationStructured,
                    temperature=0.1,
                ),
            )

            response_text = response.text if hasattr(response, "text") else ""
            if not response_text:
                raise ValueError("Empty response text from Gemini API")

            # Parse response into structured schema
            explanation_data = json.loads(response_text)
            explanation = AIExplanationStructured(**explanation_data)

            # Run through the Hallucination Firewall
            is_valid, violations = HallucinationFirewall.validate(explanation, verified_context)
            if not is_valid:
                logger.warning(
                    f"Hallucination Firewall tripped for Gemini response. Reasons: {violations}. "
                    f"Falling back to deterministic explanation."
                )
                fallback = FallbackExplainer.generate_explanation(
                    explanation_type, verified_context, custom_question
                )
                return fallback, True, "deterministic_fallback (firewall_intercepted)"

            # Validated successfully
            return explanation, False, self.model

        except Exception as exc:
            # Handle timeout, network, schema, or API failure without breaking financial analysis
            logger.warning(
                f"Gemini Explanation generation failed: {type(exc).__name__}: {str(exc)}. "
                f"Returning deterministic fallback explanation."
            )
            fallback = FallbackExplainer.generate_explanation(
                explanation_type, verified_context, custom_question
            )
            return fallback, True, "deterministic_fallback"


# Global singleton instance
gemini_service = GeminiExplainerService()
