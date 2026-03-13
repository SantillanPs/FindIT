import heapq
from sqlalchemy.orm import Session
from database import ZoneAdjacency

class LocationService:
    @staticmethod
    def get_shortest_path_distance(db: Session, start_zone_id: int, end_zone_id: int) -> int:
        """
        Calculates the shortest path distance between two zones using Dijkstra's algorithm.
        Returns the integer distance, or -1 if no path exists.
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
                
            # Query edges where zone_a is the current node.
            # (Symmetric edges were created in the database seed, so this handles both directions)
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
        Converts a graph distance into a location score modifier [-0.20 to +0.15].
        """
        if distance == -1:
            return -0.10  # Standard mismatch penalty for unroutable or different completely
            
        if distance == 0:
            return 0.15   # Exact same zone match boost
            
        if distance <= 2:
            return 0.10   # Very close (e.g., adjacent room or hallway)
            
        if distance <= 5:
            return 0.0    # Neutral, nearby but not suspiciously close
            
        if distance <= 10:
            return -0.10  # Further away, slight penalty
            
        return -0.20      # Very far away, heavy penalty (e.g., across campus)
