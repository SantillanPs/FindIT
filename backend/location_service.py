import heapq
from typing import Optional
from sqlalchemy.orm import Session
from database import ZoneAdjacency, Zone

class LocationService:
    @staticmethod
    def get_spatial_similarity(db: Session, lost_zone_id: Optional[int], found_zone_id: Optional[int], potential_zone_ids: list[int] = []) -> float:
        """
        Calculates spatial similarity [0.2 to 1.0] using Set Theory (Hierarchical Containment).
        """
        if not found_zone_id:
            return 0.5  # Neutral if found location unknown
            
        # 1. Identity / Direct Match
        if (lost_zone_id and found_zone_id == lost_zone_id) or (found_zone_id in potential_zone_ids):
            return 1.0
            
        # 2. Hierarchy Traversal
        def get_ancestors(zone_id):
            ancestors = set()
            curr = db.query(Zone).filter(Zone.id == zone_id).first()
            while curr and curr.parent_zone_id:
                ancestors.add(curr.parent_zone_id)
                curr = db.query(Zone).filter(Zone.id == curr.parent_zone_id).first()
            return ancestors

        found_ancestors = get_ancestors(found_zone_id)
        
        # 3. Containment Check (Found is a sub-zone of Lost)
        if lost_zone_id and lost_zone_id in found_ancestors:
            return 0.95
        
        for p_id in potential_zone_ids:
            if p_id in found_ancestors:
                return 0.95

        # 4. Reverse Containment (Lost is a sub-zone of Found)
        if lost_zone_id:
            lost_ancestors = get_ancestors(lost_zone_id)
            if found_zone_id in lost_ancestors:
                return 0.85
        
        # 5. Shared Ancestry (Sibling/Proximity)
        if lost_zone_id:
            lost_ancestors = get_ancestors(lost_zone_id)
            common = found_ancestors.intersection(lost_ancestors)
            if common:
                # If they only share the root 'Campus' (ID 1 in our system), it's a weak disjoint match.
                # Otherwise, they share a Building or Floor.
                if 1 in common and len(common) == 1:
                    return 0.10
                return 0.80
        
        # 6. Disjoint / Different Buildings
        return 0.10

    @staticmethod
    def get_shortest_path_distance(db: Session, start_zone_id: int, end_zone_id: int) -> int:
        """
        LEGACY: Calculates the shortest path distance using Dijkstra's algorithm.
        Replaced by get_spatial_similarity for matching logic.
        """
        if not start_zone_id or not end_zone_id:
            return -1
            
        if start_zone_id == end_zone_id:
            return 0
            
        distances = {start_zone_id: 0}
        priority_queue = [(0, start_zone_id)]
        visited = set()
        
        while priority_queue:
            current_distance, current_zone_id = heapq.heappop(priority_queue)
            
            if current_zone_id in visited:
                continue
                
            visited.add(current_zone_id)
            
            if current_zone_id == end_zone_id:
                return current_distance
                
            edges = db.query(ZoneAdjacency).filter(ZoneAdjacency.zone_a_id == current_zone_id).all()
            
            for edge in edges:
                neighbor_id = edge.zone_b_id
                weight = edge.distance_weight or 1
                distance = current_distance + weight
                
                if neighbor_id not in distances or distance < distances[neighbor_id]:
                    distances[neighbor_id] = distance
                    heapq.heappush(priority_queue, (distance, neighbor_id))
                    
        return -1

    @staticmethod
    def calculate_location_score(distance: int) -> float:
        """
        LEGACY: Converts a graph distance into a score modifier.
        Replaced by get_spatial_similarity for matching logic.
        """
        if distance == -1:
            return -0.10
            
        if distance == 0:
            return 0.15
            
        if distance <= 2:
            return 0.10
            
        if distance <= 5:
            return 0.0
            
        if distance <= 10:
            return -0.10
            
        return -0.20
