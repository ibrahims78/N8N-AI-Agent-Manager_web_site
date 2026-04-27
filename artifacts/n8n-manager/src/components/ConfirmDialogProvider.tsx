import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

type Resolver = (value: boolean) => void;

const ConfirmContext = createContext<
  ((opts: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({ title: "" });
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOpts(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleResolve = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOpen(false);
  }, []);

  const isDestructive = opts.variant === "destructive";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleResolve(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{opts.title}</AlertDialogTitle>
            {opts.description && (
              <AlertDialogDescription>
                {opts.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleResolve(false)}>
              {opts.cancelText ?? "إلغاء"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleResolve(true)}
              className={cn(
                isDestructive &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive",
              )}
            >
              {opts.confirmText ?? "تأكيد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return ctx;
}
