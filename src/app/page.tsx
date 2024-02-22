"use client";
import { groupSequences } from "@/utils";
import { useEffect, useState } from "react";

const data = require("../data/results.json");

type _Statement = any;
type _Sequence = {
  kind: string;
  sequenceId: string;
  discrepancies: _Discrepancy[];
};
type _Discrepancy = any;

export default function Home() {
  const discrepancies = data.discrepancies[0].discrepancies;
  const executedStatements = discrepancies.filter(
    (d) => d.eventKind === "ExecutedStatement"
  );
  const { ExecutedStatement: sequences } = groupSequences(executedStatements);
  console.log({ executedStatements, sequences });

  useEffect(() => {}, []);
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4">
        {Object.values(sequences).map((s, i) => (
          <Sequence sequence={s} key={i} />
        ))}
      </div>
    </div>
  );
}

function Sequence({ sequence }: { sequence: _Sequence }) {
  return (
    <div>
      <div className="text-gray-500">
        {sequence.kind} {sequence.sequenceId}
      </div>
      <div className="pl-4">
        {sequence.discrepancies.map((s, i) => (
          <Statement statement={s} key={i} />
        ))}
      </div>
    </div>
  );
}

function Statement({ statement }: { statement: _Statement }) {
  const [expanded, setExpanded] = useState(false);

  const focusLine = statement.event.description.line;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <button className="font-mono" onClick={() => setExpanded(!expanded)}>
          {expanded ? "▼" : "▶"}
        </button>
        <FunctionOutline
          outline={statement.event.description.functionOutline}
        />
      </div>
      {expanded ? (
        <FramePoints
          points={statement.event.description.framePoints}
          focusLine={focusLine}
        />
      ) : null}
    </div>
  );
}

function FunctionOutline({ outline }: { outline: any }) {
  return <div>{outline.name}</div>;
}

function FramePoints({
  points,
  focusLine,
}: {
  points: any[];
  focusLine: number;
}) {
  return (
    <div className="pl-4 overflow-auto border-l-gray-700 border-l">
      {points.map((p, i) => (
        <Point key={i} point={p} focusLine={focusLine} />
      ))}
    </div>
  );
}

function Point({ point, focusLine }: { point: any; focusLine: number }) {
  return (
    <div className="flex flex-row font-mono text-xs text-gray-600">
      {point.breakable ? (
        <div className="flex flex-row">
          <div className="text-green-300">[{point.altHits || 0}]</div>
          {/* <div className="text-green-300">[{point.altHits || "?"}]</div> */}
          <div className="text-red-300">[{point.hits}]</div>
        </div>
      ) : (
        <div className="flex-shrink-0 invisible">------</div>
      )}
      <div
        className={`flex flex-row ${
          point.location.line === focusLine ? "text-white" : ""
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
