from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from models.base import get_db
from models.domain import Post, Comment
from services.semantic import semantic_engine
from schemas.api_models import SearchQuery
from typing import List

router = APIRouter()

def _generate_mock_ai_summary(query: str, posts: List[Post]) -> str:
    if not posts:
        return f"No verified solutions found for '{query}' in the KaarTech knowledge base."
        
    solutions = []
    
    for post in posts:
        for comment in post.comments:
            if comment.resolution_status in ['RESOLVED', 'PARTIALLY_RESOLVED']:
                clean_text = comment.content.strip()
                # Simple mock summarization: split by sentences and take up to 4 relevant ones
                sentences = [s.strip() for s in clean_text.split('.') if s.strip()]
                
                # Take up to 4 sentences to form multiple bullet points
                points_to_add = sentences[:4]
                for pt in points_to_add:
                    # Clean up common prefixes like "Solution -"
                    clean_pt = pt.replace("Solution —", "").replace("Solution :", "").replace("Solution:", "").strip()
                    if clean_pt:
                        solutions.append(clean_pt + ".")
                        
                break # Only grab the first resolved comment per post
                
    if not solutions:
        return f"While related discussions exist for '{query}', no definitive solutions have been marked as resolved yet."

    # Construct a crisp, bulleted synthesis without markdown bolding
    synthesis = f"Key Solution Points for '{query}':\n\n"
    # Ensure we show at most 4 points across all matched posts to keep it crisp
    for sol in solutions[:4]:
        synthesis += f"• {sol}\n"
        
    return synthesis.strip()

@router.post("/search")
def search_posts(query: SearchQuery, db: Session = Depends(get_db)):
    # Base query for Knowledge Base filtering:
    # 1. Type must be technical help or kebs help
    # 2. Must be resolved (is_solution_validated=True OR has a RESOLVED/PARTIALLY_RESOLVED comment)
    base_filter = db.query(Post).options(joinedload(Post.comments)).outerjoin(Comment).filter(
        Post.type.in_(['technical help', 'kebs help'])
    ).filter(
        or_(
            Post.is_solution_validated == True,
            Comment.resolution_status.in_(['RESOLVED', 'PARTIALLY_RESOLVED'])
        )
    )

    # 1. Get similar IDs from FAISS (currently mock embeddings)
    faiss_results = semantic_engine.search(query.query)
    faiss_post_ids = [r[0] for r in faiss_results] if faiss_results else []
    
    # 2. Always run DB text search as fallback to combine with FAISS
    # This ensures exact keyword matches (like "custom tables") aren't lost 
    # to the noise of the mock random embeddings.
    text_posts = base_filter.filter(
        or_(
            Post.title.ilike(f"%{query.query}%"),
            Post.description.ilike(f"%{query.query}%")
        )
    ).limit(5).all()
    
    # 3. Combine FAISS ID results and Text Search results
    search_ids = set(faiss_post_ids)
    for p in text_posts:
        search_ids.add(p.id)
        
    if not search_ids:
        return {
            "answer": _generate_mock_ai_summary(query.query, []),
            "posts": []
        }
    
    # Fetch from DB all matched IDs
    posts = base_filter.filter(Post.id.in_(list(search_ids))).all()
    
    # Remove duplicates from outerjoin
    posts = list({p.id: p for p in posts}.values())
    
    # Optional: Reorder so text matches are first, then FAISS matches
    text_ids = {p.id for p in text_posts}
    ordered_posts = []
    
    # Add text matches
    for p in text_posts:
        if p.id in {p2.id for p2 in posts}: # Make sure it passed the base_filter
            ordered_posts.append(p)
            
    # Add FAISS matches that weren't in text matches
    for pid in faiss_post_ids:
        if pid not in text_ids:
            # find it
            found = next((p for p in posts if p.id == pid), None)
            if found:
                ordered_posts.append(found)

    return {
        "answer": _generate_mock_ai_summary(query.query, ordered_posts),
        "posts": ordered_posts
    }
