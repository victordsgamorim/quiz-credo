import { useEffect, useState } from "react";

import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";
import { supabase } from "@/lib/supabase";

type ResetStep = "verifying" | "ready" | "invalid" | "success";

const MIN_PASSWORD_LENGTH = 6;

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onChange: (value: string) => void;
  showPasswordLabel: string;
  hidePasswordLabel: string;
  autoComplete: string;
};

const PasswordField = ({
  id,
  label,
  value,
  isVisible,
  onToggleVisibility,
  onChange,
  showPasswordLabel,
  hidePasswordLabel,
  autoComplete,
}: PasswordFieldProps) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-muted-foreground">
      {label}
    </label>
    <div className="relative">
      <Input
        id={id}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

type StatusMessageProps = {
  icon: React.ReactNode;
  title: string;
  message: string;
};

const StatusMessage = ({ icon, title, message }: StatusMessageProps) => (
  <div className="text-center">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h1 className="mb-3 text-2xl font-bold gold-text">{title}</h1>
    <p className="mb-6 text-muted-foreground">{message}</p>
  </div>
);

// eslint-disable-next-line max-lines-per-function
const ResetPassword = () => {
  const { t } = useLocale();
  const [step, setStep] = useState<ResetStep>("verifying");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const resolveRecoverySession = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      const code = params.get("code");

      try {
        if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          setStep(error ? "invalid" : "ready");
          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          setStep(error ? "invalid" : "ready");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        setStep(session ? "ready" : "invalid");
      } catch (error) {
        console.error("[ResetPassword] Failed to resolve recovery session:", error);
        setStep("invalid");
      }
    };

    void resolveRecoverySession();
  }, []);

  const validatePassword = (): string | null => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return t.resetPassword.passwordMinLength;
    }
    if (newPassword !== confirmPassword) {
      return t.resetPassword.passwordMismatch;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validatePassword();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error("[ResetPassword] Password update failed:", error);
        setFormError(t.resetPassword.updateFailed);
        return;
      }
      setStep("success");
    } catch (error) {
      console.error("[ResetPassword] Password update threw:", error);
      setFormError(t.resetPassword.updateFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "verifying") {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-safe">
        <div className="glass-card w-full max-w-sm p-8 text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">{t.resetPassword.verifying}</p>
        </div>
      </main>
    );
  }

  if (step === "invalid") {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-safe">
        <div className="glass-card w-full max-w-sm p-8">
          <StatusMessage
            icon={<ShieldAlert className="h-12 w-12 text-destructive" />}
            title={t.resetPassword.invalidTitle}
            message={t.resetPassword.invalidMessage}
          />
          <a
            href="/"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t.common.backHome}
          </a>
        </div>
      </main>
    );
  }

  if (step === "success") {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-safe">
        <div className="glass-card w-full max-w-sm p-8">
          <StatusMessage
            icon={<CheckCircle2 className="h-12 w-12 text-success" />}
            title={t.resetPassword.successTitle}
            message={t.resetPassword.successMessage}
          />
          <a
            href="/"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t.common.backHome}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-safe">
      <div className="glass-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <KeyRound className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="mb-2 text-2xl font-bold gold-text">{t.resetPassword.title}</h1>
          <p className="text-sm text-muted-foreground">{t.resetPassword.subtitle}</p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4" noValidate>
          <PasswordField
            id="new-password"
            label={t.resetPassword.newPassword}
            value={newPassword}
            isVisible={isNewPasswordVisible}
            onToggleVisibility={() => setIsNewPasswordVisible((visible) => !visible)}
            onChange={setNewPassword}
            showPasswordLabel={t.resetPassword.showPassword}
            hidePasswordLabel={t.resetPassword.hidePassword}
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm-password"
            label={t.resetPassword.confirmPassword}
            value={confirmPassword}
            isVisible={isConfirmPasswordVisible}
            onToggleVisibility={() => setIsConfirmPasswordVisible((visible) => !visible)}
            onChange={setConfirmPassword}
            showPasswordLabel={t.resetPassword.showPassword}
            hidePasswordLabel={t.resetPassword.hidePassword}
            autoComplete="new-password"
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.resetPassword.submitting}
              </>
            ) : (
              t.resetPassword.submit
            )}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;
