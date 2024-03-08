export function groupSequences(discrepancies: any[]) {
  const grouped: Record<any, Record<string, any>> = {};

  discrepancies.forEach(d => {
    if (!grouped[d.eventKind]) {
      grouped[d.eventKind] = {};
    }

    const group = grouped[d.eventKind];
    const functionName = d.event.description.frame.functionName;

    if (!group[d.sequenceId]) {
      const fns: Record<string, any> = {};
      fns[functionName] = d.event;

      group[d.sequenceId] = {
        sequenceId: d.sequenceId,
        kind: d.kind,
        discrepancies: [d],
        functions: {},
      };
    } else {
      group[d.sequenceId].discrepancies.push(d);
    }

    const event = d.event;
    if (!group[d.sequenceId].functions[functionName]) {
      group[d.sequenceId].functions[functionName] = {
        name: functionName,
        events: [event]
      }
    } else {
      group[d.sequenceId].functions[functionName].events.push(event);
    }
  });

  return grouped;
}

export function isSameLocation(a: any, b: any) {
  return a.line === b.line && a.column === b.column && a.sourceId === b.sourceId;
}