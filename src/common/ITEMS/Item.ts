export default interface Item {
    id: number,
    name: string,
    icon: string,
};

export interface Enchant extends Item {
    effectId: number;
}

export interface ItemList<T extends Item = Item> {
    [key: string]: T
}
