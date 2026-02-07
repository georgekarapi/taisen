export interface Game {
    title: string;
    slug: string;
    banner: string;
    logo: string;
    sidebarIcon?: string;
}

export const useGames = () => {
    const games = [
        {
            title: "Yu-gi-oh!",
            slug: "yu-gi-oh",
            banner: '/images/banners/yugioh.webp',
            logo: '/images/game-icons/yugioh.webp'
        },
        {
            title: "Magic: The Gathering",
            slug: "magic-the-gathering",
            banner: '/images/banners/mtg.webp',
            logo: '/images/game-icons/mtg.webp'
        },
        {
            title: "Shadowverse",
            slug: "shadowverse",
            banner: '/images/banners/shadowverse.webp',
            logo: '/images/game-icons/shadowverse.webp'
        },
        {
            title: "Riftbound",
            slug: "riftbound",
            banner: '/images/banners/riftbound.webp',
            logo: '/images/game-icons/riftbound.webp'
        }
    ];

    const getGameBySlug = (slug: string) => {
        return games.find((game) => game.slug === slug);
    };

    return {
        games,
        getGameBySlug,
    };
};
