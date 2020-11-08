import {
  bench,
  BenchmarkRunError,
  BenchmarkRunProgress,
  clearBenchmarks,
  ProgressState,
  runBenchmarks,
} from "./std/testing/bench.ts";

bench({
  name: "runs100ForIncrementX1e6",
  runs: 100,
  func(b: any): void {
    b.start();
    for (let i = 0; i < 1e6; i++);
    b.stop();
  },
});

bench({
  name: "runs100ForIncrementX1e6-2",
  only: true,
  runs: 100,
  func(b: any): void {
    b.start();
    for (let i = 0; i < 1e6; i++);
    b.stop();
  },
});

bench({
  name: "runs100ForIncrementX1e6-3",
  runs: 100,
  func(b: any): void {
    b.start();
    for (let i = 0; i < 1e6; i++);
    b.stop();
  },
});

await runBenchmarks({ silent: false });
