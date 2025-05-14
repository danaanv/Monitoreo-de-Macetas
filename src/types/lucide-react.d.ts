declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  
  export const Thermometer: FC<IconProps>;
  export const Droplet: FC<IconProps>;
  export const Home: FC<IconProps>;
  export const Monitor: FC<IconProps>;
  export const BarChart2: FC<IconProps>;
  export const LineChart: FC<IconProps>;
}
