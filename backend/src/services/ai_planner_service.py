from src.config.firebase import db
from google.cloud import firestore
import logging
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from fastapi import HTTPException

logger = logging.getLogger(__name__)

def should_refresh_ai_plan(last_updated: Optional[datetime], course_data_hash: str, stored_hash: str) -> bool:
    """
    Determine if AI plan should be refreshed based on:
    1. 24-hour time expiry
    2. Course data changes (via hash comparison)
    """
    logger.debug(f"Checking AI plan freshness - last_updated: {last_updated}")
    
    # Always refresh if no last_updated timestamp
    if not last_updated:
        logger.info("No last_updated timestamp found, refresh needed")
        return True
    
    # Check if course data has changed
    if course_data_hash != stored_hash:
        logger.info(f"Course data changed (hash mismatch), refresh needed")
        logger.debug(f"Current hash: {course_data_hash[:8]}..., Stored hash: {stored_hash[:8]}...")
        return True
    
    # Check 24-hour expiry
    now = datetime.now(timezone.utc)
    hours_elapsed = (now - last_updated).total_seconds() / 3600
    
    should_refresh = hours_elapsed >= 24
    logger.info(f"Hours elapsed since last update: {hours_elapsed:.1f}h, refresh needed: {should_refresh}")
    return should_refresh

def create_course_data_hash(courses: list) -> str:
    """
    Create a hash of course data to detect changes.
    Only includes relevant fields that would affect AI planning.
    """
    # Extract only the fields that matter for AI planning
    plan_relevant_data = []
    
    for course in courses:
        course_summary = {
            'id': course.get('id'),
            'name': course.get('name'),
            'assignments': []
        }
        
        # Include assignment data that affects planning
        for assignment in course.get('assignments', []):
            assignment_summary = {
                'id': assignment.get('id'),
                'name': assignment.get('name'),
                'due_at': assignment.get('due_at'),
                'points_possible': assignment.get('points_possible'),
                'has_submitted_submissions': assignment.get('has_submitted_submissions')
            }
            course_summary['assignments'].append(assignment_summary)
        
        # Include announcements count
        course_summary['announcements_count'] = len(course.get('announcements', []))
        plan_relevant_data.append(course_summary)
    
    # Create hash from sorted JSON representation
    data_json = json.dumps(plan_relevant_data, sort_keys=True, default=str)
    return hashlib.sha256(data_json.encode()).hexdigest()

class AIPlannerService:
    """Service for AI Planner caching and persistence"""
    
    @staticmethod
    async def get_cached_ai_plan(user_id: str, courses: list) -> Optional[Dict[str, Any]]:
        """
        Get cached AI plan if it's still valid (not expired and course data unchanged)
        """
        try:
            logger.info(f"🗄️ [AI Plan Cache] Checking cached plan for user: {user_id}")
            
            # Get cached plan from Firestore
            doc_ref = db.collection('aiPlans').document(user_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                logger.info("🗄️ [AI Plan Cache] No cached plan found")
                return None
            
            cached_data = doc.to_dict()
            
            # Extract cached plan and metadata
            cached_plan = cached_data.get('plan')
            last_updated = cached_data.get('lastUpdated')
            stored_hash = cached_data.get('courseDataHash')
            
            if not all([cached_plan, last_updated, stored_hash]):
                logger.warning("🗄️ [AI Plan Cache] Cached plan missing required fields")
                return None
            
            # Convert Firestore timestamp to datetime
            if hasattr(last_updated, 'seconds'):
                last_updated_dt = datetime.fromtimestamp(last_updated.seconds, tz=timezone.utc)
            else:
                last_updated_dt = last_updated
            
            # Create hash of current course data
            current_hash = create_course_data_hash(courses)
            
            # Check if refresh is needed
            if should_refresh_ai_plan(last_updated_dt, current_hash, stored_hash):
                logger.info("🗄️ [AI Plan Cache] Cached plan is stale, refresh needed")
                return None
            
            logger.info("🗄️ [AI Plan Cache] Using valid cached plan")
            logger.debug(f"🗄️ [AI Plan Cache] Plan has {len(cached_plan.get('todos', []))} todos, "
                        f"{len(cached_plan.get('deadlines', []))} deadlines")
            
            return cached_plan
            
        except Exception as e:
            logger.error(f"🗄️ [AI Plan Cache] Error retrieving cached plan: {str(e)}")
            return None
    
    @staticmethod
    async def save_ai_plan(user_id: str, plan: Dict[str, Any], courses: list):
        """
        Save AI plan to Firestore with metadata for cache invalidation
        """
        try:
            logger.info(f"🗄️ [AI Plan Cache] Saving AI plan for user: {user_id}")
            
            # Create course data hash for future comparison
            course_data_hash = create_course_data_hash(courses)
            
            # Prepare document data
            doc_data = {
                'plan': plan,
                'courseDataHash': course_data_hash,
                'lastUpdated': firestore.SERVER_TIMESTAMP,
                'courseCount': len(courses),
                'assignmentCount': sum(len(course.get('assignments', [])) for course in courses)
            }
            
            # Save to Firestore
            doc_ref = db.collection('aiPlans').document(user_id)
            doc_ref.set(doc_data)
            
            logger.info(f"🗄️ [AI Plan Cache] Successfully saved AI plan with hash: {course_data_hash[:8]}...")
            logger.debug(f"🗄️ [AI Plan Cache] Plan contains {len(plan.get('todos', []))} todos, "
                        f"{len(plan.get('deadlines', []))} deadlines, "
                        f"{len(plan.get('studyBlocks', []))} study blocks, "
                        f"{len(plan.get('insights', []))} insights")
            
        except Exception as e:
            logger.error(f"🗄️ [AI Plan Cache] Failed to save AI plan: {str(e)}")
            # Don't raise exception - plan generation succeeded even if caching failed
    
    @staticmethod
    async def clear_ai_plan_cache(user_id: str):
        """
        Clear cached AI plan for user (useful for forced regeneration)
        """
        try:
            logger.info(f"🗄️ [AI Plan Cache] Clearing cached plan for user: {user_id}")
            
            doc_ref = db.collection('aiPlans').document(user_id)
            doc_ref.delete()
            
            logger.info("🗄️ [AI Plan Cache] Successfully cleared cached plan")
            
        except Exception as e:
            logger.error(f"🗄️ [AI Plan Cache] Failed to clear cached plan: {str(e)}")
            # Don't raise exception - not critical
    
    @staticmethod
    async def get_plan_metadata(user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata about cached plan (for debugging/monitoring)
        """
        try:
            doc_ref = db.collection('aiPlans').document(user_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return None
            
            cached_data = doc.to_dict()
            
            # Return metadata without the full plan
            metadata = {
                'lastUpdated': cached_data.get('lastUpdated'),
                'courseDataHash': cached_data.get('courseDataHash'),
                'courseCount': cached_data.get('courseCount'),
                'assignmentCount': cached_data.get('assignmentCount')
            }
            
            if cached_data.get('plan'):
                plan = cached_data['plan']
                metadata.update({
                    'todosCount': len(plan.get('todos', [])),
                    'deadlinesCount': len(plan.get('deadlines', [])),
                    'studyBlocksCount': len(plan.get('studyBlocks', [])),
                    'insightsCount': len(plan.get('insights', []))
                })
            
            return metadata
            
        except Exception as e:
            logger.error(f"🗄️ [AI Plan Cache] Failed to get plan metadata: {str(e)}")
            return None
