export function expandHistoryToDailyPoints(history) {
    const expanded = [];
  
    history.forEach(({ price, firstSeen, lastSeen }) => {
      const start = new Date(firstSeen);
      const end = new Date(lastSeen);
      const current = new Date(start);
  
      while (current <= end) {
        expanded.push({
          date: new Date(current),
          price,
        });
        current.setDate(current.getDate() + 1);
      }
    });
  
    // Sort by date just in case
    return expanded.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  