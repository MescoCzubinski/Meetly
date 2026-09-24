// Compiles the app into a single standalone executable: dist/server
await Bun.build({
  entrypoints: ["src/main.ts"],
  compile: { outfile: "dist/server" },
  // Optional NestJS packages we don't use; Nest only loads them if installed
  external: ["@nestjs/microservices", "@nestjs/platform-socket.io"],
});
