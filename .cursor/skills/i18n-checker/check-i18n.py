#!/usr/bin/env python3
"""
i18n 翻译检查和清理脚本
自动检查翻译文件的完整性、一致性并清理未使用的 key
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict
import shutil

# 配置
CONFIG = {
    'locales_dir': 'src/i18n/locales',
    'languages': ['zh-CN', 'en-US'],
    'src_dir': 'src',
    'backup_suffix': '.backup',
    'excluded_short_values': {'是', '否', '确定', '取消', '保存', '删除', '编辑', '添加', '关闭', '打开'}
}

def flatten_dict(d, parent_key=''):
    """扁平化嵌套字典"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}.{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key).items())
        else:
            items.append((new_key, v))
    return dict(items)

def scan_used_keys(src_dir):
    """扫描代码中使用的翻译 key"""
    print('\n📁 扫描代码文件中的翻译使用...')
    
    used_keys = set()
    key_usage = defaultdict(list)
    dynamic_patterns = []
    
    # 匹配模式 - 支持带参数的调用
    patterns = [
        re.compile(r"\$t\('([^']+)'[,\)]"),  # $t('key') 或 $t('key', ...)
        re.compile(r'\$t\("([^"]+)"[,\)]'),   # $t("key") 或 $t("key", ...)
        re.compile(r"(?<![\w$])t\('([^']+)'[,\)]"),  # t('key') 或 t('key', ...)
        re.compile(r'(?<![\w$])t\("([^"]+)"[,\)]'),   # t("key") 或 t("key", ...)
        re.compile(r"i18n\.global\.t\('([^']+)'[,\)]"),  # i18n.global.t('key')
        re.compile(r'i18n\.global\.t\("([^"]+)"[,\)]'),   # i18n.global.t("key")
    ]
    
    # 动态构造的模式（模板字符串）
    dynamic_pattern = re.compile(r'[t$]\(`([^`$]+)\$\{[^}]+\}')  # t(`prefix.${var}`)
    
    # 扫描所有 .vue 和 .ts 文件
    for ext in ['**/*.vue', '**/*.ts']:
        for file_path in Path(src_dir).glob(ext):
            try:
                content = file_path.read_text(encoding='utf-8')
                rel_path = str(file_path.relative_to('.'))
                
                # 检测静态 key
                for pattern in patterns:
                    for match in pattern.finditer(content):
                        key = match.group(1)
                        used_keys.add(key)
                        key_usage[key].append(rel_path)
                
                # 检测动态构造的 key 模式
                for match in dynamic_pattern.finditer(content):
                    prefix = match.group(1)
                    dynamic_patterns.append({
                        'prefix': prefix,
                        'file': rel_path
                    })
            except Exception as e:
                print(f'  警告: 读取文件 {file_path} 失败: {e}')
    
    print(f'  找到 {len(used_keys)} 个使用的翻译 key')
    
    if dynamic_patterns:
        print(f'  ⚠️  检测到 {len(dynamic_patterns)} 处动态构造的翻译 key:')
        for item in dynamic_patterns[:5]:
            print(f"     - {item['prefix']}${{...}} 在 {item['file']}")
        if len(dynamic_patterns) > 5:
            print(f'     ... 还有 {len(dynamic_patterns) - 5} 处')
        print('     注意: 动态构造的 key 无法精确检测，请手动确认相关翻译')
    
    return used_keys, key_usage

def load_translations(locales_dir, languages):
    """加载翻译文件"""
    print('\n📄 加载翻译文件...')
    
    translations = {}
    
    for lang in languages:
        file_path = Path(locales_dir) / f'{lang}.json'
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                flat = flatten_dict(data)
                translations[lang] = {
                    'raw': data,
                    'flat': flat,
                    'keys': set(flat.keys())
                }
                print(f'  {lang}.json: {len(translations[lang]["keys"])} 个 key')
        except Exception as e:
            print(f'  ❌ 加载 {lang}.json 失败: {e}')
            exit(1)
    
    return translations

def check_missing_keys(used_keys, translations, key_usage):
    """检查缺失的翻译"""
    print('\n🔎 检查缺失的翻译...')
    
    lang = CONFIG['languages'][0]
    translation_keys = translations[lang]['keys']
    
    missing = []
    for key in used_keys:
        if key not in translation_keys:
            locations = key_usage.get(key, [])
            missing.append({'key': key, 'locations': locations})
    
    if not missing:
        print('  ✅ 所有使用的 key 都有翻译')
        return []
    
    print(f'  ❌ 发现 {len(missing)} 个缺失的翻译:\n')
    for i, item in enumerate(missing[:10], 1):
        key = item['key']
        locations = item['locations'][:3]
        more = f" +{len(item['locations']) - 3} 更多" if len(item['locations']) > 3 else ""
        print(f'  {i}. {key}')
        print(f'     使用位置: {", ".join(locations)}{more}')
    
    if len(missing) > 10:
        print(f'  ... 还有 {len(missing) - 10} 个')
    
    return missing

def check_language_consistency(translations, languages):
    """检查语言间一致性"""
    print('\n🔎 检查语言间 key 一致性...')
    
    issues = []
    
    for i in range(len(languages)):
        for j in range(i + 1, len(languages)):
            lang1 = languages[i]
            lang2 = languages[j]
            
            keys1 = translations[lang1]['keys']
            keys2 = translations[lang2]['keys']
            
            only_in_1 = keys1 - keys2
            only_in_2 = keys2 - keys1
            
            if only_in_1 or only_in_2:
                issues.append({
                    'lang1': lang1,
                    'lang2': lang2,
                    'only_in_1': sorted(only_in_1),
                    'only_in_2': sorted(only_in_2)
                })
    
    if not issues:
        print('  ✅ 所有语言的 key 结构一致')
        return []
    
    for issue in issues:
        print(f"  ⚠️  {issue['lang1']} 和 {issue['lang2']} 之间存在不一致:")
        if issue['only_in_1']:
            print(f"     {issue['lang1']} 独有 ({len(issue['only_in_1'])} 个):")
            for key in issue['only_in_1'][:5]:
                print(f'       - {key}')
            if len(issue['only_in_1']) > 5:
                print(f"       ... 还有 {len(issue['only_in_1']) - 5} 个")
        
        if issue['only_in_2']:
            print(f"     {issue['lang2']} 独有 ({len(issue['only_in_2'])} 个):")
            for key in issue['only_in_2'][:5]:
                print(f'       - {key}')
            if len(issue['only_in_2']) > 5:
                print(f"       ... 还有 {len(issue['only_in_2']) - 5} 个")
        print()
    
    return issues

def check_empty_values(translations, languages):
    """检查空值翻译"""
    print('\n🔎 检查空值翻译...')
    
    empty_values = []
    
    for lang in languages:
        flat = translations[lang]['flat']
        for key, value in flat.items():
            if value == '' or value is None:
                empty_values.append({'lang': lang, 'key': key, 'value': value})
    
    if not empty_values:
        print('  ✅ 没有空值翻译')
        return []
    
    print(f'  ⚠️  发现 {len(empty_values)} 个空值翻译:\n')
    for item in empty_values[:10]:
        print(f"  - {item['lang']}: {item['key']} = {json.dumps(item['value'])}")
    
    if len(empty_values) > 10:
        print(f'  ... 还有 {len(empty_values) - 10} 个')
    
    return empty_values

def check_unused_keys(used_keys, translations, languages):
    """检查未使用的 key"""
    print('\n🔎 检查未使用的翻译 key...')
    
    lang = languages[0]
    translation_keys = translations[lang]['keys']
    
    unused = sorted(translation_keys - used_keys)
    
    if not unused:
        print('  ✅ 所有翻译 key 都在使用中')
        return []
    
    print(f'  🗑️  发现 {len(unused)} 个未使用的 key:\n')
    for key in unused[:10]:
        print(f'  - {key}')
    
    if len(unused) > 10:
        print(f'  ... 还有 {len(unused) - 10} 个')
    
    return unused

def check_duplicate_values(translations, languages):
    """检查重复的翻译值"""
    print('\n🔎 检查重复的翻译值...')
    
    lang = languages[0]
    flat = translations[lang]['flat']
    
    value_to_keys = defaultdict(list)
    excluded = CONFIG['excluded_short_values']
    
    for key, value in flat.items():
        if isinstance(value, str) and len(value) > 2 and value not in excluded:
            value_to_keys[value].append(key)
    
    duplicates = [
        {'value': value, 'keys': keys, 'count': len(keys)}
        for value, keys in value_to_keys.items()
        if len(keys) >= 2
    ]
    
    duplicates.sort(key=lambda x: x['count'], reverse=True)
    
    if not duplicates:
        print('  ✅ 没有发现明显的重复翻译值')
        return []
    
    print(f'  💡 发现 {len(duplicates)} 组重复翻译:\n')
    
    for item in duplicates[:5]:
        value = item['value']
        keys = item['keys']
        count = item['count']
        
        # 建议的公共 key 名称
        suggested = f"common.{keys[0].split('.')[-1]}"
        
        print(f'  "{value}" (出现 {count} 次)')
        print(f'  → 建议提取为 {suggested}')
        print(f"    当前位置: {', '.join(keys[:3])}{'...' if len(keys) > 3 else ''}")
        print()
    
    if len(duplicates) > 5:
        print(f'  ... 还有 {len(duplicates) - 5} 组重复翻译')
    
    return duplicates

def delete_nested_key(data, key_path):
    """从嵌套字典中删除 key"""
    keys = key_path.split('.')
    current = data
    
    for key in keys[:-1]:
        if key not in current:
            return False
        current = current[key]
    
    last_key = keys[-1]
    if last_key in current:
        del current[last_key]
        return True
    
    return False

def cleanup_unused_keys(unused_keys, translations, locales_dir, languages):
    """清理未使用的 key - 仅报告，不自动删除"""
    if not unused_keys:
        print('\n✅ 没有需要清理的未使用 key')
        return
    
    print('\n⚠️  检测到未使用的 key（未自动删除）')
    print('    某些 key 可能通过动态方式使用（如模板字符串），请手动确认后再删除')
    print(f'\n    总计: {len(unused_keys)} 个可能未使用的 key')
    print('    详细列表已在上方显示')

def generate_summary(results):
    """生成摘要报告"""
    print('\n' + '=' * 50)
    print('📋 检查摘要')
    print('=' * 50)
    
    print('\n统计:')
    print(f"  使用的 key: {len(results['used_keys'])}")
    for lang in CONFIG['languages']:
        print(f"  {lang} 翻译 key: {len(results['translations'][lang]['keys'])}")
    
    print('\n问题统计:')
    print(f"  ❌ 缺失的翻译: {len(results['missing'])}")
    print(f"  ⚠️  语言不一致: {'是' if results['inconsistency'] else '否'}")
    print(f"  ⚠️  空值翻译: {len(results['empty_values'])}")
    print(f"  🔍 可能未使用的 key: {len(results['unused'])} (需手动确认)")
    print(f"  💡 重复翻译值: {len(results['duplicates'])} 组")
    
    if results['missing'] or results['inconsistency'] or results['empty_values']:
        print('\n⚠️  需要手动修复:')
        if results['missing']:
            print(f"  - 添加 {len(results['missing'])} 个缺失的翻译")
        if results['inconsistency']:
            print(f"  - 修复语言间 key 不一致")
        if results['empty_values']:
            print(f"  - 填充 {len(results['empty_values'])} 个空值翻译")
    
    if results['duplicates']:
        print('\n💡 优化建议:')
        print(f"  - 考虑提取 {len(results['duplicates'])} 组重复翻译为公共 key")
    
    print('\n' + '=' * 50)

def main():
    """主函数"""
    print('🔍 i18n 翻译检查和清理工具')
    print('=' * 50)
    
    # 检查目录是否存在
    if not Path(CONFIG['locales_dir']).exists():
        print(f"\n❌ 错误: 找不到翻译文件目录 {CONFIG['locales_dir']}")
        print('   请在项目根目录运行此脚本')
        exit(1)
    
    results = {}
    
    # 1. 扫描使用的 key
    used_keys, key_usage = scan_used_keys(CONFIG['src_dir'])
    results['used_keys'] = used_keys
    results['key_usage'] = key_usage
    
    # 2. 加载翻译文件
    translations = load_translations(CONFIG['locales_dir'], CONFIG['languages'])
    results['translations'] = translations
    
    # 3. 执行检查
    results['missing'] = check_missing_keys(used_keys, translations, key_usage)
    results['inconsistency'] = check_language_consistency(translations, CONFIG['languages'])
    results['empty_values'] = check_empty_values(translations, CONFIG['languages'])
    results['unused'] = check_unused_keys(used_keys, translations, CONFIG['languages'])
    results['duplicates'] = check_duplicate_values(translations, CONFIG['languages'])
    
    # 4. 清理未使用的 key
    cleanup_unused_keys(results['unused'], translations, CONFIG['locales_dir'], CONFIG['languages'])
    
    # 5. 生成摘要
    generate_summary(results)
    
    # 返回退出码
    has_errors = bool(results['missing'] or results['inconsistency'])
    exit(1 if has_errors else 0)

if __name__ == '__main__':
    main()
