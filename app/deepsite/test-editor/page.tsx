"use client";
/**
 * Geliştirici test sayfası — AppEditor'ı mock veriyle render eder.
 * Backend gerekmez; plan maddelerini tarayıcıda doğrulamak için kullanılır.
 *
 * URL: http://localhost:3002/deepsite/test-editor
 */
import { AppEditor } from "@/components/deepsite-v2/editor";

const MOCK_PROJECT = {
  id: "test-project-001",
  title: "Test Projesi",
  html: "<!DOCTYPE html><html><body><h1>Merhaba Dünya</h1></body></html>",
  prompts: [],
  user_id: "test-user",
  space_id: "local",
};

export default function TestEditorPage() {
  return (
    <AppEditor
      project={MOCK_PROJECT}
      initialChatHistory={null}
      projectFiles={null}
      initialLiveUrl={null}
    />
  );
}
