from rapidfuzz import fuzz
from .models import Product

def search_products(query, category_filter=None):
    """
    Implements three-tier relevance ranking with rapidfuzz typo tolerance.
    Returns: list of dicts with products and their relevance score / rank reason.
    """
    query_lower = query.strip().lower()
    
    # 1. Fetch products (apply category filter if specified)
    queryset = Product.objects.all()
    if category_filter:
        queryset = queryset.filter(category__iexact=category_filter)
        
    results = []
    
    for product in queryset:
        category_lower = product.category.lower()
        tags_lower = [t.lower() for t in product.tags]
        name_lower = product.product_name.lower()
        description_lower = product.product_description.lower()
        
        best_score = 0.0
        best_reason = ""
        
        # --- Tier 1: Category Match (score: 0.85 - 1.00) ---
        # Match if exact or ratio > 80%
        is_category_match = (
            query_lower == category_lower or 
            fuzz.ratio(query_lower, category_lower) > 80 or
            fuzz.partial_ratio(query_lower, category_lower) > 80
        )
        if is_category_match:
            # Sub-sort by number of matching tags DESC
            # A tag matches if it is exact or ratio > 80
            matching_tags = [
                t for t in tags_lower 
                if t == query_lower or fuzz.ratio(query_lower, t) > 80
            ]
            total_tags = len(tags_lower)
            if total_tags > 0:
                tier1_score = 0.85 + (len(matching_tags) / total_tags) * 0.15
            else:
                tier1_score = 0.85
            
            if tier1_score > best_score:
                best_score = tier1_score
                best_reason = "Category match"

        # --- Tier 2: Tag Match (score: 0.50 - 0.84) ---
        # Tags contain query term, but category doesn't match
        # Sub-sort: exact tag match (0.70) > partial/fuzzy tag match (0.55)
        # Exact check
        if query_lower in tags_lower:
            tier2_score = 0.70
            if tier2_score > best_score:
                best_score = tier2_score
                best_reason = f"Tag match ({query_lower})"
        else:
            # Fuzzy match
            matching_fuzzy_tags = [
                t for t in tags_lower 
                if fuzz.ratio(query_lower, t) > 80
            ]
            if matching_fuzzy_tags:
                tier2_score = 0.55
                if tier2_score > best_score:
                    best_score = tier2_score
                    best_reason = f"Tag match ({matching_fuzzy_tags[0]})"

        # --- Tier 3: Name/Description Match (score: 0.20 - 0.49) ---
        # Query found in name (0.40) or description (0.25)
        # Exact name substring or fuzzy name match
        name_words = name_lower.split()
        is_name_match = (
            query_lower in name_lower or
            fuzz.partial_ratio(query_lower, name_lower) > 80 or
            any(fuzz.ratio(query_lower, w) > 80 for w in name_words)
        )
        if is_name_match:
            tier3_score = 0.40
            if tier3_score > best_score:
                best_score = tier3_score
                best_reason = "Name match"
        else:
            # Exact description substring or fuzzy description match
            desc_words = description_lower.split()
            is_desc_match = (
                query_lower in description_lower or
                fuzz.partial_ratio(query_lower, description_lower) > 80 or
                any(fuzz.ratio(query_lower, w) > 80 for w in desc_words)
            )
            if is_desc_match:
                tier3_score = 0.25
                if tier3_score > best_score:
                    best_score = tier3_score
                    best_reason = "Description match"

        # If we matched any tier, add to results
        if best_score > 0:
            # Round score to 2 decimal places
            results.append({
                "id": product.id,
                "product_name": product.product_name,
                "category": product.category,
                "tags": product.tags,
                "product_description": product.product_description,
                "relevance_score": round(best_score, 4),
                "rank_reason": best_reason
            })
            
    # Sort results primarily by score descending, then by product name / ID for stability
    results.sort(key=lambda x: (-x["relevance_score"], x["id"]))
    return results
