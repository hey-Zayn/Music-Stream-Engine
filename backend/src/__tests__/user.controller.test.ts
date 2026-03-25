import { vi, describe, it, expect, beforeEach } from 'vitest';

const User = require('../models/user.model');
const Message = require('../models/message.model');

vi.mock('../models/user.model', () => ({ default: { find: vi.fn() } }));
vi.mock('../models/message.model', () => ({
    default: { find: vi.fn(), sort: vi.fn() }
}));

const { getAllUser, getMessage } = require('../controllers/user.controller');

describe('user.controller', () => {
    let req: any, res: any, next: any;

    beforeEach(() => {
        req = {
            auth: { userId: 'clerk_user_abc123' },
            params: {},
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // getAllUser
    // ─────────────────────────────────────────────
    describe('getAllUser', () => {
        it('should return 200 with a list of users (excluding current user)', async () => {
            const mockUsers = [
                { clerkId: 'clerk_user_xyz', fullName: 'Alice' },
                { clerkId: 'clerk_user_def', fullName: 'Bob' },
            ];
            User.find = vi.fn().mockResolvedValue(mockUsers);

            await getAllUser(req, res, next);

            expect(User.find).toHaveBeenCalledWith({
                clerkId: { $ne: 'clerk_user_abc123' },
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, user: mockUsers })
            );
        });

        it('should return an empty array when no other users exist', async () => {
            User.find = vi.fn().mockResolvedValue([]);

            await getAllUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ user: [] })
            );
        });

        it('should call next() with error when database fails', async () => {
            const dbError = new Error('DB connection failed');
            User.find = vi.fn().mockRejectedValue(dbError);

            await getAllUser(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should call next() if req.auth is null', async () => {
            req.auth = null;
            await getAllUser(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────────────
    // getMessage
    // ─────────────────────────────────────────────
    describe('getMessage', () => {
        beforeEach(() => {
            req.params = { userId: 'clerk_user_xyz' };
        });

        it('should return 200 with sorted messages between two users', async () => {
            const mockMessages = [
                { senderId: 'clerk_user_abc123', receiverId: 'clerk_user_xyz', content: 'Hello!' },
                { senderId: 'clerk_user_xyz', receiverId: 'clerk_user_abc123', content: 'Hi there!' },
            ];
            const sortMock = vi.fn().mockResolvedValue(mockMessages);
            Message.find = vi.fn().mockReturnValue({ sort: sortMock });

            await getMessage(req, res, next);

            expect(Message.find).toHaveBeenCalledWith({
                $or: [
                    { senderId: 'clerk_user_xyz', receiverId: 'clerk_user_abc123' },
                    { senderId: 'clerk_user_abc123', receiverId: 'clerk_user_xyz' },
                ],
            });
            expect(sortMock).toHaveBeenCalledWith({ createdAt: 1 });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMessages);
        });

        it('should return 200 with an empty array when no messages exist', async () => {
            Message.find = vi.fn().mockReturnValue({ sort: vi.fn().mockResolvedValue([]) });

            await getMessage(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        it('should call next() with error on database failure', async () => {
            const dbError = new Error('MongoDB query failed');
            Message.find = vi.fn().mockReturnValue({ sort: vi.fn().mockRejectedValue(dbError) });

            await getMessage(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });

        it('should sort messages in ascending createdAt order', async () => {
            const sortSpy = vi.fn().mockResolvedValue([]);
            Message.find = vi.fn().mockReturnValue({ sort: sortSpy });

            await getMessage(req, res, next);

            expect(sortSpy).toHaveBeenCalledWith({ createdAt: 1 });
        });
    });
});
