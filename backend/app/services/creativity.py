import re
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, List, Tuple
from app.core.i18n import msg


# 五维度列名映射（与原代码一致）
DIMENSION_COLUMNS = ['Novelty', 'Usefulness', 'Affect', 'Aesthetics', 'Cultural Values']

DIMENSION_LABELS_ZH = {
    'Novelty': '新颖度',
    'Usefulness': '有用性',
    'Affect': '情感性',
    'Aesthetics': '设计美学',
    'Cultural Values': '文化价值',
}

DIMENSION_LABELS_EN = {
    'Novelty': 'Novelty',
    'Usefulness': 'Usefulness',
    'Affect': 'Affect',
    'Aesthetics': 'Aesthetics',
    'Cultural Values': 'Cultural Values',
}


def validate_dataframe(df: pd.DataFrame, lang: str = "zh") -> Tuple[bool, str]:
    """验证上传的Excel数据格式"""
    required_columns = ['Product ID'] + DIMENSION_COLUMNS
    missing = [c for c in required_columns if c not in df.columns]
    if missing:
        return False, msg("data.missing_columns", lang, ", ".join(missing))

    # 检查数值列是否为数值类型
    for col in DIMENSION_COLUMNS:
        if not pd.api.types.is_numeric_dtype(df[col]):
            return False, msg("data.non_numeric", lang, col)

    # 检查 Product ID 是否有空值
    if df['Product ID'].isna().all():
        return False, msg("data.empty_product_ids", lang)

    return True, "数据格式正确"


def extract_products(df: pd.DataFrame) -> Dict:
    """从DataFrame中提取产品信息和样本统计"""
    df = df.dropna(subset=['Product ID'])
    product_ids = df['Product ID'].unique().tolist()
    sample_counts = df.groupby('Product ID').size().to_dict()
    has_comments = 'Comments' in df.columns
    valid_comments_count = 0

    if has_comments:
        valid_comments_count = sum(
            1 for _, row in df.iterrows()
            if is_valid_comment(str(row.get('Comments', '')))
        )

    return {
        'products': product_ids,
        'sample_counts': sample_counts,
        'has_comments': has_comments,
        'valid_comments_count': valid_comments_count,
        'total_rows': len(df),
        'columns': df.columns.tolist(),
    }




def is_valid_comment(comment: str) -> bool:
    """检查评论是否有效（支持中英文）"""
    if not comment:
        return False
    stripped = comment.strip()
    # 空值 / 过短
    if stripped in {'无', '暂无', '还行', '还不错', '非常不错', '', 'nan', 'None', 'none',
                    'N/A', 'n/a', 'NA', 'na', '-', '--', 'null', 'NULL', 'ok', 'good', 'fine'}:
        return False
    if len(stripped) < 3:
        return False
    # 中英文关键词（任一命中即有效）
    relevant_keywords = {
        '博物馆', '文创', '产品', '设计', '文化', '展览', '艺术', '非遗', '国潮',
    }
    relevant_keywords_en = {
        'museum', 'cultural', 'creative', 'product', 'design', 'culture',
        'exhibit', 'art', 'heritage', 'craft', 'souvenir', 'collection',
        'gallery', 'historical', 'traditional', 'innovation', 'aesthetic',
    }
    lower = stripped.lower()
    if any(kw in lower for kw in relevant_keywords):
        return True
    if any(kw in lower for kw in relevant_keywords_en):
        return True
    # 如果评论足够长（>=15字符）且含有中文字符或英文单词，也视为有效
    if len(stripped) >= 15:
        if re.search(r'[\u4e00-\u9fff]', stripped):
            return True
        if len(stripped.split()) >= 4:
            return True
    return False


def detect_data_language(comments: Dict[str, List[str]]) -> str:
    """Detect whether the dataset comments are predominantly Chinese or English.

    Returns 'zh' or 'en'.
    """
    all_comments = []
    for cmts in comments.values():
        all_comments.extend(cmts)

    if not all_comments:
        return 'zh'  # default

    zh_count = 0
    en_count = 0
    for text in all_comments[:100]:  # sample up to 100
        cjk = len(re.findall(r'[\u4e00-\u9fff]', text))
        latin = len(re.findall(r'[a-zA-Z]', text))
        if cjk > latin:
            zh_count += 1
        elif latin > cjk:
            en_count += 1

    return 'en' if en_count > zh_count else 'zh'


def extract_comments(df: pd.DataFrame, product_ids: List[str] = None) -> Dict[str, List[str]]:
    """提取每个产品的有效评论"""
    product_comments = {}
    df = df.dropna(subset=['Product ID'])

    if product_ids:
        df = df[df['Product ID'].isin(product_ids)]

    if 'Comments' not in df.columns:
        return product_comments

    for _, row in df.iterrows():
        pid = str(row['Product ID'])
        comment = str(row['Comments'])
        if is_valid_comment(comment):
            if pid not in product_comments:
                product_comments[pid] = []
            product_comments[pid].append(comment)

    return product_comments


def calculate_creativity_scores(
    df: pd.DataFrame,
    selected_product_ids: List[str] = None,
) -> Dict[str, Dict]:
    """
    使用 Random Forest 计算产品创意度得分。
    完全沿用原始代码逻辑：
    - average_creativity = mean(5 dimensions)
    - RF(max_depth=10, n_estimators=100, random_state=42)
    - 按 Product ID 分组训练
    """
    df = df.dropna(subset=['Product ID']).copy()
    df['average_creativity'] = df[DIMENSION_COLUMNS].mean(axis=1)
    grouped = df.groupby('Product ID')

    results = {}

    for product_id, group in grouped:
        if selected_product_ids and str(product_id) not in [str(p) for p in selected_product_ids]:
            continue

        X = group[DIMENSION_COLUMNS].values
        y = group['average_creativity'].values

        # Random Forest 回归（参数与原始代码完全一致）
        rf = RandomForestRegressor(max_depth=10, n_estimators=100, random_state=42)
        rf.fit(X, y)
        predicted = rf.predict(X)
        final_score = float(predicted.mean())

        # 各维度均值
        dim_means = group[DIMENSION_COLUMNS].mean().to_dict()

        # 维度排名（从高到低）
        sorted_dims = sorted(dim_means.items(), key=lambda x: x[1], reverse=True)
        ranking = [d[0] for d in sorted_dims]

        results[str(product_id)] = {
            'creativity_score': round(final_score, 4),
            'dimension_scores': {k: round(v, 4) for k, v in dim_means.items()},
            'dimension_ranking': ranking,
            'dimension_ranking_zh': [DIMENSION_LABELS_ZH.get(d, d) for d in ranking],
            'sample_count': len(group),
            'feature_importance': dict(zip(DIMENSION_COLUMNS, [round(float(x), 4) for x in rf.feature_importances_])),
        }

    return results
