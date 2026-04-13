/**
 * AppEditor — smoke / yapı testleri (ağır bağımlılıklar mock).
 */
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { AppEditor } from "@/components/deepsite-v2/editor";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: ComponentProps<"img">) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

jest.mock("react-use", () => ({
  useLocalStorage: () => ["", jest.fn(), jest.fn()],
  useCopyToClipboard: () => ["", jest.fn()],
  useEvent: () => {},
  useMount: (fn: () => void) => {
    fn();
  },
  useUnmount: () => {},
  useUpdateEffect: () => {},
}));

jest.mock("@/hooks/deepsite/useEditor", () => ({
  useEditor: () => ({
    html: "<!DOCTYPE html><html><body>test</body></html>",
    setHtml: jest.fn(),
    htmlHistory: [],
    setHtmlHistory: jest.fn(),
    prompts: [],
    setPrompts: jest.fn(),
  }),
}));

jest.mock("@/components/deepsite-v2/editor/footer", () => ({
  Footer: () => <footer data-testid="footer-mock" />,
}));
jest.mock("@/components/deepsite-v2/editor/preview", () => ({
  Preview: () => <div data-testid="preview-mock" />,
}));
jest.mock("@/components/deepsite-v2/editor/ask-ai", () => ({
  AskAI: () => <div data-testid="ask-ai-mock" />,
}));
jest.mock("@/components/deepsite-v2/editor/save-button", () => ({
  SaveButton: () => <button type="button">Save</button>,
}));
jest.mock("@/components/deepsite-v2/my-projects/load-project", () => ({
  LoadProject: () => null,
}));

describe("AppEditor", () => {
  it("renders without project", () => {
    render(<AppEditor project={null} />);
    expect(screen.getByTestId("ask-ai-mock")).toBeInTheDocument();
  });

  it("plan: Header’da Chat, Preview ve Files sekmeleri (gerçek Header)", () => {
    render(<AppEditor project={null} />);
    expect(screen.getByTestId("deepsite-tab-chat")).toBeInTheDocument();
    expect(screen.getByTestId("deepsite-tab-preview")).toBeInTheDocument();
    expect(screen.getByTestId("deepsite-tab-files")).toBeInTheDocument();
  });
});
