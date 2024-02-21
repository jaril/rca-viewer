"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const data = require("../data/results.json");

export default function Home() {
  const discrepancies = data.discrepancies[0].discrepancies;
  const executedStatements = discrepancies.filter(
    (d) => d.eventKind === "ExecutedStatement"
  );
  console.log(executedStatements);

  useEffect(() => {}, []);
  return (
    <div className="p-4">
      <div className="flex flex-col gap-2">
        {executedStatements.map((s, i) => (
          <Statement statement={s} key={i} />
        ))}
      </div>
    </div>
  );
}

function Statement({ statement }: { statement: any }) {
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
        <div className="text-gray-500">
          {statement.kind} {statement.sequenceId}
        </div>
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
    <div className="pl-4 overflow-auto">
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
