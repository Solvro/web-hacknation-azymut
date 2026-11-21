export default {
  output: process.env.AZYMUT_STANDALONE === "1" ? "standalone" : undefined,
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/api/asystent": ["./data/knowledge.json"],
    "/api/do-podpisu": ["./assets/fonts/NotoSans-Regular.ttf"],
    "/api/arkusze": ["./assets/fonts/NotoSans-Regular.ttf"],
  },
};
