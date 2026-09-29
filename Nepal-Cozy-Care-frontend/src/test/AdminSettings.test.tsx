import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import AdminSettings from "../pages/admin/AdminSettings";

vi.mock("../components/admin/AdminLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
afterEach(() => vi.unstubAllGlobals());

it("changes the login password through the account endpoint and retains the rotated session token", async () => {
  const account = { id: 1, name: "Admin", email: "admin@example.com" };
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => new Response(JSON.stringify(
    options?.method === "PUT" ? { message: "Password updated", token: "replacement-token", user: account }
      : { data: { account, mail: {} } }
  )));
  vi.stubGlobal("fetch", fetchMock);
  render(<MemoryRouter><AdminSettings /></MemoryRouter>);
  fireEvent.change(await screen.findByLabelText("Current password"), { target: { value: "old-password" } });
  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));
  await waitFor(() => expect(localStorage.getItem("token")).toBe("replacement-token"));
  expect(fetchMock.mock.calls.find(([, options]) => options?.method === "PUT")?.[0]).toMatch(/\/api\/me\/password$/);
  expect(screen.getByLabelText("Current password")).toHaveValue("");
});

it("lets the admin replace SMTP credentials and preserves the saved password on subsequent saves", async () => {
  const mail = { mail_enabled: true, mail_host: "smtp.gmail.com", mail_port: 587,
    mail_username: "old@gmail.com", mail_password_configured: true, mail_encryption: "tls",
    mail_from_address: "old@gmail.com", mail_from_name: "Cozy", contact_recipient: "admin@example.com", is_configured: true };
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => new Response(JSON.stringify({
    message: "Saved", data: { account: { id: 1, name: "Admin", email: "admin@example.com" },
      mail: { ...mail, ...(options?.body ? JSON.parse(String(options.body)) : {}) } },
  })));
  vi.stubGlobal("fetch", fetchMock);
  render(<MemoryRouter><AdminSettings /></MemoryRouter>);
  fireEvent.change(await screen.findByLabelText("SMTP username / Gmail address"), { target: { value: "new@gmail.com" } });
  fireEvent.change(screen.getByLabelText("SMTP password / Google App Password"), { target: { value: "new app password" } });
  fireEvent.change(screen.getByLabelText("Encryption"), { target: { value: "ssl" } });
  fireEvent.click(screen.getByRole("button", { name: "Save SMTP settings" }));
  await waitFor(() => expect(fetchMock.mock.calls.filter(([, options]) => options?.method === "PUT")).toHaveLength(1));
  const first = fetchMock.mock.calls.find(([, options]) => options?.method === "PUT")!;
  expect(JSON.parse(String(first[1]?.body))).toMatchObject({ mail_username: "new@gmail.com", mail_password: "new app password", mail_encryption: "ssl" });
  await waitFor(() => expect(screen.getByLabelText("SMTP password / Google App Password")).toHaveValue(""));
  fireEvent.click(screen.getByRole("button", { name: "Save SMTP settings" }));
  await waitFor(() => expect(fetchMock.mock.calls.filter(([, options]) => options?.method === "PUT")).toHaveLength(2));
  const second = fetchMock.mock.calls.filter(([, options]) => options?.method === "PUT")[1];
  expect(JSON.parse(String(second[1]?.body))).not.toHaveProperty("mail_password");
});
