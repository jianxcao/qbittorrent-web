#!/usr/bin/env python3
"""
i18n 翻译优化脚本
自动删除未使用的 key 并提取重复翻译为公共 key
"""

import json
import re
import os
from pathlib import Path
from collections import defaultdict
import shutil
import sys

# 导入原有的函数
sys.path.insert(0, str(Path(__file__).parent))
from check_i18n import (
    flatten_dict, scan_used_keys, load_translations,
    check_unused_keys, check_duplicate_values,
    delete_nested_key, CONFIG
)

# 动态构造的前缀（这些前缀下的 key 不能删除）
DYNAMIC_PREFIXES = ['columns']

def filter_safe_to_delete(unused_keys):
    """过滤出可以安全删除的 key（排除动态构造的）"""
    safe_to_delete = []
    maybe_dynamic = []
    
    for key in unused_keys:
        prefix = key.split('.')[0]
        if prefix in DYNAMIC_PREFIXES:
            maybe_dynamic.append(key)
        else:
            safe_to_delete.append(key)
    
    return safe_to_delete, maybe_dynamic

def extract_common_translations(duplicates, translations, threshold=3):
    """提取重复翻译为公共 key"""
    # 只提取出现次数 >= threshold 的重复翻译
    high_frequency = [d for d in duplicates if d['count'] >= threshold]
    
    extractions = []
    
    for item in high_frequency:
        value = item['value']
        keys = item['keys']
        
        # 生成公共 key 名称
        # 优先使用第一个 key 的最后一部分
        last_part = keys[0].split('.')[-1]
        common_key = f'common.{last_part}'
        
        # 如果已存在，尝试其他名称
        counter = 1
        original_key = common_key
        while common_key in translations['zh-CN']['keys']:
            common_key = f'{original_key}{counter}'
            counter += 1
        
        extractions.append({
            'common_key': common_key,
            'value_zh': value,
            'value_en': translations['en-US']['flat'].get(keys[0], value),
            'original_keys': keys,
            'count': len(keys)
        })
    
    return extractions

def apply_deletions(unused_keys, translations, locales_dir, languages):
    """应用删除操作"""
    if not unused_keys:
        print('\n✅ 没有需要删除的 key')
        return
    
    print(f'\n🗑️  正在删除 {len(unused_keys)} 个未使用的 key...')
    
    for lang in languages:
        file_path = Path(locales_dir) / f'{lang}.json'
        backup_path = Path(str(file_path) + '.backup2')
        
        # 备份
        shutil.copy(file_path, backup_path)
        
        # 删除
        data = translations[lang]['raw']
        deleted = 0
        
        for key in unused_keys:
            if delete_nested_key(data, key):
                deleted += 1
        
        # 写回
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        
        print(f'  ✅ {lang}.json: 删除了 {deleted} 个 key')

def set_nested_key(obj, key_path, value):
    """在嵌套字典中设置值"""
    keys = key_path.split('.')
    current = obj
    
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]
    
    current[keys[-1]] = value

def apply_extractions(extractions, translations, locales_dir, languages):
    """应用提取公共翻译的操作"""
    if not extractions:
        print('\n✅ 没有需要提取的公共翻译')
        return
    
    print(f'\n💡 正在提取 {len(extractions)} 个重复翻译为公共 key...')
    
    # 添加到 common 命名空间
    for lang in languages:
        data = translations[lang]['raw']
        
        for extraction in extractions:
            common_key = extraction['common_key']
            value = extraction['value_zh'] if lang == 'zh-CN' else extraction['value_en']
            
            # 添加到 common
            set_nested_key(data, common_key, value)
            print(f'  ✅ {lang}.json: 添加 {common_key} = "{value}"')
        
        # 写回文件
        file_path = Path(locales_dir) / f'{lang}.json'
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
    
    # 生成替换指南
    print('\n📝 代码替换指南:')
    print('   以下是需要在代码中替换的翻译 key:\n')
    
    for extraction in extractions:
        print(f"   {extraction['common_key']} (替换 {extraction['count']} 处):")
        for old_key in extraction['original_keys'][:3]:
            print(f"     - {old_key}")
        if len(extraction['original_keys']) > 3:
            print(f"     ... 还有 {len(extraction['original_keys']) - 3} 处")
        print()

def main():
    print('🔧 i18n 翻译优化工具')
    print('=' * 50)
    
    # 1. 扫描使用的 key
    used_keys, key_usage = scan_used_keys(CONFIG['src_dir'])
    
    # 2. 加载翻译
    translations = load_translations(CONFIG['locales_dir'], CONFIG['languages'])
    
    # 3. 检查未使用的 key
    unused_keys = check_unused_keys(used_keys, translations, CONFIG['languages'])
    
    # 4. 过滤安全删除的 key
    safe_to_delete, maybe_dynamic = filter_safe_to_delete(unused_keys)
    
    print(f'\n📊 分析结果:')
    print(f'  - 可安全删除: {len(safe_to_delete)} 个')
    print(f'  - 可能动态使用: {len(maybe_dynamic)} 个 (不会删除)')
    
    if maybe_dynamic:
        print(f'\n  保留的动态 key 示例:')
        for key in maybe_dynamic[:5]:
            print(f'    - {key}')
    
    # 5. 检查重复翻译
    duplicates = check_duplicate_values(translations, CONFIG['languages'])
    
    # 6. 提取高频重复翻译
    extractions = extract_common_translations(duplicates, translations, threshold=3)
    
    print(f'\n💡 提取计划:')
    print(f'  - 将提取 {len(extractions)} 个高频重复翻译为公共 key')
    print(f'  - 标准: 出现 >= 3 次的翻译')
    
    # 询问确认
    print('\n⚠️  即将执行以下操作:')
    print(f'  1. 删除 {len(safe_to_delete)} 个未使用的 key')
    print(f'  2. 提取 {len(extractions)} 个重复翻译为公共 key')
    print(f'  3. 保留 {len(maybe_dynamic)} 个可能动态使用的 key')
    
    response = input('\n确认执行吗？(yes/no): ').strip().lower()
    
    if response != 'yes':
        print('❌ 操作已取消')
        return
    
    # 执行删除
    apply_deletions(safe_to_delete, translations, CONFIG['locales_dir'], CONFIG['languages'])
    
    # 重新加载翻译（因为删除后结构变了）
    translations = load_translations(CONFIG['locales_dir'], CONFIG['languages'])
    
    # 执行提取
    apply_extractions(extractions, translations, CONFIG['locales_dir'], CONFIG['languages'])
    
    print('\n' + '=' * 50)
    print('✅ 优化完成！')
    print('\n📋 后续步骤:')
    print('  1. 查看上方的"代码替换指南"')
    print('  2. 在代码中将旧的 key 替换为新的公共 key')
    print('  3. 替换完成后，再次运行检查脚本验证')
    print('  4. 如有问题，可从 .backup2 备份恢复')

if __name__ == '__main__':
    main()
