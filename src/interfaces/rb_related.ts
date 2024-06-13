export interface User {
    username: string;
    password: string;
    role: string;
    registered: Date;
    active: boolean;
    _id: string;
}

interface RBEntity{
    created: Date | string;
    user: string;
}

export interface RootBeer extends RBEntity {
    _id: string;
    name: string;
    image?: string;
    rating?: number;
    rank?: number;
    popular?: number;
    write_up?: string;
    title?: string;
}

interface RBOwned extends RBEntity {
    rb_id: string;
    rb_name?: string;
}

export interface Rating extends RBOwned {
    branding: number;
    after_taste: number;
    aroma: number;
    bite: number;
    carbonation: number;
    flavor: number;
    smoothness: number;
    sweetness: number;
    total: number;
    comment: string;
}

export interface WriteUp extends RBOwned {
    write_up: string;
}