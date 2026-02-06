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
            banner: '/images/banners/yugioh.jpg',
            logo: '/images/game-icons/yugioh.png',
            sidebarIcon: '/images/game-icons/yugioh.png',
        },
        {
            title: "Magic: The Gathering",
            slug: "magic-the-gathering",
            banner: '/images/banners/mtg.jpg',
            logo: '/images/game-icons/mtg.png',
            sidebarIcon: '/images/game-icons/mtg.png',
        },
        {
            title: "Shadowverse",
            slug: "shadowverse",
            banner: '/images/banners/shadowverse.jpg',
            logo: '/images/game-icons/shadowverse.png',
            sidebarIcon: '/images/game-icons/shadowverse.png',
        },
        {
            title: "Riftbound",
            slug: "riftbound",
            banner: '/images/banners/riftbound.jpg',
            logo: '/images/game-icons/riftbound.png',
            sidebarIcon: '/images/game-icons/riftbound.png',
        },
        {
            title: "Parallel",
            slug: "parallel",
            banner: '/images/banners/parallel.jpg',
            logo: '/images/game-icons/parallel.png',
            sidebarIcon: '/images/game-icons/parallel.png',
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
