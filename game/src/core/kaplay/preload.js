import { k } from ".";

const SPRITES = {
    pawopen : 'sprites/pawopen.png',
    pawclose : 'sprites/pawclose.png',
    idle: 'sprites/idle.png',
    hurt: 'sprites/hurt.png',
    happy: 'sprites/happy.png',
    jump: 'sprites/jump.png',
    bee0: 'sprites/bee0.png',
    bee1: 'sprites/bee1.png',  

}

const BACKGROUNDS = {
    bgroom : 'bg/bgroom.png'
}

const FONTS = {
    kimbab : 'fonts/Kimbab.ttf'
}

export async function preloadAll(){
    const tasks = [];
    // SPRITES
    for(const [key, value] of Object.entries(SPRITES)) tasks.push(k.loadSprite(key,value));

    // BGs
    for(const [key, value] of Object.entries(BACKGROUNDS)) tasks.push(k.loadSprite(key,value));

    // FONTS
    for(const [key, value] of Object.entries(FONTS)) tasks.push(k.loadFont(key, value));

    await Promise.all(tasks);
}