export function groupSequences(discrepancies: any[]) {
  const grouped: Record<any, Record<string, any>> = {};

  discrepancies.forEach(d => {
    if (!grouped[d.eventKind]) {
      grouped[d.eventKind] = {};
    }

    const group = grouped[d.eventKind];
    if (!group[d.sequenceId]) {
      group[d.sequenceId] = {
        sequenceId: d.sequenceId,
        kind: d.kind,
        discrepancies: [d],
      };
    } else {
      group[d.sequenceId].discrepancies.push(d);
    }
  });

  return grouped;
}