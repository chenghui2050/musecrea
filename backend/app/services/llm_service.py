from openai import OpenAI
from typing import Dict, List, Optional
from app.config import settings


_client = None


def get_llm_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=settings.DASHSCOPE_API_KEY,
            base_url=settings.DASHSCOPE_BASE_URL,
        )
    return _client


SYSTEM_PROMPT = """你是一个专业的博物馆文创产品评价分析师。你将收到关于某个文创产品的用户评论和量化评分，请基于以下五个维度进行深入分析：

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


def analyze_comments(
    comments: List[str],
    product_id: str,
    dimension_scores: Optional[Dict[str, float]] = None,
) -> Dict[str, str]:
    """
    调用通义千问API分析产品评论，返回五维度分析报告。
    """
    combined_comments = '\n'.join(comments)

    # 构建用户消息，附带维度得分信息帮助LLM更精准分析
    score_context = ""
    lowest_dims_context = ""
    zh_map = {
        'Novelty': '新颖性',
        'Usefulness': '有用性',
        'Affect': '情感性',
        'Aesthetics': '设计美学',
        'Cultural Values': '文化价值',
    }

    if dimension_scores:
        score_lines = []
        for dim, score in dimension_scores.items():
            zh_name = zh_map.get(dim, dim)
            score_lines.append(f"- {zh_name}: {score:.2f}")
        score_context = f"\n\n该产品的各维度量化评分如下（供参考）：\n" + '\n'.join(score_lines)

        # 找出得分最低的两个维度
        sorted_dims = sorted(dimension_scores.items(), key=lambda x: x[1])
        lowest_two = sorted_dims[:2] if len(sorted_dims) >= 2 else sorted_dims
        lowest_names = [zh_map.get(d, d) for d, _ in lowest_two]
        lowest_dims_context = f"\n\n⚠️ 该产品得分最低的两个维度是「{'」和「'.join(lowest_names)}」，请在「综合改进建议」和「关键行动」中重点围绕这两个维度提出具体建议。"

    user_message = (
        f"以下是用户对产品 {product_id} 的评论（共{len(comments)}条）：\n\n"
        f"{combined_comments}"
        f"{score_context}"
        f"{lowest_dims_context}\n\n"
        f"请严格按照指定格式生成完整的五维度分析报告。"
    )

    client = get_llm_client()

    try:
        completion = client.chat.completions.create(
            model=settings.DASHSCOPE_MODEL,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_message},
            ],
            max_tokens=3000,
            temperature=0.7,
            top_p=0.9,
        )
        response_content = completion.choices[0].message.content.strip()

        # 后处理：过滤LLM的对话性文字
        import re
        # 移除常见的LLM对话性文字
        patterns_to_remove = [
            r'如需进一步输出.*?可随时为您生成[。""]?',
            r'如果您需要.*?请告诉我[。""]?',
            r'希望以上分析.*?有所帮助[。""]?',
            r'如需更多.*?随时告知[。""]?',
            r'以上是基于.*?分析报告[。""]?',
        ]
        for pattern in patterns_to_remove:
            response_content = re.sub(pattern, '', response_content, flags=re.DOTALL)
        # 清理多余空行
        response_content = re.sub(r'\n{3,}', '\n\n', response_content).strip()

        # 分离分析和改进建议
        analysis = response_content
        suggestions = ""
        if "## 综合改进建议" in response_content:
            parts = response_content.split("## 综合改进建议")
            analysis = parts[0].strip()
            suggestions = parts[1].strip() if len(parts) > 1 else ""

        return {
            'analysis': analysis,
            'suggestions': suggestions,
            'full_response': response_content,
        }

    except Exception as e:
        raise Exception(f"调用通义千问API失败: {str(e)}")


def analyze_comments_batch(
    product_comments: Dict[str, List[str]],
    dimension_scores: Optional[Dict[str, Dict[str, float]]] = None,
) -> Dict[str, Dict[str, str]]:
    """批量分析多个产品的评论（并行调用LLM）"""
    from concurrent.futures import ThreadPoolExecutor, as_completed

    def _analyze_one(product_id, comments):
        scores = None
        if dimension_scores and product_id in dimension_scores:
            scores = dimension_scores[product_id]
        try:
            return product_id, analyze_comments(comments, product_id, scores)
        except Exception as e:
            return product_id, {
                'analysis': f'分析失败: {str(e)}',
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
