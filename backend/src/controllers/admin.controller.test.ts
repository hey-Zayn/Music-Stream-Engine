import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as clerk from '@clerk/express';
import { checkAdmin } from './admin.controller';

describe('admin.controller - checkAdmin', () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_51MzS2XSCXk1fP8BkJZ1t2y3u4v5w6x7y8z9a');
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    req = {
      auth: { userId: 'user_123' },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn((err) => {
      if (err) console.error('DEBUG: next() called with error:', err);
    });
    vi.clearAllMocks();
  });

  it('should return 401 if no userId is provided', async () => {
    req.auth = null;
    await (checkAdmin as any)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return admin: true if user email matches ADMIN_EMAIL', async () => {
    vi.spyOn(clerk.clerkClient.users, 'getUser').mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'admin@example.com' },
    } as any);

    await (checkAdmin as any)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ admin: true }));
  });

  it('should return admin: false if user email does not match ADMIN_EMAIL', async () => {
    vi.spyOn(clerk.clerkClient.users, 'getUser').mockResolvedValue({
      primaryEmailAddress: { emailAddress: 'user@example.com' },
    } as any);

    await (checkAdmin as any)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ admin: false }));
  });
});
