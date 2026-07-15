from fastapi import Request

# ---------------------------------------------------------------------------
# Message catalogue
# ---------------------------------------------------------------------------
# Each key maps to a tuple: (Chinese, English)
# Use {} placeholders for positional format arguments.

MESSAGES = {
    # Auth
    'auth.unauthorized': ('未授权', 'Unauthorized'),
    'auth.invalid_credentials': ('无效的认证凭据', 'Invalid authentication credentials'),
    'auth.username_taken': ('用户名已被注册', 'Username already taken'),
    'auth.email_taken': ('邮箱已被注册', 'Email already registered'),
    'auth.wrong_credentials': ('用户名或密码错误', 'Invalid username or password'),
    'auth.account_disabled': ('账号已被禁用', 'Account has been disabled'),
    'auth.admin_required': ('需要管理员权限', 'Admin privileges required'),
    'auth.reset_email_sent': ('如果该邮箱已注册，重置密码链接已发送', 'If the email is registered, a password reset link has been sent'),
    'auth.invalid_reset_token': ('重置链接无效或已过期', 'Reset link is invalid or expired'),
    'auth.password_too_short': ('密码至少需要6个字符', 'Password must be at least 6 characters'),
    'auth.password_reset_ok': ('密码重置成功', 'Password reset successful'),

    # Admin
    'admin.password_reset_ok': ('用户密码已重置', 'User password has been reset'),

    # Upload
    'upload.file_too_large': ('文件大小超过限制 ({}MB)', 'File size exceeds limit ({}MB)'),
    'upload.unsupported_format': ('仅支持 .xlsx, .xls, .csv 格式', 'Only .xlsx, .xls, .csv formats supported'),
    'upload.read_error': ('无法读取文件: {}', 'Cannot read file: {}'),
    'upload.product_not_found': ('产品不存在', 'Product not found'),
    'upload.image_too_large': ('图片大小不能超过5MB', 'Image size cannot exceed 5MB'),
    'upload.unsupported_image': ('仅支持 JPG/PNG/WEBP 格式', 'Only JPG/PNG/WEBP formats supported'),
    'upload.product_id_not_found': (
        "产品ID '{}' 不存在，请检查是否正确（注意大小写、下划线、横杠等是否遗漏或错误）",
        "Product ID '{}' not found. Please check for correct case, underscores, hyphens, etc.",
    ),
    'upload.image_not_found': ('图片不存在', 'Image not found'),

    # Evaluation
    'eval.upload_first': ('请先上传数据文件', 'Please upload data file first'),
    'eval.insufficient_credits': ('积分不足，需要 {} 次，当前余额 {} 次', 'Insufficient credits: need {} credits, current balance {} credits'),
    'eval.not_found': ('评价记录不存在', 'Evaluation record not found'),

    # Report
    'report.not_found': ('评价记录不存在', 'Evaluation record not found'),
    'report.batch_not_found': ('未找到评价记录', 'No evaluation records found'),
    'report.feedback_sent': ('反馈已发送，感谢您的评价！', 'Feedback sent, thank you!'),
    'report.feedback_send_failed': ('反馈发送失败，请稍后重试', 'Failed to send feedback, please try again later'),

    # Billing
    'billing.invalid_coupon': ('无效的优惠券码', 'Invalid coupon code'),
    'billing.coupon_max_reached': ('该优惠券已达到使用上限', 'This coupon has reached its usage limit'),
    'billing.coupon_expired': ('该优惠券已过期', 'This coupon has expired'),
    'billing.coupon_other_user': ('该优惠券已被其他用户使用', 'This coupon has been used by another user'),
    'billing.redeem_success': ('兑换成功！已获得 {} 次免费评价机会', 'Redeem successful! You received {} free evaluation credits'),

    # Admin
    'admin.user_not_found': ('用户不存在', 'User not found'),
    'admin.invalid_credits': ('发放次数必须大于0', 'Credit count must be greater than 0'),
    'admin.coupon_exists': ('优惠券码已存在', 'Coupon code already exists'),
    'admin.coupon_not_found': ('优惠券不存在', 'Coupon not found'),
    'admin.coupon_deleted': ('优惠券已删除', 'Coupon deleted'),

    # Creativity / Data validation
    'data.missing_columns': ('缺少必要列: {}', 'Missing required columns: {}'),
    'data.non_numeric': ("列 '{}' 包含非数值数据", "Column '{}' contains non-numeric data"),
    'data.empty_product_ids': ('Product ID 列全部为空', 'Product ID column is all empty'),
    'data.low_samples': (
        '产品 {} 样本数为 {}，低于建议的200份，结果可能不够准确。',
        'Product {} has {} samples, below recommended 200. Results may not be accurate.',
    ),
    'data.no_comments_col': (
        '数据中未检测到 Comments 列，将无法进行消费者评论分析。',
        'No Comments column detected. Consumer review analysis will not be available.',
    ),
    'data.no_valid_comments': (
        '未检测到有效评论（评论过短或与文创无关的将被过滤）。',
        'No valid comments detected (too short or irrelevant comments will be filtered).',
    ),

    # LLM
    'llm.api_failed': ('调用通义千问API失败: {}', 'LLM API call failed: {}'),
    'llm.analysis_failed': ('分析失败: {}', 'Analysis failed: {}'),
}

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------


def get_lang(request: Request) -> str:
    """Read the X-Lang header from the request; default to 'zh'."""
    return request.headers.get('X-Lang', 'zh')


# Alias exposed as a FastAPI dependency
get_request_lang = get_lang


def msg(key: str, lang: str = 'zh', *args) -> str:
    """Return the translated message for *key* in the requested language.

    Positional *args* are forwarded to ``str.format()`` so that callers can
    inject dynamic values into placeholders (``{}``).

    Falls back to the Chinese string when the key or language is not found.
    """
    entry = MESSAGES.get(key)
    if entry is None:
        return key  # Return the raw key as a last-resort fallback

    index = 0 if lang == 'zh' else 1
    template = entry[index]

    if args:
        try:
            return template.format(*args)
        except (IndexError, KeyError):
            # Graceful degradation if the number of placeholders mismatches
            return template

    return template
