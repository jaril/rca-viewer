/* eslint-disable react/no-unescaped-entities */
"use client";
import { groupSequences, isSameLocation } from "@/utils";
import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// // Promise example
// const data = require("../data/results.json");
// Exception example
const data = require("../data/results2.json");

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
  const exceptions = data.discrepancies[0].exceptions;

  return (
    <PanelGroup autoSaveId="example" direction="horizontal">
      <Panel defaultSize={25}>
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
      </Panel>
      <PanelResizeHandle />
      <Panel>
        <Viewer
          functionName={functionName}
          sequenceId={sequenceId}
          sequences={sequences}
          exceptions={exceptions}
        />
      </Panel>
    </PanelGroup>
  );
}

function Viewer({
  functionName,
  sequenceId,
  sequences,
  exceptions,
}: {
  functionName: string | null;
  sequenceId: string | null;
  sequences: Record<string, any>;
  exceptions: any[];
}) {
  const [split, setSplit] = useState(true);

  if (!sequenceId || !functionName) {
    return <div>Pick something</div>;
  }

  const sequence = sequences[sequenceId];
  const fn = sequence.functions[functionName];
  const kind = sequence.kind;

  const firstEvent = fn.events[0];
  const focusLines = fn.events.map((e: any) => e.description.line);
  const matches = exceptions.filter((e: any) => {
    return isSameLocation(
      e.location[0],
      sequence.discrepancies[0].event.location[0]
    );
  });

  return (
    <div className="flex flex-col flex-grow overflow-auto gap-4 p-4">
      <div className="text-xs gap-2 flex">
        <div>View:</div>
        <button onClick={() => setSplit(true)}>split</button>
        <button onClick={() => setSplit(false)}>side-by-side</button>
      </div>
      <div>{fn.name}</div>
      <Exceptions exceptions={matches} />
      {split ? (
        <SplitFrame
          frame={firstEvent.description.frame}
          kind={kind}
          focusLines={focusLines}
        />
      ) : (
        <SideToSideFrame
          kind={kind}
          frame={firstEvent.description.frame}
          focusLines={focusLines}
        />
      )}
    </div>
  );
}

function getPreviewValue(error: any, key: string) {
  return error.preview.getterValues.find((v: any) => v.name === key).value;
}

function Exceptions({ exceptions }: { exceptions: any[] }) {
  if (!exceptions.length) {
    return null;
  }

  return (
    <div className="text-sm">
      {exceptions.map((e, i) => {
        const name = getPreviewValue(e.error, "name");
        const message = getPreviewValue(e.error, "message");
        const stack = getPreviewValue(e.error, "stack");

        return (
          <div key={i}>
            <div className="flex flex-row gap-2">
              <div>{name}</div>
              <div>{message}</div>
            </div>
            <div>{stack}</div>
          </div>
        );
      })}
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
      <div className="text-gray-500 truncate">
        {sequence.kind} {sequence.sequenceId}
      </div>
      <div className="pl-4 truncate">
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
    <button className="truncate" onClick={onClick}>
      {groupedFn.name}
    </button>
  );
}

function SideToSideFrame({
  frame,
  kind,
  focusLines,
}: {
  frame: any;
  kind: string;
  focusLines: number[];
}) {
  const failing = kind === "Missing" ? frame.otherPoints : frame.points;
  const passing = kind === "Missing" ? frame.points : frame.otherPoints;

  return (
    <div className="overflow-auto flex flex-row gap-4">
      <div>
        {failing.map((p, i) => (
          <Point
            key={i}
            point={p}
            altPoint={passing[i]}
            focusLines={focusLines}
            sideToSide
          />
        ))}
      </div>
    </div>
  );
}

function SplitFrame({
  frame,
  kind,
  focusLines,
}: {
  frame: any;
  kind: string;
  focusLines: number[];
}) {
  const failing = kind === "Missing" ? frame.otherPoints : frame.points;
  const passing = kind === "Missing" ? frame.points : frame.otherPoints;

  return (
    <div className="overflow-auto flex flex-row gap-4">
      <div>
        {failing.map((p, i) => (
          <Point key={i} point={p} focusLines={focusLines} failing={true} />
        ))}
      </div>
      <div>
        {passing.map((p, i) => (
          <Point key={i} point={p} focusLines={focusLines} failing={false} />
        ))}
      </div>
    </div>
  );
}

function Point({
  point,
  altPoint,
  focusLines,
  failing,
  sideToSide,
}: {
  point: any;
  altPoint: any;
  focusLines: number[];
  failing?: Boolean;
  sideToSide?: Boolean;
}) {
  let line;

  if (sideToSide) {
    line = (
      <div className="flex flex-row">
        <div
          className="bg-red-800 text-white justify-center flex"
          style={{ minWidth: "1rem" }}
        >
          {point.hits}
        </div>
        <div
          className="bg-green-800 text-white justify-center flex"
          title={point.altHits}
          style={{ minWidth: "1rem" }}
        >
          {altPoint.hits}
        </div>
      </div>
    );
  } else {
    line = (
      <div className="flex flex-row">
        {failing ? (
          <div
            className="bg-red-800 text-white justify-center flex"
            style={{ minWidth: "1rem" }}
          >
            {point.hits}
          </div>
        ) : (
          <div
            className="bg-green-800 text-white justify-center flex"
            title={point.altHits}
            style={{ minWidth: "1rem" }}
          >
            {point.hits}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-row font-mono text-xs text-gray-600">
      {point.breakable ? (
        line
      ) : (
        <div
          className="flex-shrink-0 invisible"
          style={{ minWidth: sideToSide ? "2rem" : "1rem" }}
        ></div>
      )}
      <div
        className={`flex flex-row ${
          focusLines.includes(point.location.line) ? "text-white" : ""
        }`}
      >
        <div
          style={{ minWidth: "2.5rem" }}
          className="flex justify-end bg-gray-800 px-1"
        >
          {point.location.line}
        </div>
        <div className="whitespace-pre">{point.text}</div>
      </div>
    </div>
  );
}
