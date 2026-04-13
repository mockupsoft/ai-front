export const defaultHTML = `<!DOCTYPE html>
<html>
  <head>
    <title>My app</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="utf-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { background: #181a20; }
      .glass { background: #23242a; border-radius: 14px; }
      .vibe-badge { border: 1px solid #ffe06650; background: #23242a; color: #ffe066; font-weight: 600; }
      .neon { text-shadow: 0 0 1.5px #ffe066; }
    </style>
  </head>
  <body class="flex justify-center items-center h-screen overflow-hidden font-sans text-center px-6 text-white">
    <div class="w-full glass p-8">
      <span class="text-xs rounded-full mb-4 inline-block px-3 py-1 vibe-badge">MGX DeepSite</span>
      <h1 class="text-4xl lg:text-7xl font-black font-sans tracking-tight neon">
        <span class="text-2xl lg:text-4xl block font-bold text-neutral-400 mb-1">I'm ready to work,</span>
        Ask me anything.
      </h1>
    </div>
    <script></script>
  </body>
</html>
`;
