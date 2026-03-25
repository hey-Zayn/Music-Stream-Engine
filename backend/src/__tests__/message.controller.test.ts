import { vi, describe, it, expect, beforeEach } from 'vitest';

// ─── Top-level mocks ──────────────────────────────────────────
const mockGetUnreadCount = vi.fn();
const mockMessageFind = vi.fn();

vi.mock('../models/message.model', () => ({
    default: undefined,
    find: mockMessageFind,
    getUnreadCount: mockGetUnreadCount,
}));

vi.mock('../models/user.model', () => ({
    default: undefined,
    findOne: vi.fn().mockResolvedValue({ fullName: 'Test Sender' }),
}));

vi.mock('../models/notification.model', () => {
    function MockNotification(data: any) {
        Object.assign(this, data);
        (this as any)._id = 'notif_mock_id';
        (this as any).createdAt = new Date();
        (this as any).save = vi.fn().mockResolvedValue(this);
    }
    MockNotification.getUnreadCount = vi.fn().mockResolvedValue(0);
    return { default: MockNotification };
});

const Message = require('../models/message.model');
const { sendMessage, getUnreadCount } = require('../controllers/message.controller');

describe('message.controller', () => {
    let req: any, res: any, next: any;

    beforeEach(() => {
        req = {
            auth: { userId: 'clerk_sender_123' },
            body: { receiverId: 'clerk_receiver_456', content: 'Hello World' },
            app: { get: vi.fn().mockReturnValue(null) },
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
        next = vi.fn();
        vi.clearAllMocks();
    });

    // ─────────────────────────────────────────────
    // sendMessage — Input Validation
    // ─────────────────────────────────────────────
    describe('sendMessage', () => {
        it('should return 400 if receiverId is missing', async () => {
            req.body = { content: 'Hello' };
            await sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
        });

        it('should return 400 if content is an empty string', async () => {
            req.body = { receiverId: 'clerk_receiver_456', content: '' };
            await sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if content is only whitespace', async () => {
            req.body = { receiverId: 'clerk_receiver_456', content: '   ' };
            await sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 400 if receiverId is an empty string', async () => {
            req.body = { receiverId: '', content: 'Hello' };
            await sendMessage(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    // ─────────────────────────────────────────────
    // getUnreadCount
    // ─────────────────────────────────────────────
    describe('getUnreadCount', () => {
        it('should return 200 with unread count for authenticated user', async () => {
            Message.getUnreadCount = vi.fn().mockResolvedValue(5);
            await getUnreadCount(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, count: 5 }));
        });

        it('should return count of 0 when no unread messages exist', async () => {
            Message.getUnreadCount = vi.fn().mockResolvedValue(0);
            await getUnreadCount(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 0 }));
        });

        it('should call next() when the database throws an error', async () => {
            Message.getUnreadCount = vi.fn().mockRejectedValue(new Error('DB Error'));
            await getUnreadCount(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
