import 'styled-components';
import { theme } from '@/containers/App';

type Theme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
