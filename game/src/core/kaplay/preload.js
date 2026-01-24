import { k } from ".";

const SPRITES = {
    pawopen : 'sprites/pawopen.png',
    pawclose : 'sprites/pawclose.png',
    idle: 'sprites/idle.png',
    hurt: 'sprites/hurt.png',
    happy: 'sprites/happy.png',
    jump: 'sprites/jump.png'
}

const BACKGROUNDS = {
    bgroom : 'bg/bgroom.png'
}

export function preloadAll(){
    // SPRITES
    for(const [key, value] of Object.entries(SPRITES)) k.loadSprite(key,value);

    // BGs
    for(const [key, value] of Object.entries(BACKGROUNDS)) k.loadSprite(key,value);
}