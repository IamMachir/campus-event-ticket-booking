jest.mock('../src/models/eventModel');

const {
  getCategories,
  getCategoryById,
  searchEvents,
} = require('../src/models/eventModel');
const { listCategories, listEvents } = require('../src/controllers/eventController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('listEvents', () => {
  it('passes normalized search, category, and pagination to the model', async () => {
    getCategories.mockResolvedValue([{ id: 7, name: 'Technology' }]);
    searchEvents.mockResolvedValue({
      events: [{ id: 1, title: 'Tech Conference' }],
      total: 1,
    });

    const req = {
      query: {
        search: '  Tech  ',
        category: 'Technology',
        page: '2',
        limit: '20',
      },
    };
    const res = mockRes();

    await listEvents(req, res);

    expect(searchEvents).toHaveBeenCalledWith({
      search: 'Tech',
      categoryId: 7,
      view: 'all',
      page: 2,
      limit: 20,
    });
    expect(res.json).toHaveBeenCalledWith({
      events: [{ id: 1, title: 'Tech Conference' }],
      pagination: { page: 2, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it('rejects categories outside the controlled catalogue', async () => {
    const res = mockRes();

    await listEvents({ query: { category: 'Not A Category' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(searchEvents).not.toHaveBeenCalled();
  });

  it('allows an unfiltered first page', async () => {
    searchEvents.mockResolvedValue({ events: [], total: 0 });
    const res = mockRes();

    await listEvents({ query: {} }, res);

    expect(searchEvents).toHaveBeenCalledWith({
      search: '',
      categoryId: null,
      view: 'all',
      page: 1,
      limit: 12,
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    }));
  });

  it('rejects an unsupported discovery view', async () => {
    const res = mockRes();

    await listEvents({ query: { view: 'random' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(searchEvents).not.toHaveBeenCalled();
  });

  it('passes a supported discovery view to the model', async () => {
    searchEvents.mockResolvedValue({ events: [], total: 0 });
    const res = mockRes();

    await listEvents({ query: { view: 'today' } }, res);

    expect(searchEvents).toHaveBeenCalledWith(expect.objectContaining({ view: 'today' }));
  });
});

describe('listCategories', () => {
  it('returns the controlled category records', async () => {
    getCategories.mockResolvedValue([{ id: 1, name: 'Technology' }]);
    const res = mockRes();

    await listCategories({}, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Technology' }]);
  });
});