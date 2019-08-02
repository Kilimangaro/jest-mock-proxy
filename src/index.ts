export const jestProxy = <T>() => {
  const cache = new Map<any, jest.Mock>();
  const handler: ProxyHandler<object> = {
    get: (_, name) => {
      if (!cache.has(name)) {
        cache.set(name, jest.fn(() => new Proxy({}, handler)));
      }
      return cache.get(name);
    },
    set: (_, name, v) => {
      cache.set(name, v);
      return true;
    },
  };
  const mockProxy = jest.fn(() => new Proxy({}, handler) as jest.Mocked<T>);
  return mockProxy();
};

export const jestProxyFromMock = <T extends new (...args: any[]) => any>(
  mock: T
) => {
  if (!jest.isMockFunction(mock)) {
    throw new Error(
      `Expected ${mock} to be a jest mock.\n` +
        `If you want to mock a module, make sure you have called "jest.mock('<module name>')".`
    );
  }

  const mockProxy = jestProxy<InstanceType<T>>();
  mock.mockImplementation(() => mockProxy);
  return mockProxy;
};
