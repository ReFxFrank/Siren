import "./design/fonts";
import { Composition } from "remotion";
import { DIMS } from "./lib/aspect";
import { FPS } from "./lib/timing";
import type { AspectId } from "./lib/types";
import { P0Sample } from "./templates/P0Sample";

const ASPECTS: AspectId[] = ["9x16", "16x9"];

export const Root: React.FC = () => {
  return (
    <>
      {ASPECTS.map((aspect) => (
        <Composition
          key={`p0-${aspect}`}
          id={`P0Sample-${aspect}`}
          component={P0Sample}
          durationInFrames={FPS * 6}
          fps={FPS}
          width={DIMS[aspect].width}
          height={DIMS[aspect].height}
          defaultProps={{ aspect }}
        />
      ))}
    </>
  );
};
