Deno.test({
  name: "Example use of 'only' flag 3",
  only: true,
  fn() {},
});

Deno.test({
  name: "Example use of 'only' flag",
  only: true,
  fn() {},
});

Deno.test({
  name: "Example use of 'only' flag 2",
  fn() {},
});
