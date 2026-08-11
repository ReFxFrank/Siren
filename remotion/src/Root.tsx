import "./design/fonts";
import { Composition } from "remotion";
import { DIMS } from "./lib/aspect";
import { FPS } from "./lib/timing";
import type { AspectId } from "./lib/types";
import { demoJob } from "./lib/demo";
import type { AssembledJob } from "./lib/types";
import { P0Sample } from "./templates/P0Sample";
import { T1Spotlight } from "./templates/T1Spotlight";
import { T2Tutorial60 } from "./templates/T2Tutorial60";
import { T3PriceFlex } from "./templates/T3PriceFlex";
import { T4Hype } from "./templates/T4Hype";
import { TokenShowcase } from "./templates/TokenShowcase";

const ASPECTS: AspectId[] = ["9x16", "16x9"];

/** Composition duration always follows the assembled job. */
const jobMetadata = ({ props }: { props: { job: AssembledJob } }) => ({
  durationInFrames: Math.round(props.job.durationSec * FPS),
});

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
      {ASPECTS.map((aspect) => (
        <Composition
          key={`tokens-${aspect}`}
          id={`TokenShowcase-${aspect}`}
          component={TokenShowcase}
          durationInFrames={FPS * 4}
          fps={FPS}
          width={DIMS[aspect].width}
          height={DIMS[aspect].height}
          defaultProps={{ aspect, debugSafeArea: false }}
        />
      ))}
      {ASPECTS.map((aspect) => (
        <Composition
          key={`t1-${aspect}`}
          id={`T1Spotlight-${aspect}`}
          component={T1Spotlight}
          durationInFrames={FPS * 27}
          fps={FPS}
          width={DIMS[aspect].width}
          height={DIMS[aspect].height}
          defaultProps={{ job: demoJob(aspect, "spotlight") }}
          calculateMetadata={jobMetadata}
        />
      ))}
      {ASPECTS.map((aspect) => (
        <Composition
          key={`t2-${aspect}`}
          id={`T2Tutorial60-${aspect}`}
          component={T2Tutorial60}
          durationInFrames={FPS * 50}
          fps={FPS}
          width={DIMS[aspect].width}
          height={DIMS[aspect].height}
          defaultProps={{ job: demoJob(aspect, "tutorial60") }}
          calculateMetadata={jobMetadata}
        />
      ))}
      {ASPECTS.map((aspect) => (
        <Composition
          key={`t3-${aspect}`}
          id={`T3PriceFlex-${aspect}`}
          component={T3PriceFlex}
          durationInFrames={FPS * 15}
          fps={FPS}
          width={DIMS[aspect].width}
          height={DIMS[aspect].height}
          defaultProps={{ job: demoJob(aspect, "priceflex") }}
          calculateMetadata={jobMetadata}
        />
      ))}
      {ASPECTS.map((aspect) => (
        <Composition
          key={`t4-${aspect}`}
          id={`T4Hype-${aspect}`}
          component={T4Hype}
          durationInFrames={FPS * 12}
          fps={FPS}
          width={DIMS[aspect].width}
          height={DIMS[aspect].height}
          defaultProps={{ job: demoJob(aspect, "hype") }}
          calculateMetadata={jobMetadata}
        />
      ))}
    </>
  );
};
