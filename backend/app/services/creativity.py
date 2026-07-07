import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, List, Tuple


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


def validate_dataframe(df: pd.DataFrame) -> Tuple[bool, str]:
    """验证上传的Excel数据格式"""
    required_columns = ['Product ID'] + DIMENSION_COLUMNS
    missing = [c for c in required_columns if c not in df.columns]
    if missing:
        return False, f"缺少必要列: {', '.join(missing)}"

    # 检查数值列是否为数值类型
    for col in DIMENSION_COLUMNS:
        if not pd.api.types.is_numeric_dtype(df[col]):
            return False, f"列 '{col}' 包含非数值数据"

    # 检查 Product ID 是否有空值
    if df['Product ID'].isna().all():
        return False, "Product ID 列全部为空"

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
    """检查评论是否有效（与原代码逻辑一致）"""
    if not comment or comment.strip() in {'无', '暂无', '还行', '还不错', '非常不错', '', 'nan', 'None', 'none'}:
        return False
    relevant_keywords = {'博物馆', '文创', '产品', '设计', '文化'}
    if not any(keyword in comment.lower() for keyword in relevant_keywords):
        return False
    return True


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
