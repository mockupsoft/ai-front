/**
 * DeepSite v2 Header — plan: Chat | Preview | Files sekmeleri (gerçek bileşen).
 */
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/deepsite-v2/editor/header";

jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: ComponentProps<"img">) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...props} />;
  },
}));

describe("DeepSite Header (plan uyumu)", () => {
  it("Chat, Preview ve Files sekmelerini ve test id’lerini sunar", () => {
    const onNewTab = jest.fn();
    render(
      <Header tab="chat" onNewTab={onNewTab}>
        <span>actions</span>
      </Header>
    );

    expect(screen.getByTestId("deepsite-tab-chat")).toBeInTheDocument();
    expect(screen.getByTestId("deepsite-tab-preview")).toBeInTheDocument();
    expect(screen.getByTestId("deepsite-tab-files")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /files/i })).toBeInTheDocument();

    expect(screen.getByRole("tablist", { name: /editör görünümleri/i })).toBeInTheDocument();
  });

  it("Files sekmesine tıklanınca onNewTab(\"files\") çağrılır", async () => {
    const user = userEvent.setup();
    const onNewTab = jest.fn();
    render(
      <Header tab="preview" onNewTab={onNewTab}>
        {null}
      </Header>
    );
    await user.click(screen.getByTestId("deepsite-tab-files"));
    expect(onNewTab).toHaveBeenCalledWith("files");
  });
});
