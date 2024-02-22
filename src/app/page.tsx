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
  const [groupBy, setGroupBy] = useState<"function" | "discrepancy">(
    "discrepancy"
  );
  const discrepancies = data.discrepancies[0].discrepancies;
  const executedStatements = discrepancies.filter(
    (d) => d.eventKind === "ExecutedStatement"
  );
  const { ExecutedStatement: sequences } = groupSequences(executedStatements);

  useEffect(() => {}, []);
  return (
    <div className="p-4 gap-4 flex flex-col">
      <div className="flex flex-row gap-2">
        <button
          className={groupBy === "discrepancy" ? "opacity-100" : "opacity-50"}
          onClick={() => setGroupBy("discrepancy")}
        >
          By Discrepancy
        </button>
        <div>|</div>
        <button
          className={groupBy === "function" ? "opacity-100" : "opacity-50"}
          onClick={() => setGroupBy("function")}
        >
          By Function
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {Object.values(sequences).map((s, i) => (
          <Sequence sequence={s} key={i} groupBy={groupBy} />
        ))}
      </div>
    </div>
  );
}

function Sequence({
  sequence,
  groupBy,
}: {
  sequence: _Sequence;
  groupBy: "discrepancy" | "function";
}) {
  return (
    <div>
      <div className="text-gray-500">
        {sequence.kind} {sequence.sequenceId}
      </div>
      <div className="pl-4">
        {groupBy === "discrepancy"
          ? sequence.discrepancies.map((s, i) => (
              <Statement statement={s} key={i} />
            ))
          : Object.values(sequence.functions).map((fn, i) => (
              <GroupedFunction key={i} groupedFn={fn} />
            ))}
      </div>
    </div>
  );
}

function GroupedFunction({ groupedFn }: { groupedFn: _GroupedFunction }) {
  const [expanded, setExpanded] = useState(false);
  const firstEvent = groupedFn.events[0];
  const focusLines = groupedFn.events.map((e) => e.description.line);

  return (
    <div>
      <div className="flex flex-row gap-2">
        <button className="font-mono" onClick={() => setExpanded(!expanded)}>
          {expanded ? "▼" : "▶"}
        </button>
        <div>{groupedFn.name}</div>
      </div>
      {expanded ? (
        <FramePoints
          points={firstEvent.description.framePoints}
          focusLines={focusLines}
        />
      ) : null}
    </div>
  );
}

function Statement({ statement }: { statement: _Statement }) {
  const [expanded, setExpanded] = useState(false);

  const focusLines = [statement.event.description.line];
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
          focusLines={focusLines}
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
  focusLines,
}: {
  points: any[];
  focusLines: number[];
}) {
  return (
    <div className="pl-4 overflow-auto border-l-gray-700 border-l">
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
          <div className="text-green-300">[{point.altHits || 0}]</div>
          {/* <div className="text-green-300">[{point.altHits || "?"}]</div> */}
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
