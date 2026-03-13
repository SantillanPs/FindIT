export const getZoneIcon = (type) => {
    switch (type) {
      case 'building': return 'fa-building-columns';
      case 'floor': return 'fa-layer-group';
      case 'room': return 'fa-door-open';
      case 'hallway': return 'fa-arrows-left-right';
      case 'outdoor': return 'fa-tree';
      default: return 'fa-location-dot';
    }
};

export const getWeightLabel = (w) => {
    if (w <= 1) return "Immediate";
    return "Distant";
};
