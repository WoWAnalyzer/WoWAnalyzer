export default interface Item {
    id: number;
    name?: string;
    icon: string;
    quality?: number;
};

export interface Enchant extends Item {
    effectId: number;
}

export interface ItemList<T extends Item = Item> {
    [key: string]: T
}
