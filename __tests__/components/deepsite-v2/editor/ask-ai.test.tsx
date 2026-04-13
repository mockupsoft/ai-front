/**
 * AskAI — iskelet testleri (ağır alt bileşenler mock).
 */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { AskAI } from "@/components/deepsite-v2/editor/ask-ai";

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/deepsite/api-client", () => ({
  getStoredToken: () => null,
}));

jest.mock("@/components/deepsite-v2/invite-friends", () => ({
  InviteFriends: () => null,
}));

jest.mock("@/components/deepsite-v2/editor/ask-ai/settings", () => ({
  Settings: () => null,
  getStackType: () => "html" as const,
  StackTypeSelector: () => null,
}));

jest.mock("@/components/deepsite-v2/editor/ask-ai/re-imagine", () => ({
  ReImagine: () => null,
}));

jest.mock("@/components/deepsite-v2/loading", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/deepsite-v2/editor/ask-ai/selected-html-element", () => ({
  SelectedHtmlElement: () => null,
}));

jest.mock("@/components/deepsite-v2/editor/ask-ai/follow-up-tooltip", () => ({
  FollowUpTooltip: () => null,
}));

jest.mock("react-use", () => ({
  useLocalStorage: (_k: string, def: string) => [def, jest.fn()],
  useUpdateEffect: () => {},
}));

/** jsdom'da global Response yok; bileşen sadece ok + body.getReader kullanıyor. */
function mockOkStreamResponse(bodyText: string) {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(enc.encode(bodyText));
      controller.close();
    },
  });
  return {
    ok: true,
    status: 200,
    body: stream,
  };
}

const baseProps = {
  html: "",
  setHtml: jest.fn(),
  onScrollToBottom: jest.fn(),
  isAiWorking: false,
  setisAiWorking: jest.fn(),
  isEditableModeEnabled: false,
  selectedElement: null as HTMLElement | null,
  setSelectedElement: jest.fn(),
  setIsEditableModeEnabled: jest.fn(),
  onNewPrompt: jest.fn(),
  onSuccess: jest.fn(),
};

describe("AskAI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.HTMLMediaElement.prototype.play = jest
      .fn()
      .mockResolvedValue(undefined) as unknown as typeof window.HTMLMediaElement.prototype.play;
    global.fetch = jest.fn();
  });

  it("prompt alanını gösterir", () => {
    render(<AskAI {...baseProps} />);
    expect(
      screen.getByPlaceholderText(/Ask DeepSite anything/i)
    ).toBeInTheDocument();
  });

  it("isAiWorking iken input devre dışı", () => {
    render(<AskAI {...baseProps} isAiWorking />);
    expect(screen.getByPlaceholderText(/Ask DeepSite anything/i)).toBeDisabled();
  });

  it("isAiWorking ve dolu prompt ile gönder butonu devre dışı", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AskAI {...baseProps} isAiWorking={false} />);
    const input = screen.getByPlaceholderText(/Ask DeepSite anything/i);
    await user.type(input, "merhaba");

    rerender(<AskAI {...baseProps} isAiWorking />);

    const footer = document.querySelector(".px-4.pb-3");
    expect(footer).toBeTruthy();
    const buttons = within(footer as HTMLElement).getAllByRole("button");
    const submitBtn = buttons[buttons.length - 1];
    expect(submitBtn).toBeDisabled();
  });

  it("callAi başarılı akışta toast.success tetikler (fetch mock)", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue(
      mockOkStreamResponse(
        "<!DOCTYPE html><html><head></head><body><p>ok</p></body></html>"
      )
    );

    render(<AskAI {...baseProps} />);
    const input = screen.getByPlaceholderText(/Ask DeepSite anything/i);
    await user.type(input, "bir sayfa");

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("AI responded successfully");
    });
    expect(baseProps.onSuccess).toHaveBeenCalled();
  });

  it("callAi hata yanıtında toast.error tetikler", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      body: {},
      json: async () => ({ error: "Sunucu hatası" }),
    });

    render(<AskAI {...baseProps} />);
    await user.type(screen.getByPlaceholderText(/Ask DeepSite anything/i), "x");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
