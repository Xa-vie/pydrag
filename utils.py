from typing import List, Dict, Any, Union
import re

def string_utils():
    """
    Returns a dictionary of string utility functions
    """
    def capitalize_words(text: str) -> str:
        """Capitalize the first letter of each word in a string"""
        return ' '.join(word.capitalize() for word in text.split())
    
    def remove_special_chars(text: str, keep_spaces: bool = True) -> str:
        """Remove special characters from a string"""
        pattern = r'[^a-zA-Z0-9\s]' if keep_spaces else r'[^a-zA-Z0-9]'
        return re.sub(pattern, '', text)
    
    def truncate_string(text: str, length: int, suffix: str = '...') -> str:
        """Truncate a string to a specified length with an optional suffix"""
        if len(text) <= length:
            return text
        return text[:length - len(suffix)] + suffix
    
    return {
        'capitalize_words': capitalize_words,
        'remove_special_chars': remove_special_chars,
        'truncate_string': truncate_string
    }

def list_utils():
    """
    Returns a dictionary of list utility functions
    """
    def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
        """Split a list into chunks of specified size"""
        return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]
    
    def remove_duplicates(lst: List[Any], preserve_order: bool = True) -> List[Any]:
        """Remove duplicates from a list while optionally preserving order"""
        if preserve_order:
            seen = set()
            return [x for x in lst if not (x in seen or seen.add(x))]
        return list(set(lst))
    
    def flatten_list(nested_list: List[Any]) -> List[Any]:
        """Flatten a nested list structure"""
        result = []
        for item in nested_list:
            if isinstance(item, list):
                result.extend(flatten_list(item))
            else:
                result.append(item)
        return result
    
    return {
        'chunk_list': chunk_list,
        'remove_duplicates': remove_duplicates,
        'flatten_list': flatten_list
    }

def dict_utils():
    """
    Returns a dictionary of dictionary utility functions
    """
    def merge_dicts(dict1: Dict, dict2: Dict, deep: bool = False) -> Dict:
        """Merge two dictionaries, optionally deep merging nested dictionaries"""
        result = dict1.copy()
        for key, value in dict2.items():
            if deep and key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = merge_dicts(result[key], value, deep=True)
            else:
                result[key] = value
        return result
    
    def filter_dict(d: Dict, keys: List[str]) -> Dict:
        """Filter a dictionary to only include specified keys"""
        return {k: d[k] for k in keys if k in d}
    
    def invert_dict(d: Dict) -> Dict:
        """Invert a dictionary's keys and values"""
        return {v: k for k, v in d.items()}
    
    return {
        'merge_dicts': merge_dicts,
        'filter_dict': filter_dict,
        'invert_dict': invert_dict
    }

# Create instances of utility functions
string_utils = string_utils()
list_utils = list_utils()
dict_utils = dict_utils() 