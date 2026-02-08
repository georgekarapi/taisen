export interface Game {
    title: string;
    slug: string;
    banner: string;
    logo: string;
    description: string;
    website: string;
}

export const useGames = () => {
    const games: Game[] = [

        {
            title: "Pokemon TCG",
            slug: "pokemon",
            banner: '/images/banners/pokemon.webp', // Placeholder or allow fallback
            logo: '/images/game-icons/pokemon.webp',
            description: 'The Pokémon Trading Card Game is a strategy-based card game played with decks of Pokémon cards. Players battle with their favorite Pokémon, aiming to knock out their opponent\'s Pokémon to take Prize cards and win. First published in 1996, it remains one of the most popular TCGs globally.',
            website: 'https://tcg.pokemon.com/en-us/'
        },
        {
            title: "Riftbound",
            slug: "riftbound",
            banner: '/images/banners/riftbound.webp',
            logo: '/images/game-icons/riftbound.webp',
            description: 'Riftbound is a trading card game by Riot Games set in the League of Legends universe. Players choose a champion and send them alongside armies and spells to conquer battlefields and score points, featuring iconic champions from Runeterra and a unique rune-based resource system.',
            website: 'https://riftbound.leagueoflegends.com/en-us/'
        },
        {
            title: "Magic: The Gathering",
            slug: "magic-the-gathering",
            banner: '/images/banners/mtg.webp',
            logo: '/images/game-icons/mtg.webp',
            description: 'Magic: The Gathering is a collectible card game created by Richard Garfield and published by Wizards of the Coast since 1993. Players take the role of planeswalkers, summoning creatures and casting spells fueled by mana drawn from lands to reduce their opponent\'s life total to zero.',
            website: 'https://magic.wizards.com/en'
        },
        {
            title: "Yu-Gi-Oh!",
            slug: "yu-gi-oh",
            banner: '/images/banners/yugioh.webp',
            logo: '/images/game-icons/yugioh.webp',
            description: 'Yu-Gi-Oh! is a trading card game developed by Konami where two players duel using decks of Monster, Spell, and Trap cards. First released in 1999 and based on the manga by Kazuki Takahashi, it has sold over 25 billion cards worldwide, making it one of the best-selling TCGs in history.',
            website: 'https://www.yugioh-card.com/en/'
        },
        {
            title: "Shadowverse: Evolve",
            slug: "shadowverse",
            banner: '/images/banners/shadowverse.webp',
            logo: '/images/game-icons/shadowverse.webp',
            description: 'Shadowverse: Evolve is a competitive TCG by Bushiroad based on the digital card game Shadowverse. Players battle as one of six classes, summoning followers and casting spells with a standout Evolve mechanic that lets you power up units mid-game for dramatic turns.',
            website: 'https://en.shadowverse-evolve.com/'
        },
    ];

    const getGameBySlug = (slug: string) => {
        return games.find((game) => game.slug === slug);
    };

    return {
        games,
        getGameBySlug,
    };
};
