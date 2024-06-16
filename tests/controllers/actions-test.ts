import mongoose from 'mongoose';
import Action from '../../src/controllers/lib/actions';
import RbModel from '../../src/models/rb';

fdescribe('Action', () => {
    let connection: any;
    let rbActions: any;
    beforeAll(async () => {
        const url = `mongodb://localhost/action_tests`;

        connection = await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

        rbActions = new Action(RbModel);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    });

    describe('create', () => {
        it('should create new rb when rb model instantiates actions', async () => {
            const result = await rbActions.create({
                name: 'create_rb_test',
                created: new Date(),
                user: 'some_user'
            });

            expect(result.res.get('user')).toBe('some_user');
        });

        it('should throw an error if root beer is already created', async () => {
            const result = await rbActions.create({
                name: 'create_rb_err_test',
                created: new Date(),
                user: 'some_user'
            });

            const result2 = await rbActions.create({
                name: 'create_rb_err_test',
                created: new Date(),
                user: 'some_user'
            });

            expect(result2.error).toBe(true);
        });
    });

    describe('delete', () => {
        it('should delete a doc', async () => {
            const addOne = await rbActions.create({
                name: 'create_rb_to_delete',
                created: new Date(),
                user: 'some_user'
            });

            const id = addOne.res.get('_id');

            const result = await rbActions.delete(id);

            expect(result.res).toEqual({ n: 1, ok: 1, deletedCount: 1 });
        });
    });

    describe('search', () => {
        it('should retrive doc based on search', async () => {
            await rbActions.create({
                name: 'create_rb_to_search',
                created: new Date(),
                user: 'some_user'
            });

            const result = await rbActions.search('name', 'create_rb_to_search');

            const name = result.res[0].get('name');

            expect(name).toBe('create_rb_to_search');
        });
    });

    describe('searchById', () => {
        it('should retrive doc based on id', async () => {
            const create = await rbActions.create({
                name: 'create_rb_to_search_by_id',
                created: new Date(),
                user: 'some_user'
            });

            const result = await rbActions.searchById(create.res.get('_id'));

            const name = result.res.get('name');

            expect(name).toBe('create_rb_to_search_by_id');
        });
    });

    describe('getAll', () => {
        it('should retrive all docs', async () => {
            await rbActions.create({
                name: 'create_rb_get_all1',
                created: new Date(),
                user: 'some_user'
            });

            await rbActions.create({
                name: 'create_rb_get_all2',
                created: new Date(),
                user: 'some_user'
            });

            const result = await rbActions.getAll();

            // plus one for all the tests
            expect(result.res.length).toBe(6);
        });
    });
});