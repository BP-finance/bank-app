import type { AnimatedEnterProps } from "./AnimatedEnter";
import { AnimatedEnter } from "./AnimatedEnter";

type Props = Omit<AnimatedEnterProps, "direction">;

export function FadeInDown(props: Props) {
  return <AnimatedEnter {...props} direction="down" />;
}
