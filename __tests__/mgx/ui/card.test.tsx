import React from "react";
import { render, screen } from "@testing-library/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";

describe("Card components", () => {
  it("renders Card with children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders complete card structure", () => {
    render(
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </div>
        </CardHeader>
        <CardContent>Card Content</CardContent>
      </Card>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom className to CardHeader", () => {
    const { container } = render(
      <CardHeader className="custom-header">Header</CardHeader>,
    );
    expect(container.firstChild).toHaveClass("custom-header");
  });
});
