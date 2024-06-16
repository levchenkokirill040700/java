import mongoose from 'mongoose';
import User from '../../src/controllers/user';

describe('ratings', () => {
    let connection: any;
    const user = new User();

    beforeAll(async () => {
        const url = `mongodb://localhost/user_controller`;

        connection = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('create', () => {
        it('should create a new user', async () => {

            const req: any = {
                body: {
                    username: 'test_user',
                    password: 'test-pass',
                    role: 'user'
                }
            }
            
            const newUser = await user.create(req);
            
            expect(newUser.res).toBeDefined();
        });
    });

    describe('resetPassword', () => {
        it('should updated the password for a user', async () => {

            const req: any = {
                user: { username: 'test_user' },
                body: {
                    current_password: 'test-pass',
                    new_password: 'another_password'
                }
            }
            
            const newUser = await user.resetPassword(req);
            
            expect(newUser.res).toBe('password reset successfully');
        });
    });
});
