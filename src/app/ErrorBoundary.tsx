import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorScreen } from './ErrorScreen';

interface Props {
  children: ReactNode;
  /** Bij een andere waarde (bijv. het pad) begint de grens opnieuw. */
  resetKey?: string;
  fullPage?: boolean;
}

interface State {
  error: unknown;
  hasError: boolean;
  resetKey: string | undefined;
}

/**
 * Vangt renderfouten op, zodat één kapotte pagina niet de hele app (en de navigatie) meeneemt.
 * Navigeren naar een andere pagina zet de grens terug.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, hasError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error, hasError: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey !== state.resetKey)
      return { error: null, hasError: false, resetKey: props.resetKey };
    return null;
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('[fout]', error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError)
      return <ErrorScreen error={this.state.error} fullPage={this.props.fullPage} />;
    return this.props.children;
  }
}
