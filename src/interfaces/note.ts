export interface Note {
    user: string;
    id: string;
    created: Date;
    content: string;
    title: string;
    tags?: string[];
}