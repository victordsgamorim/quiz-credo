/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable max-lines-per-function */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { LocaleProvider } from "@/contexts/LocaleContext";
import { supabase } from "@/lib/supabase";

import ResetPassword from "../ResetPassword";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      exchangeCodeForSession: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

const mockedVerifyOtp = vi.mocked(supabase.auth.verifyOtp);
const mockedGetSession = vi.mocked(supabase.auth.getSession);
const mockedUpdateUser = vi.mocked(supabase.auth.updateUser);

const navigateToResetPassword = (search = "") => {
  window.history.pushState({}, "", `/reset-password${search}`);
};

const renderResetPassword = () =>
  render(
    <LocaleProvider>
      <ResetPassword />
    </LocaleProvider>
  );

describe("ResetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateToResetPassword();
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the verifying state while resolving the link", () => {
    mockedGetSession.mockImplementation(() => new Promise(() => undefined));

    renderResetPassword();

    expect(screen.getByText("Verificando link de redefinição...")).toBeInTheDocument();
  });

  it("shows the form after verifying a recovery token hash", async () => {
    navigateToResetPassword("?token_hash=valid-token&type=recovery");
    mockedVerifyOtp.mockResolvedValue({ data: {}, error: null });

    renderResetPassword();

    expect(await screen.findByLabelText("Nova senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar nova senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redefinir senha" })).toBeInTheDocument();
    expect(mockedVerifyOtp).toHaveBeenCalledWith({
      token_hash: "valid-token",
      type: "recovery",
    });
  });

  it("shows the invalid link state when no recovery token or session exists", async () => {
    mockedGetSession.mockResolvedValue({ data: { session: null }, error: null });

    renderResetPassword();

    expect(await screen.findByText("Link inválido ou expirado")).toBeInTheDocument();
  });

  it("shows the invalid link state when the recovery token is rejected", async () => {
    navigateToResetPassword("?token_hash=expired&type=recovery");
    mockedVerifyOtp.mockResolvedValue({
      data: {},
      error: new Error("invalid request token"),
    });

    renderResetPassword();

    expect(await screen.findByText("Link inválido ou expirado")).toBeInTheDocument();
  });

  it("shows a mismatch error and skips the update when passwords differ", async () => {
    navigateToResetPassword("?token_hash=valid-token&type=recovery");
    mockedVerifyOtp.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    renderResetPassword();

    await user.type(await screen.findByLabelText("Nova senha"), "senha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "diferente");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(mockedUpdateUser).not.toHaveBeenCalled();
  });

  it("updates the password through the authenticated session and shows success", async () => {
    navigateToResetPassword("?token_hash=valid-token&type=recovery");
    mockedVerifyOtp.mockResolvedValue({ data: {}, error: null });
    mockedUpdateUser.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    renderResetPassword();

    await user.type(await screen.findByLabelText("Nova senha"), "senha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "senha123");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByText("Senha redefinida!")).toBeInTheDocument();
    expect(mockedUpdateUser).toHaveBeenCalledWith({ password: "senha123" });
  });

  it("shows an error message when the password update fails", async () => {
    navigateToResetPassword("?token_hash=valid-token&type=recovery");
    mockedVerifyOtp.mockResolvedValue({ data: {}, error: null });
    mockedUpdateUser.mockResolvedValue({
      data: {},
      error: new Error("weak password"),
    });
    const user = userEvent.setup();

    renderResetPassword();

    await user.type(await screen.findByLabelText("Nova senha"), "senha123");
    await user.type(screen.getByLabelText("Confirmar nova senha"), "senha123");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));

    expect(await screen.findByText("Não foi possível redefinir a senha. Tente novamente.")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Redefinir senha" })).toBeEnabled();
    });
  });
});
