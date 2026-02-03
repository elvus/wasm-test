import { Hono } from "hono";
import { fire } from "@bytecodealliance/jco-std/wasi/0.2.6/http/adapters/hono/server";

const app = new Hono();

app.get("/hello", (c) => {
  return c.json({ message: "Hello from WebAssembly!" });
});

app.post("/post", (c) => {
  return c.json({ message: "POST request from WebAssembly!" });
});

app.post("/users", async (c) => {
  const responses = await fetch("https://jsonplaceholder.typicode.com/users");
  return c.json(responses);
});

fire(app);

// Although we've called `fire()` with wasi HTTP configured for use above,
// we still need to actually export the `wasi:http/incoming-handler` interface object,
// as jco and componentize-js will be looking for the ES module export that matches the WASI interface.
export { incomingHandler } from "@bytecodealliance/jco-std/wasi/0.2.6/http/adapters/hono/server";
