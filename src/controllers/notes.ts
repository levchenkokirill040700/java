import { Request } from 'express';
import Actions from '../utils/db_actions';
import NotesModel from '../models/notes';
import Utils from './lib/rb_utils';

import * as I from '../interfaces';

class Notes {
    utils: Utils;
    action: Actions;
    conjunctions: string[];

    constructor() {
        this.conjunctions = [
            'for',
            'and',
            'nor',
            'but',
            'or',
            'yet',
            'so'
        ];

        this.utils = new Utils();
        this.action = new Actions(NotesModel);
    }

    async create(req: Request): Promise<I.Result> {
        const { user }: any = req;

        const note: Partial<I.Note> = {
            user: user._id,
            created: new Date(),
            title: req.body.title,
            content: req.body.content,
            tags: this._splitTags(req.body.tags)
        };

        return this.action.create(note);
    }

    async getUsersNotes(req: Request): Promise<I.Result> {
        const { user }: any = req;

        const notes = await this.action.search({ user: user._id });

        return this.formatNotes(notes);
    }

    async view(req: Request): Promise<I.Result> {
        return this.action.searchById(req.params.id);
    }

    async update(req: Request): Promise<I.Result> {
        const { user }: any = req;
    
        const note: Partial<I.Note> = {
            user: user._id,
            title: req.body.title,
            content: req.body.content,
            tags: this._splitTags(req.body.tags)
        };

        return this.action.update(req.params.id, note);
    }

    async delete(req: Request): Promise<I.Result> {
        return this.action.delete(req.params.id);
    }

    async searchTag(req: Request): Promise<I.Result> {
        const notes = await this.action.search({ tags: req.params.tag });

        return this.formatNotes(notes);
    }

    private formatNotes(result: I.Result): I.Result {
        if (result.error) return result;

        const asDocs = this.utils.getDocs(result.res);

        this.utils.formatDate(asDocs);

        return {
            res: asDocs
        }

    }

    private _splitTags(tags: string): string[] {
        return tags.split(' ').map((tag) => tag.trim())
            .filter((tag) => tag.length > 0 && !this.conjunctions.includes(tag));
    }
}

export = Notes;
