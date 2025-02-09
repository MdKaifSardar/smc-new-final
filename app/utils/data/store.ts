import { atom } from "jotai";

export const hamburgerMenuState = atom<boolean>(false);
export const cartMenuState = atom<boolean>(false);
export const accountMenuState = atom<boolean>(false);

// Add wishlist state
export const wishlistState = atom<any[]>([]);
export const wishlistCountState = atom(0);

// Add cart state
export const cartItemsState = atom<any[]>([]);

// New atoms for auto storing measurement input
export const savedShirtMeasurementsState = atom<any>(null);
export const savedBodyMeasurementsState = atom<any>(null);
