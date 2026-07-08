from openai import OpenAI
from typing import Dict, List, Optional
from app.config import settings
from app.core.i18n import msg


_client = None


def get_llm_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.DASHSCOPE_API_KEY,
            base_url=settings.DASHSCOPE_BASE_URL,
        )
    return _client


SYSTEM_PROMPT_ZH = """你是一个专业的博物馆文创产品评价分析师。你将收到关于某个文创产品的用户评论和量化评分，请基于以下五个维度进行深入分析：

1. 新颖性（Novelty）- 产品的创意独特性和创新程度
2. 有用性（Usefulness）- 产品的实用功能和使用价值
3. 情感性（Affect）- 产品引发的情感共鸣和文化认同感
4. 设计美学（Aesthetics）- 产品的视觉美感和工艺水准
5. 文化价值（Cultural Values）- 产品承载的文化内涵和传承价值

请注意：
- 分析要基于收到的实际评论数据，不要凭空臆测
- 对于评价较高的维度，肯定其优势并提出保持建议
- 对于评价较低的维度，重点分析不足原因并提出改进方向
- 使用专业但易懂的语言，避免过于学术化的表述
- 理解"国潮"、"非遗"、"IP联名"等博物馆文创领域的特定语境

【重要规则】
- 禁止在输出中出现"如需进一步输出"、"可随时为您生成"等面向用户的对话性文字
- 禁止在输出末尾添加任何与分析报告无关的内容
- 直接输出分析内容，不要有开场白或结束语
- 每个产品的报告格式必须完全一致

请严格按照以下格式输出：

## 新颖性
**用户看法总结：** ...
**改进建议：** ...

## 有用性
**用户看法总结：** ...
**改进建议：** ...

## 情感性
**用户看法总结：** ...
**改进建议：** ...

## 设计美学
**用户看法总结：** ...
**改进建议：** ...

## 文化价值
**用户看法总结：** ...
**改进建议：** ...

## 综合改进建议
（基于以上五个维度的分析，重点针对得分最低的两个维度，给出3-5条最重要的综合改进建议，每条建议需具体可操作）

▶️ 关键行动：
（列出2-3项最紧迫、最具影响力的具体行动项，明确优先级和执行方向，重点围绕得分最低的两个维度）"""

SYSTEM_PROMPT_EN = """You are a professional museum cultural-creative product evaluation analyst. You will receive user reviews and quantitative scores for a cultural-creative product. Please provide an in-depth analysis based on the following five dimensions:

1. Novelty - The creative uniqueness and innovativeness of the product
2. Usefulness - The practical functionality and utilitarian value of the product
3. Affect - The emotional resonance and cultural identification the product evokes
4. Aesthetics - The visual appeal and craftsmanship of the product
5. Cultural Values - The cultural significance and heritage value embodied in the product

Guidelines:
- Base your analysis strictly on the actual review data received; do not fabricate insights
- For high-scoring dimensions, acknowledge strengths and suggest ways to maintain them
- For low-scoring dimensions, analyze shortcomings in depth and propose improvement directions
- Use professional yet accessible language; avoid overly academic expressions

IMPORTANT RULES:
- Do NOT include any conversational text directed at the user (e.g., "Let me know if you need more", "I can provide further analysis")
- Do NOT add any content unrelated to the analysis report at the end
- Output the analysis directly — no opening remarks or closing statements
- The report format must be identical for every product

Please output strictly in the following format:

## Novelty
**User Perception Summary:** ...
**Improvement Suggestions:** ...

## Usefulness
**User Perception Summary:** ...
**Improvement Suggestions:** ...

## Affect
**User Perception Summary:** ...
**Improvement Suggestions:** ...

## Aesthetics
**User Perception Summary:** ...
**Improvement Suggestions:** ...

## Cultural Values
**User Perception Summary:** ...
**Improvement Suggestions:** ...

## Improvement Recommendations
(Based on the five-dimension analysis above, focus on the two lowest-scoring dimensions and provide 3-5 prioritized, actionable improvement suggestions)

▶️ Key Actions:
(List 2-3 most urgent and impactful action items with clear priorities and execution direction, focusing on the two lowest-scoring dimensions)"""

# Keep the old name as an alias
SYSTEM_PROMPT = SYSTEM_PROMPT_ZH


# Dimension label maps for each language
_DIM_LABELS = {
    'zh': {
        'Novelty': '新颖性', 'Usefulness': '有用性', 'Affect': '情感性',
        'Aesthetics': '设计美学', 'Cultural Values': '文化价值',
    },
    'en': {
        'Novelty': 'Novelty', 'Usefulness': 'Usefulness', 'Affect': 'Affect',
        'Aesthetics': 'Aesthetics', 'Cultural Values': 'Cultural Values',
    },
}

# Post-processing: heading used to split analysis from suggestions
_SPLIT_HEADING = {
    'zh': '## 综合改进建议',
    'en': '## Improvement Recommendations',
}

# Conversational filler patterns to strip
_FILLER_PATTERNS = {
    'zh': [
        r'如需进一步输出.*?可随时为您生成[。""]?',
        r'如果您需要.*?请告诉我[。""]?',
        r'希望以上分析.*?有所帮助[。""]?',
        r'如需更多.*?随时告知[。""]?',
        r'以上是基于.*?分析报告[。""]?',
    ],
    'en': [
        r'If you need further.*?let me know\.?',
        r'Please let me know.*?happy to help\.?',
        r'Hope this analysis.*?helpful\.?',
        r'Feel free to ask.*?more details\.?',
        r'The above is.*?analysis report\.?',
    ],
}


def _build_user_message(
    comments: List[str],
    product_id: str,
    dimension_scores: Optional[Dict[str, float]],
    lang: str,
) -> str:
    """Build the user message sent to the LLM, in the appropriate language."""
    combined_comments = '\n'.join(comments)
    dim_map = _DIM_LABELS.get(lang, _DIM_LABELS['zh'])
    score_context = ""
    lowest_dims_context = ""

    if dimension_scores:
        score_lines = []
        for dim, score in dimension_scores.items():
            label = dim_map.get(dim, dim)
            score_lines.append(f"- {label}: {score:.2f}")

        if lang == 'en':
            score_context = "\n\nQuantitative dimension scores for this product (for reference):\n" + '\n'.join(score_lines)
        else:
            score_context = "\n\n该产品的各维度量化评分如下（供参考）：\n" + '\n'.join(score_lines)

        # Identify the two lowest-scoring dimensions
        sorted_dims = sorted(dimension_scores.items(), key=lambda x: x[1])
        lowest_two = sorted_dims[:2] if len(sorted_dims) >= 2 else sorted_dims
        lowest_names = [dim_map.get(d, d) for d, _ in lowest_two]

        if lang == 'en':
            lowest_dims_context = (
                f"\n\n⚠️ The two lowest-scoring dimensions for this product are "
                f"'{lowest_names[0]}' and '{lowest_names[1]}'. "
                f"Please focus your 'Improvement Recommendations' and 'Key Actions' "
                f"on these two dimensions with specific, actionable suggestions."
            )
        else:
            lowest_dims_context = (
                f"\n\n⚠️ 该产品得分最低的两个维度是「{'」和「'.join(lowest_names)}」，"
                f"请在「综合改进建议」和「关键行动」中重点围绕这两个维度提出具体建议。"
            )

    if lang == 'en':
        user_message = (
            f"Below are user reviews for product {product_id} ({len(comments)} reviews in total):\n\n"
            f"{combined_comments}"
            f"{score_context}"
            f"{lowest_dims_context}\n\n"
            f"Please generate the complete five-dimension analysis report in the exact format specified."
        )
    else:
        user_message = (
            f"以下是用户对产品 {product_id} 的评论（共{len(comments)}条）：\n\n"
            f"{combined_comments}"
            f"{score_context}"
            f"{lowest_dims_context}\n\n"
            f"请严格按照指定格式生成完整的五维度分析报告。"
        )

    return user_message


def analyze_comments(
    comments: List[str],
    product_id: str,
    dimension_scores: Optional[Dict[str, float]] = None,
    lang: str = "zh",
) -> Dict[str, str]:
    """
    调用通义千问API分析产品评论，返回五维度分析报告。
    lang 控制分析输出语言：'zh' 中文，'en' 英文
    """
    # Select system prompt
    system_prompt = SYSTEM_PROMPT_EN if lang == 'en' else SYSTEM_PROMPT_ZH

    # Build user message
    user_message = _build_user_message(comments, product_id, dimension_scores, lang)

    client = get_llm_client()

    try:
        completion = client.chat.completions.create(
            model=settings.DASHSCOPE_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_message},
            ],
            max_tokens=3000,
            temperature=0.7,
            top_p=0.9,
        )
        response_content = completion.choices[0].message.content.strip()

        # 后处理：过滤LLM的对话性文字
        import re
        patterns = _FILLER_PATTERNS.get(lang, _FILLER_PATTERNS['zh'])
        for pattern in patterns:
            response_content = re.sub(pattern, '', response_content, flags=re.DOTALL)
        # 清理多余空行
        response_content = re.sub(r'\n{3,}', '\n\n', response_content).strip()

        # 分离分析和改进建议
        split_heading = _SPLIT_HEADING.get(lang, _SPLIT_HEADING['zh'])
        analysis = response_content
        suggestions = ""
        if split_heading in response_content:
            parts = response_content.split(split_heading)
            analysis = parts[0].strip()
            suggestions = parts[1].strip() if len(parts) > 1 else ""

        return {
            'analysis': analysis,
            'suggestions': suggestions,
            'full_response': response_content,
        }

    except Exception as e:
        raise Exception(msg("llm.api_failed", lang, str(e)))


def analyze_comments_batch(
    product_comments: Dict[str, List[str]],
    dimension_scores: Optional[Dict[str, Dict[str, float]]] = None,
    lang: str = "zh",
) -> Dict[str, Dict[str, str]]:
    """批量分析多个产品的评论（并行调用LLM）"""
    from concurrent.futures import ThreadPoolExecutor, as_completed

    def _analyze_one(product_id, comments):
        scores = None
        if dimension_scores and product_id in dimension_scores:
            scores = dimension_scores[product_id]
        try:
            return product_id, analyze_comments(comments, product_id, scores, lang)
        except Exception as e:
            return product_id, {
                'analysis': msg('llm.analysis_failed', lang, str(e)),
                'suggestions': '',
                'full_response': '',
                'error': str(e),
            }

    results = {}
    with ThreadPoolExecutor(max_workers=min(5, len(product_comments))) as executor:
        futures = {
            executor.submit(_analyze_one, pid, comments): pid
            for pid, comments in product_comments.items()
        }
        for future in as_completed(futures):
            pid, result = future.result()
            results[pid] = result
    return results


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text between Chinese and English using LLM, preserving markdown formatting.

    Args:
        text: The text to translate (may contain markdown)
        source_lang: Source language ('zh' or 'en')
        target_lang: Target language ('zh' or 'en')

    Returns:
        Translated text with markdown structure preserved.
    """
    if not text or not text.strip():
        return text
    if source_lang == target_lang:
        return text

    target_name = "English" if target_lang == "en" else "Chinese"
    source_name = "Chinese" if source_lang == "zh" else "English"

    system_prompt = (
        f"You are a professional translator specializing in museum and cultural product analysis. "
        f"Translate the following text from {source_name} to {target_name}. "
        f"IMPORTANT: Preserve ALL markdown formatting exactly as-is — headings (##), "
        f"bold (**text**), bullet points (-), numbered lists (1.), tables, and line breaks. "
        f"Do NOT add, remove, or rearrange any sections. Output ONLY the translated text, "
        f"no explanations or preamble."
    )

    client = get_llm_client()
    try:
        completion = client.chat.completions.create(
            model=settings.DASHSCOPE_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': text},
            ],
            max_tokens=4000,
            temperature=0.3,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Translation failed: {e}")
        return text  # Fall back to original text on failure
