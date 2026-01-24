import { k } from ".";

const SPRITES = {
    pawopen : 'sprites/pawopen.png',
    pawclose : 'sprites/pawclose.png'
}

export function preloadAll(){
    // SPRITES
    for(const [key, value] of Object.entries(SPRITES)) k.loadSprite(key,value);
}