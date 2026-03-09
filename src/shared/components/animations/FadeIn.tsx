import type { AnimatedEnterProps } from "./AnimatedEnter";
import { AnimatedEnter } from "./AnimatedEnter";

type Props = Omit<AnimatedEnterProps, "direction">;

export function FadeIn(props: Props) {
  return <AnimatedEnter {...props} direction={null} />;
}
