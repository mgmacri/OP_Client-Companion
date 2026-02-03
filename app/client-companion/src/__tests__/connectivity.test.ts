import { subscribeToConnectivityChanges } from "../features/logForm/queue/connectivity";

describe("connectivity listener", () => {
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  const setGlobal = (key: string, value: unknown) => {
    Object.defineProperty(globalThis, key, {
      value,
      writable: true,
      configurable: true,
    });
  };

  afterEach(() => {
    setGlobal("window", originalWindow);
    setGlobal("navigator", originalNavigator);
  });

  it("triggers callback on online event", () => {
    const target = new EventTarget();
    const navigatorStub = {} as Navigator;
    Object.defineProperty(navigatorStub, "onLine", {
      value: false,
      writable: true,
      configurable: true,
    });

    setGlobal("window", target);
    setGlobal("navigator", navigatorStub);

    const onOnline = jest.fn();
    const unsubscribe = subscribeToConnectivityChanges(onOnline);

    expect(onOnline).toHaveBeenCalledTimes(0);

    Object.defineProperty(navigatorStub, "onLine", {
      value: true,
      writable: true,
      configurable: true,
    });
    target.dispatchEvent(new Event("online"));

    expect(onOnline).toHaveBeenCalledTimes(1);

    unsubscribe();

    target.dispatchEvent(new Event("online"));
    expect(onOnline).toHaveBeenCalledTimes(1);
  });
});
