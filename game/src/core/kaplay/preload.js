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
    panel1: 'sprites/panel1.png',
    honey: 'sprites/honey.png',
    cheese1 : 'sprites/cheese1.png',
    cheese2 : 'sprites/cheese2.png',
    clock : 'sprites/clock.png'

}

const BACKGROUNDS = {
    bgroom : 'bg/bgroom.png'
}

const FONTS = {
    kimbab : 'fonts/Kimbab.ttf',
    steve :  'fonts/Steve.ttf'
}

const MUS = {
    puzzles : 'mus/puzzles.ogg',
    sweet : 'mus/sweet.ogg',
    booty : 'mus/booty.ogg',
    party : 'mus/party.ogg'
}

const SFX = {
    cat1 : 'sfx/cat1.ogg',
    cat2 : 'sfx/cat2.ogg',
    coin3 : 'sfx/coin3.wav',
    combo : 'sfx/combo.wav',
    perf : 'sfx/perf.wav',
    ticktock: 'sfx/ticktock.wav',
}

export async function preloadAll(){
    const tasks = [];
    // SPRITES
    for(const [key, value] of Object.entries(SPRITES)) tasks.push(k.loadSprite(key,value));

    // BGs
    for(const [key, value] of Object.entries(BACKGROUNDS)) tasks.push(k.loadSprite(key,value));

    // FONTS
    for(const [key, value] of Object.entries(FONTS)) tasks.push(k.loadFont(key, value));

    // MUS
    for(const [key, value] of Object.entries(MUS)) tasks.push(k.loadSound(key, value));

    // SFX
    for(const [key, value] of Object.entries(SFX)) tasks.push(k.loadSound(key, value));

    await Promise.all(tasks);
}