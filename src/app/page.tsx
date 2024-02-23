"use client";
import { groupSequences } from "@/utils";
import { useEffect, useState } from "react";

const data = require("../data/results.json");

type _Statement = any;
type _Sequence = {
  kind: string;
  sequenceId: string;
  discrepancies: _Discrepancy[];
  functions: _Function[];
};
type _Discrepancy = any;
type _Function = any;
type _GroupedFunction = {
  name: string;
  events: any[];
};

export default function Home() {
  const [sequenceId, setSequenceId] = useState<string | null>(null);
  const [functionName, setFunctionName] = useState<string | null>(null);
  const discrepancies = data.discrepancies[0].discrepancies;
  const executedStatements = discrepancies.filter(
    (d: any) => d.eventKind === "ExecutedStatement"
  );
  const { ExecutedStatement: sequences } = groupSequences(executedStatements);

  useEffect(() => {}, []);
  return (
    <div className="flex flex-row overflow-hidden h-full">
      <div className="p-4 gap-4 flex flex-col overflow-y-scroll h-full text-sm">
        <div className="flex flex-col gap-4">
          {Object.values(sequences).map((s, i) => (
            <Sequence
              sequence={s}
              key={i}
              functionName={functionName}
              setFunctionName={setFunctionName}
              sequenceId={sequenceId}
              setSequenceId={setSequenceId}
            />
          ))}
        </div>
      </div>
      <Viewer
        functionName={functionName}
        sequenceId={sequenceId}
        sequences={sequences}
      />
    </div>
  );
}

function Viewer({
  functionName,
  sequenceId,
  sequences,
}: {
  functionName: string | null;
  sequenceId: string | null;
  sequences: Record<string, any>;
}) {
  if (!sequenceId || !functionName) {
    return <div>Pick something</div>;
  }

  const sequence = sequences[sequenceId];
  const fn = sequence.functions[functionName];

  const firstEvent = fn.events[0];
  const focusLines = fn.events.map((e: any) => e.description.line);

  return (
    <div className="flex flex-row flex-grow items-center overflow-auto">
      <FramePoints
        points={firstEvent.description.framePoints}
        focusLines={focusLines}
      />
    </div>
  );
}

function Sequence({
  sequence,
  functionName,
  setFunctionName,
  sequenceId,
  setSequenceId,
}: {
  sequence: _Sequence;
  functionName: string | null;
  setFunctionName: (name: string | null) => void;
  sequenceId: string | null;
  setSequenceId: (name: string | null) => void;
}) {
  return (
    <div>
      <div className="text-gray-500">
        {sequence.kind} {sequence.sequenceId}
      </div>
      <div className="pl-4">
        {Object.values(sequence.functions).map((fn, i) => (
          <GroupedFunction
            key={i}
            groupedFn={fn}
            selectedFunctionName={functionName}
            setFunctionName={setFunctionName}
            sequenceId={sequence.sequenceId}
            setSequenceId={setSequenceId}
          />
        ))}
      </div>
    </div>
  );
}

function GroupedFunction({
  groupedFn,
  selectedFunctionName,
  setFunctionName,
  sequenceId,
  setSequenceId,
}: {
  groupedFn: _GroupedFunction;
  selectedFunctionName: string | null;
  setFunctionName: (name: string | null) => void;
  sequenceId: string;
  setSequenceId: (name: string | null) => void;
}) {
  const onClick = () => {
    setFunctionName(groupedFn.name);
    setSequenceId(sequenceId);
  };

  return (
    <div>
      <button className="flex flex-row gap-2" onClick={onClick}>
        {groupedFn.name}
      </button>
    </div>
  );
}

function FramePoints({
  points,
  focusLines,
}: {
  points: any[];
  focusLines: number[];
}) {
  return (
    <div className="pl-4 overflow-auto">
      {points.map((p, i) => (
        <Point key={i} point={p} focusLines={focusLines} />
      ))}
    </div>
  );
}

function Point({ point, focusLines }: { point: any; focusLines: number[] }) {
  return (
    <div className="flex flex-row font-mono text-xs text-gray-600">
      {point.breakable ? (
        <div className="flex flex-row">
          <div className="text-green-300" title={point.altHits}>
            [{point.altHits}]
          </div>
          <div className="text-red-300">[{point.hits}]</div>
        </div>
      ) : (
        <div className="flex-shrink-0 invisible">------</div>
      )}
      <div
        className={`flex flex-row ${
          focusLines.includes(point.location.line) ? "text-white" : ""
        }`}
      >
        <div>|</div>
        <div>({point.location.line})</div>
        <div>|</div>
        <div className="whitespace-pre">{point.text}</div>
      </div>
    </div>
  );
}
