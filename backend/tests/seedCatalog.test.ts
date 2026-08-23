describe('vehicle seed integrations', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    delete process.env.UNSPLASH_ACCESS_KEY;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('fetches an Unsplash photo URL when a valid API key is configured', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'demo-key';
    const mockedFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [{ urls: { regular: 'https://images.unsplash.com/unsplash-car' } }],
      }),
    });
    global.fetch = mockedFetch as typeof fetch;

    const { resolveVehicleImageUrl } = await import('../src/utils/vehicleSeed');

    await expect(resolveVehicleImageUrl('Toyota', 'Camry', 'Sedan')).resolves.toBe(
      'https://images.unsplash.com/unsplash-car',
    );
    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.unsplash.com/search/photos'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Client-ID demo-key',
        }),
      }),
    );
  });

  it('falls back to a category placeholder when Unsplash returns no results', async () => {
    process.env.UNSPLASH_ACCESS_KEY = 'demo-key';
    const mockedFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    global.fetch = mockedFetch as typeof fetch;

    const { resolveVehicleImageUrl } = await import('../src/utils/vehicleSeed');

    await expect(resolveVehicleImageUrl('Toyota', 'Model X', 'SUV')).resolves.toMatch(
      /https?:\/\//,
    );
  });

  it('maps real NHTSA makes and models into seed records', async () => {
    const mockedFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        Results: [
          { Make_ID: 1, Make_Name: 'Toyota', Model_Name: 'Camry', VehicleType: 'Passenger Car' },
          { Make_ID: 2, Make_Name: 'Honda', Model_Name: 'Civic', VehicleType: 'Passenger Car' },
        ],
      }),
    });
    global.fetch = mockedFetch as typeof fetch;

    const { fetchVehicleCatalog } = await import('../src/utils/vehicleSeed');

    await expect(fetchVehicleCatalog()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ make: 'Toyota', model: 'Camry', category: 'Passenger Car' }),
        expect.objectContaining({ make: 'Honda', model: 'Civic', category: 'Passenger Car' }),
      ]),
    );
  });
});
