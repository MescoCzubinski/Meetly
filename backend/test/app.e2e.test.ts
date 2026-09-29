import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "bun:test";
import type { AddressInfo } from "node:net";
import type { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsAdapter } from "@nestjs/platform-ws";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { EmbeddingService } from "../src/interest/services/embedding.service";
import { FakeEmbeddingService } from "./fake-embedding";

let app: INestApplication;
let base: string;
const sockets: WebSocket[] = [];

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmbeddingService)
    .useValue(new FakeEmbeddingService())
    .overrideProvider(JwtService)
    .useValue(new JwtService({ secret: "secret" }))
    .compile();
  app = moduleRef.createNestApplication({ logger: false });
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(0);
  const { port } = app.getHttpServer().address() as AddressInfo;
  base = `127.0.0.1:${port}`;
});

afterEach(() => {
  for (const socket of sockets.splice(0)) socket.close();
});

afterAll(() => {
  void app.close();
});

function http(method: string, path: string, init: RequestInit = {}) {
  return fetch(`http://${base}${path}`, {
    method,
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

async function createSession() {
  const res = await http("POST", "/sessions");
  expect(res.status).toBe(201);
  return (await res.json()) as { code: string; hostToken: string };
}

async function register(code: string, name: string) {
  const res = await http("POST", `/sessions/${code}/participants`, {
    body: JSON.stringify({ name }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as { name: string; token: string };
}

function connect(path: string, query: string) {
  const socket = new WebSocket(`ws://${base}${path}?${query}`);
  sockets.push(socket);
  const inbox: unknown[] = [];
  const waiting: ((message: any) => void)[] = [];
  socket.onmessage = (e) => {
    const message = JSON.parse(e.data as string);
    const resolve = waiting.shift();
    if (resolve) resolve(message);
    else inbox.push(message);
  };
  const closed = new Promise<{ code: number; reason: string }>((resolve) => {
    socket.onclose = (e) => resolve({ code: e.code, reason: e.reason });
  });
  const opened = new Promise<void>((resolve) => {
    socket.onopen = () => resolve();
  });
  return {
    opened,
    closed,
    next: (): Promise<any> =>
      inbox.length > 0
        ? Promise.resolve(inbox.shift())
        : new Promise((resolve) => waiting.push(resolve)),
    send: (event: string, data: unknown) =>
      socket.send(JSON.stringify({ event, data })),
    close: () => socket.close(),
  };
}

describe("health", () => {
  test("GET /health", async () => {
    const res = await http("GET", "/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});

describe("sessions over HTTP", () => {
  test("creates and reads a session", async () => {
    const { code, hostToken } = await createSession();
    expect(code).toMatch(/^\d{6}$/);
    expect(hostToken).toBeString();

    const res = await http("GET", `/sessions/${code}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ code });
  });

  test("rejects malformed and unknown codes", async () => {
    expect((await http("GET", "/sessions/abc")).status).toBe(400);
    expect((await http("GET", "/sessions/000000")).status).toBe(404);
  });

  test("validates participant names", async () => {
    const { code } = await createSession();
    for (const body of [
      {},
      { name: "   " },
      { name: "A".repeat(21) },
      { name: 5 },
    ]) {
      const res = await http("POST", `/sessions/${code}/participants`, {
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(400);
    }
  });

  test("rejects registration into an unknown session", async () => {
    const res = await http("POST", "/sessions/000000/participants", {
      body: JSON.stringify({ name: "Ann" }),
    });
    expect(res.status).toBe(404);
  });

  test("only the host can end a session", async () => {
    const { code, hostToken } = await createSession();
    const { token } = await register(code, "Ann");

    expect((await http("DELETE", `/sessions/${code}`)).status).toBe(403);
    const asParticipant = await http("DELETE", `/sessions/${code}`, {
      headers: { "x-host-token": token },
    });
    expect(asParticipant.status).toBe(403);

    const asHost = await http("DELETE", `/sessions/${code}`, {
      headers: { "x-host-token": hostToken },
    });
    expect(asHost.status).toBe(204);
    expect((await http("GET", `/sessions/${code}`)).status).toBe(404);
  });
});

describe("websocket auth", () => {
  test("rejects invalid tokens on every gateway", async () => {
    for (const path of ["/session", "/interests", "/messages"]) {
      const { closed } = connect(path, "token=bad");
      expect(await closed).toEqual({ code: 4401, reason: "Invalid token" });
    }
  });

  test("rejects unknown sessions on /session", async () => {
    expect(await connect("/session", "code=abc").closed).toEqual({
      code: 4400,
      reason: "Code must be 6 digits long",
    });
    expect(await connect("/session", "code=000000").closed).toEqual({
      code: 4404,
      reason: "Session 000000 not found",
    });
  });

  test("rejects tokens for ended sessions", async () => {
    const { code, hostToken } = await createSession();
    const { token } = await register(code, "Ann");
    await http("DELETE", `/sessions/${code}`, {
      headers: { "x-host-token": hostToken },
    });

    for (const path of ["/interests", "/messages"]) {
      expect(await connect(path, `token=${token}`).closed).toEqual({
        code: 4404,
        reason: "Session not found",
      });
    }
  });
});

describe("interests", () => {
  test("answers are broadcast within the session", async () => {
    const { code } = await createSession();
    const ann = await register(code, "Ann");
    const bob = await register(code, "Bob");
    const other = await createSession();
    const cid = await register(other.code, "Cid");

    const annWs = connect("/interests", `token=${ann.token}`);
    const bobWs = connect("/interests", `token=${bob.token}`);
    const cidWs = connect("/interests", `token=${cid.token}`);
    expect(await annWs.next()).toEqual({
      event: "interests",
      data: { answers: [], links: [] },
    });
    await bobWs.next();
    await cidWs.next();

    annWs.send("interest", { interests: ["chess", "go"] });
    await annWs.next();
    await bobWs.next();

    bobWs.send("interest", { interests: ["Chess"] });
    const expected = {
      event: "interests",
      data: {
        answers: [
          { name: "Ann", interests: ["chess", "go"], active: true },
          { name: "Bob", interests: ["Chess"], active: true },
        ],
        links: [["Ann", "Bob", 1]],
      },
    };
    expect(await annWs.next()).toEqual(expected);
    expect(await bobWs.next()).toEqual(expected);

    cidWs.send("interest", { interests: ["go"] });
    expect((await cidWs.next()).data.answers).toEqual([
      { name: "Cid", interests: ["go"], active: true },
    ]);
  });

  test("invalid answers are rejected", async () => {
    const { code } = await createSession();
    const ann = await register(code, "Ann");
    const ws = connect("/interests", `token=${ann.token}`);
    await ws.next();

    const invalid = [
      { interests: [] },
      { interests: ["A".repeat(21)] },
      { interests: "chess" },
      { interests: [5] },
    ];
    for (const data of invalid) {
      ws.send("interest", data);
      expect(await ws.next()).toMatchObject({
        event: "exception",
        data: { status: "error", message: "Invalid interest" },
      });
    }

    ws.send("interest", { interests: ["go"] });
    expect((await ws.next()).data.answers).toEqual([
      { name: "Ann", interests: ["go"], active: true },
    ]);
  });

  test("a participant leaving the session is marked inactive", async () => {
    const { code } = await createSession();
    const ann = await register(code, "Ann");
    const bob = await register(code, "Bob");

    const annSession = connect("/session", `token=${ann.token}`);
    await annSession.opened;
    const annWs = connect("/interests", `token=${ann.token}`);
    const bobWs = connect("/interests", `token=${bob.token}`);
    await annWs.next();
    await bobWs.next();

    annWs.send("interest", { interests: ["chess"] });
    await bobWs.next();

    annSession.close();
    expect((await bobWs.next()).data.answers).toEqual([
      { name: "Ann", interests: ["chess"], active: false },
    ]);

    const rejoined = connect("/session", `token=${ann.token}`);
    await rejoined.opened;
    expect((await bobWs.next()).data.answers[0].active).toBe(true);
  });
});

describe("messages", () => {
  test("delivers to every socket of sender and recipient only", async () => {
    const { code } = await createSession();
    const ann = await register(code, "Ann");
    const bob = await register(code, "Bob");
    const cid = await register(code, "Cid");
    const other = await createSession();
    const otherBob = await register(other.code, "Bob");

    const annWs = connect("/messages", `token=${ann.token}`);
    const annTab = connect("/messages", `token=${ann.token}`);
    const bobWs = connect("/messages", `token=${bob.token}`);
    const cidWs = connect("/messages", `token=${cid.token}`);
    const otherBobWs = connect("/messages", `token=${otherBob.token}`);
    for (const ws of [annWs, annTab, bobWs, cidWs, otherBobWs])
      expect(await ws.next()).toEqual({ event: "messages", data: [] });

    annWs.send("message", { to: "Bob", text: "hi" });
    const expected = {
      event: "message",
      data: { from: "Ann", to: "Bob", text: "hi", sentAt: expect.any(Number) },
    };
    for (const ws of [annWs, annTab, bobWs])
      expect(await ws.next()).toEqual(expected);

    for (const [ws, from] of [
      [cidWs, "Cid"],
      [otherBobWs, "Bob"],
    ] as const) {
      ws.send("message", { to: from, text: "note to self" });
      expect((await ws.next()).data).toMatchObject({
        from,
        text: "note to self",
      });
    }
  });

  test("invalid messages and unknown recipients are rejected", async () => {
    const { code } = await createSession();
    const ann = await register(code, "Ann");
    await register(code, "Bob");
    const ws = connect("/messages", `token=${ann.token}`);
    await ws.next();

    const invalid = [
      { to: "Bob", text: "   " },
      { to: "Bob", text: "A".repeat(501) },
      { to: "Bob" },
      { to: "", text: "hi" },
    ];
    for (const data of invalid) {
      ws.send("message", data);
      expect(await ws.next()).toMatchObject({
        event: "exception",
        data: { message: "Invalid message" },
      });
    }

    ws.send("message", { to: "Zed", text: "hi" });
    expect(await ws.next()).toMatchObject({
      event: "exception",
      data: { message: "Unknown recipient" },
    });

    ws.send("message", { to: "Bob", text: "ok" });
    expect((await ws.next()).data).toMatchObject({ to: "Bob", text: "ok" });
  });

  test("history is replayed on reconnect", async () => {
    const { code } = await createSession();
    const ann = await register(code, "Ann");
    const bob = await register(code, "Bob");

    const annWs = connect("/messages", `token=${ann.token}`);
    await annWs.next();
    annWs.send("message", { to: "Bob", text: "hi" });
    await annWs.next();

    const bobWs = connect("/messages", `token=${bob.token}`);
    expect(await bobWs.next()).toEqual({
      event: "messages",
      data: [
        { from: "Ann", to: "Bob", text: "hi", sentAt: expect.any(Number) },
      ],
    });
  });
});

describe("ending a session", () => {
  test("closes every connected socket", async () => {
    const { code, hostToken } = await createSession();
    const ann = await register(code, "Ann");

    const clients = [
      connect("/session", `code=${code}`),
      connect("/session", `token=${ann.token}`),
      connect("/interests", `token=${ann.token}`),
      connect("/messages", `token=${ann.token}`),
    ];
    await Promise.all(clients.map((c) => c.opened));
    await clients[2].next();
    await clients[3].next();

    const res = await http("DELETE", `/sessions/${code}`, {
      headers: { "x-host-token": hostToken },
    });
    expect(res.status).toBe(204);

    for (const client of clients)
      expect(await client.closed).toEqual({
        code: 4410,
        reason: "Session ended",
      });
  });
});
