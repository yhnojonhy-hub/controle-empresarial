import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingButtonState = "idle" | "loading" | "success" | "error";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  state?: LoadingButtonState;
  successMessage?: string;
  errorMessage?: string;
  onStateChange?: (state: LoadingButtonState) => void;
  showSuccessIcon?: boolean;
  showErrorIcon?: boolean;
  successDuration?: number;
  errorDuration?: number;
}

/**
 * LoadingButton Component
 *
 * Componente de botão reutilizável que fornece feedback visual durante operações assíncronas.
 * Suporta estados: idle, loading, success e error com ícones e animações.
 */
export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    {
      isLoading = false,
      state = "idle",
      successMessage,
      errorMessage,
      onStateChange,
      showSuccessIcon = true,
      showErrorIcon = true,
      successDuration = 2000,
      errorDuration = 3000,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const [displayState, setDisplayState] =
      React.useState<LoadingButtonState>(state);

    React.useEffect(() => {
      setDisplayState(state || (isLoading ? "loading" : "idle"));
      onStateChange?.(state || (isLoading ? "loading" : "idle"));
    }, [state, isLoading, onStateChange]);

    // Auto-reset success state
    React.useEffect(() => {
      if (displayState === "success") {
        const timer = setTimeout(() => {
          setDisplayState("idle");
          onStateChange?.("idle");
        }, successDuration);
        return () => clearTimeout(timer);
      }
    }, [displayState, successDuration, onStateChange]);

    // Auto-reset error state
    React.useEffect(() => {
      if (displayState === "error") {
        const timer = setTimeout(() => {
          setDisplayState("idle");
          onStateChange?.("idle");
        }, errorDuration);
        return () => clearTimeout(timer);
      }
    }, [displayState, errorDuration, onStateChange]);

    const isDisabled = disabled || displayState === "loading";

    const getButtonContent = () => {
      switch (displayState) {
        case "loading":
          return (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando...</span>
            </div>
          );
        case "success":
          return (
            <div className="flex items-center gap-2">
              {showSuccessIcon && <CheckCircle2 className="h-4 w-4" />}
              <span>{successMessage || "Sucesso!"}</span>
            </div>
          );
        case "error":
          return (
            <div className="flex items-center gap-2">
              {showErrorIcon && <AlertCircle className="h-4 w-4" />}
              <span>{errorMessage || "Erro!"}</span>
            </div>
          );
        default:
          return children;
      }
    };

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "transition-all duration-300",
          displayState === "success" && "bg-green-600 hover:bg-green-700",
          displayState === "error" && "bg-red-600 hover:bg-red-700",
          className
        )}
        {...props}
      >
        {getButtonContent()}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";
