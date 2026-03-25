process.env.CLERK_SECRET_KEY = 'sk_test_123';

// Reset modules to ensure fresh require of the controller with our mock
vi.resetModules();

const mockGetUser = vi.fn();
vi.doMock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUser: mockGetUser,
    },
  },
}));

const { checkAdmin } = require('./admin.controller');

describe('admin.controller - checkAdmin', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      auth: { userId: 'user_123' },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
    process.env.ADMIN_EMAIL = 'admin@example.com';
    vi.clearAllMocks();
  });

  it('should return 401 if no userId is provided', async () => {
    req.auth = null;
    await checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ admin: false }));
  });

  it('should return admin: true if user email matches ADMIN_EMAIL', async () => {
    mockGetUser.mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'admin@example.com' },
    });

    await checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ admin: true }));
  });

  it('should return admin: false if user email does not match ADMIN_EMAIL', async () => {
    mockGetUser.mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'user@example.com' },
    });

    await checkAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ admin: false }));
  });
});
